from typing import List
import numpy as np
from app.config import settings
from app.logger import logger

_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded.")
    return _model

def encode(texts: List[str]) -> np.ndarray:
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors, dtype=np.float32)
