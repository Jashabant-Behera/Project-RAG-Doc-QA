import faiss
import numpy as np
import pickle
from pathlib import Path
from typing import List
from app.logger import logger

class FAISSStore:
    def __init__(self, dim: int = 384):
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.metadata: List[dict] = []

    def add(self, vectors: np.ndarray, metadatas: List[dict]):
        if vectors.shape[0] != len(metadatas):
            raise ValueError("Vectors and metadata count must match.")
        self.index.add(vectors)
        self.metadata.extend(metadatas)
        logger.info(f"Added {len(metadatas)} vectors. Total: {self.index.ntotal}")

    def search(self, query_vec: np.ndarray, top_k: int) -> List[dict]:
        if self.index.ntotal == 0:
            raise ValueError("FAISS index is empty. Upload a document first.")
        query_vec = np.array([query_vec], dtype=np.float32)
        scores, indices = self.index.search(query_vec, top_k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            result = dict(self.metadata[idx])
            result["score"] = float(score)
            results.append(result)
        return results

    def save(self, path: str):
        p = Path(path)
        faiss.write_index(self.index, str(p / "index.faiss"))
        with open(p / "metadata.pkl", "wb") as f:
            pickle.dump(self.metadata, f)
        logger.info(f"FAISS index saved to {path}")

    def load(self, path: str):
        p = Path(path)
        self.index = faiss.read_index(str(p / "index.faiss"))
        with open(p / "metadata.pkl", "rb") as f:
            self.metadata = pickle.load(f)
        logger.info(f"FAISS index loaded from {path}. Total vectors: {self.index.ntotal}")
