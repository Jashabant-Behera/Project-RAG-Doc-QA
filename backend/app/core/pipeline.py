import threading
from app.core.embedder import encode
from app.core.llm import call_groq
from app.models.response import AnswerResponse
from app.vectorstore.faiss import FAISSStore
from app.config import settings
from app.logger import logger

RAG_PROMPT_TEMPLATE = """You are a helpful assistant answering questions about a document.

Use the context below to answer the question.

Guidelines:
- Prefer information from the provided context.
- If the context contains related information, use it to form the best possible answer.
- If the context does not contain enough information to answer the question, say:
  "I could not find the answer in the provided document."
- Do NOT invent facts that are unrelated to the context.

Context:
{context}

Question:
{question}

Answer:"""

# ---------------------------------------------------------------------------
# Cross-encoder — lazy-loaded with thread safety (same pattern as embedder.py)
# ---------------------------------------------------------------------------
_reranker = None
_reranker_lock = threading.Lock()
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

# Constants are now loaded from settings (RERANK_FETCH_K & RERANK_TOP_N)


def _get_reranker():
    global _reranker
    if _reranker is None:
        with _reranker_lock:
            if _reranker is None:
                logger.info(f"Loading cross-encoder reranker: {RERANKER_MODEL}")
                from sentence_transformers.cross_encoder import CrossEncoder
                _reranker = CrossEncoder(RERANKER_MODEL)
                logger.info("Cross-encoder reranker loaded and ready.")
    return _reranker


def _rerank(question: str, candidates: list[dict]) -> list[dict]:
    """
    Score each (question, chunk_text) pair with the cross-encoder,
    then return candidates sorted by descending relevance score,
    truncated to settings.RERANK_TOP_N.
    """
    reranker = _get_reranker()
    pairs = [(question, c["text"]) for c in candidates]
    scores = reranker.predict(pairs)  # returns a numpy array of floats

    for candidate, score in zip(candidates, scores):
        candidate["rerank_score"] = float(score)

    ranked = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
    top = ranked[:settings.RERANK_TOP_N]

    logger.info(
        f"Reranking: {len(candidates)} candidates → top {len(top)} | "
        f"best score: {top[0]['rerank_score']:.4f}"
    )
    return top


async def run_query(question: str, store: FAISSStore) -> AnswerResponse:
    logger.info(f"Running query: {question}")

    query_vector = encode([question])[0]

    # Step 1: Retrieve a wider candidate pool from FAISS
    candidates = store.search(query_vector, top_k=settings.RERANK_FETCH_K)

    if not candidates:
        return AnswerResponse(
            answer="No relevant content found. Please upload a document first.",
            sources=[]
        )

    # Step 2: Rerank candidates with the cross-encoder, keep top N
    results = _rerank(question, candidates)

    # Step 3: Build context from reranked top results
    context_parts = []
    for i, result in enumerate(results):
        chunk_text = result.get("text", "")
        if chunk_text:
            context_parts.append(f"Document Chunk {i+1}:\n{chunk_text}")

    context = "\n\n".join(context_parts)

    # Truncate aggregated context to comply with maximum token limits for the target LLM
    context = context[:4000]

    prompt = RAG_PROMPT_TEMPLATE.format(context=context, question=question)
    logger.info(f"Prompt built with {len(context_parts)} chunks, {len(context)} chars.")

    answer = await call_groq(prompt, smart=True)

    sources = []
    for result in results:
        sources.append({
            "doc_id": result.get("doc_id", ""),
            "filename": result.get("filename", ""),
            "chunk_index": result.get("chunk_index", -1),
            "score": round(result.get("score", 0.0), 4),
            "rerank_score": round(result.get("rerank_score", 0.0), 4),
            "text": result.get("text", "")[:300]
        })

    logger.info(f"Query complete. Returning answer with {len(sources)} sources.")
    return AnswerResponse(answer=answer, sources=sources)
