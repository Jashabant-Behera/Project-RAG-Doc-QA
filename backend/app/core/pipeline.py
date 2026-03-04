from app.core.embedder import encode
from app.core.llm import call_ollama
from app.models.response import AnswerResponse
from app.vectorstore.faiss import FAISSStore
from app.config import settings
from app.logger import logger

RAG_PROMPT_TEMPLATE = """You are a helpful assistant. Answer the question using ONLY the context provided below.
If the answer cannot be found in the context, respond with: "I could not find the answer in the provided document."
Do not make up information. Be concise and accurate.

Context:
{context}

Question: {question}

Answer:"""

async def run_query(question: str, store: FAISSStore) -> AnswerResponse:
    logger.info(f"Running query: {question}")

    # Step 1: Embed the question
    query_vector = encode([question])[0]

    # Step 2: Retrieve top-k chunks from FAISS
    results = store.search(query_vector, top_k=settings.TOP_K)

    if not results:
        return AnswerResponse(
            answer="No relevant content found. Please upload a document first.",
            sources=[]
        )

    # Step 3: Build context string from retrieved chunks
    context_parts = []
    for i, result in enumerate(results):
        chunk_text = result.get("text", "")
        if chunk_text:
            context_parts.append(f"[Chunk {i+1}]\n{chunk_text}")

    context = "\n\n".join(context_parts)

    # Fix 3: Truncate context to prevent exceeding LLM token limits
    context = context[:4000]

    # Step 4: Fill the prompt template
    prompt = RAG_PROMPT_TEMPLATE.format(context=context, question=question)
    logger.info(f"Prompt built with {len(context_parts)} chunks, {len(context)} chars.")

    # Step 5: Call LLM
    answer = await call_ollama(prompt)

    # Step 6: Build sources list
    sources = []
    for result in results:
        sources.append({
            "doc_id": result.get("doc_id", ""),
            "filename": result.get("filename", ""),
            "chunk_index": result.get("chunk_index", -1),
            "score": round(result.get("score", 0.0), 4),
            "text": result.get("text", "")[:300]
        })

    logger.info(f"Query complete. Returning answer with {len(sources)} sources.")
    return AnswerResponse(answer=answer, sources=sources)
