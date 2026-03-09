import threading
from typing import List
import numpy as np
import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
from app.config import settings
from app.logger import logger

_model = None
_model_lock = threading.Lock()


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer(settings.EMBEDDING_MODEL)
                logger.info("Embedding model loaded and ready.")
    return _model


def encode(texts: List[str]) -> np.ndarray:
    vectors = _get_model().encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
        batch_size=8,
    )
    return np.array(vectors, dtype=np.float32)
