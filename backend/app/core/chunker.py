from typing import List
from app.config import settings
from app.logger import logger

def chunk_text(text: str, doc_id: str, metadata: dict) -> List[dict]:
    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP
    chunks = []
    start = 0
    index = 0

    while start < len(text):
        end = start + chunk_size
        chunk_text_slice = text[start:end].strip()

        if chunk_text_slice:
            chunks.append({
                "text": chunk_text_slice,
                "chunk_index": index,
                "doc_id": doc_id,
                "metadata": {
                    "text": chunk_text_slice,
                    "filename": metadata.get("filename", ""),
                    "file_type": metadata.get("file_type", ""),
                    "page_count": metadata.get("page_count", 0),
                    "doc_id": doc_id,
                    "chunk_index": index,
                    "char_start": start,
                    "char_end": end
                }
            })
            index += 1

        start += chunk_size - overlap

    logger.info(f"Chunked doc {doc_id} into {len(chunks)} chunks.")
    return chunks
