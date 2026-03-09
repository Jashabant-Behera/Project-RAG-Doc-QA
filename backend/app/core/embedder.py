from typing import List
import numpy as np
import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
from app.config import settings
from app.logger import logger

# Initialize the embedding model globally at import time.
# This ensures the model resides in memory before the first request, avoiding a cold-start overhead.
logger.info(f"Loading embedding model at startup: {settings.EMBEDDING_MODEL}")
from sentence_transformers import SentenceTransformer
_model = SentenceTransformer(settings.EMBEDDING_MODEL)
logger.info("Embedding model loaded and ready.")


def encode(texts: List[str]) -> np.ndarray:
    vectors = _model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors, dtype=np.float32)
