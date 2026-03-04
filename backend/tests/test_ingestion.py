import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ingestion.processor import extract_text
from app.core.chunker import chunk_text
from app.core.embedder import encode
from app.vectorstore.faiss import FAISSStore
from app.utils.files import generate_doc_id

def test_full_ingestion_pipeline():
    # Step 1: Extract
    text, metadata = extract_text("tests/sample.pdf")
    assert len(text) > 100, "Extracted text too short"
    assert "filename" in metadata

    # Step 2: Chunk
    doc_id = generate_doc_id()
    chunks = chunk_text(text, doc_id, metadata)
    assert len(chunks) > 0, "No chunks produced"
    assert all("text" in c for c in chunks)
    assert all(len(c["text"]) > 0 for c in chunks)

    # Step 3: Embed
    texts = [c["text"] for c in chunks]
    vectors = encode(texts)
    assert vectors.shape[0] == len(chunks)
    assert vectors.shape[1] == 384  # all-MiniLM-L6-v2 output dim

    # Step 4: Add to FAISS
    store = FAISSStore(dim=384)
    metadatas = [c["metadata"] for c in chunks]
    store.add(vectors, metadatas)
    assert store.index.ntotal == len(chunks)

    # Step 5: Search
    query_vec = encode(["What is this document about?"])[0]
    results = store.search(query_vec, top_k=3)
    assert len(results) > 0
    assert "text" in results[0]
    assert "score" in results[0]
    print(f"\nTop result score: {results[0]['score']:.4f}")
    print(f"Top chunk preview: {results[0]['text'][:200]}")
    print("\nAll assertions passed. Ingestion pipeline is working correctly.")

if __name__ == "__main__":
    test_full_ingestion_pipeline()
