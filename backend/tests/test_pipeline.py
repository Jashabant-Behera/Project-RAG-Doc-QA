import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
import numpy as np
from unittest.mock import MagicMock, patch, AsyncMock

from app.core.pipeline import run_query
from app.vectorstore.faiss import FAISSStore

def make_mock_store():
    store = MagicMock(spec=FAISSStore)
    store.search.return_value = [
        {
            "text": "The capital of France is Paris.",
            "doc_id": "abc123",
            "filename": "sample.pdf",
            "chunk_index": 0,
            "score": 0.91
        }
    ]
    return store

import pytest

@pytest.mark.asyncio
async def test_run_query():
    mock_store = make_mock_store()

    with patch("app.core.pipeline.encode") as mock_encode, \
         patch("app.core.pipeline._get_reranker") as mock_reranker, \
         patch("app.core.pipeline.call_groq", new_callable=AsyncMock) as mock_llm:

        mock_encode.return_value = np.array([[0.1] * 384], dtype=np.float32)
        mock_llm.return_value = "Paris is the capital of France."

        # Mock the reranker: predict returns a score per candidate
        mock_reranker.return_value.predict.return_value = np.array([0.91])

        result = await run_query("What is the capital of France?", mock_store)

        assert result.answer == "Paris is the capital of France."
        assert len(result.sources) == 1
        assert result.sources[0]["doc_id"] == "abc123"
        assert result.sources[0]["score"] == 0.91
        assert "rerank_score" in result.sources[0]   # new field
        print("\ntest_run_query PASSED")
        print(f"Answer: {result.answer}")
        print(f"Sources: {result.sources}")

if __name__ == "__main__":
    asyncio.run(test_run_query())
