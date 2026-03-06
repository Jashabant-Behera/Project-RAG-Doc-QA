from typing import List
import numpy as np
import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
from app.config import settings
from app.logger import logger

# ✅ FIX: Load model eagerly at module import time, not on first request.
# This moves the ~3-5s model load cost to server startup instead of
# blocking the first user upload.
logger.info(f"Loading embedding model at startup: {settings.EMBEDDING_MODEL}")
from sentence_transformers import SentenceTransformer
_model = SentenceTransformer(settings.EMBEDDING_MODEL)
logger.info("Embedding model loaded and ready.")


def encode(texts: List[str]) -> np.ndarray:
    vectors = _model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors, dtype=np.float32)
