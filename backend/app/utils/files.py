import uuid
import os
from pathlib import Path
from app.logger import logger

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
MAX_FILE_SIZE_MB = 50

UPLOAD_DIR = Path("storage/uploads")
VECTORDB_DIR = Path("storage/vectordb")

def ensure_storage_dirs():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    VECTORDB_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("Storage directories verified.")

def validate_file(filename: str, size_bytes: int) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: .{ext}. Allowed: {ALLOWED_EXTENSIONS}")
    if size_bytes > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.")
    return True

def generate_doc_id() -> str:
    return uuid.uuid4().hex

ensure_storage_dirs()
