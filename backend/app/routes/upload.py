import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

from app.utils.files import (
    validate_file, generate_doc_id,
    get_doc_index_path, UPLOAD_DIR
)
from app.ingestion.processor import extract_text
from app.core.chunker import chunk_text
from app.core.embedder import encode
from app.vectorstore.faiss import FAISSStore
from app.models.response import UploadResponse
from app.logger import logger

router = APIRouter()

# In-memory persistence for async job statuses.
_job_status: dict[str, dict] = {}


class JobStatusResponse(BaseModel):
    doc_id: str
    status: str          # "processing" | "ready" | "error"
    message: Optional[str] = None
    filename: Optional[str] = None
    chunk_count: Optional[int] = None


def _index_document(doc_id: str, save_path: str, filename: str):
    """Asynchronous worker function for extracting, chunking, embedding, and indexing a document."""
    try:
        _job_status[doc_id] = {"status": "processing", "filename": filename}

        text, metadata = extract_text(save_path)
        if not text.strip():
            _job_status[doc_id] = {"status": "error", "message": "Document appears empty or unreadable."}
            return

        chunks = chunk_text(text, doc_id, metadata)
        if not chunks:
            _job_status[doc_id] = {"status": "error", "message": "Document produced no chunks."}
            return

        texts = [c["text"] for c in chunks]
        vectors = encode(texts)

        index_path = get_doc_index_path(doc_id)
        store = FAISSStore(dim=vectors.shape[1])
        if (index_path / "index.faiss").exists():
            store.load(str(index_path))
            logger.info(f"Existing index found for {doc_id}, appending.")
        metadatas = [c["metadata"] for c in chunks]
        store.add(vectors, metadatas)
        store.save(str(index_path))

        _job_status[doc_id] = {
            "status": "ready",
            "filename": filename,
            "chunk_count": len(chunks),
        }
        logger.info(f"Background indexing complete for {doc_id}. Chunks: {len(chunks)}")

    except Exception as e:
        logger.error(f"Background indexing failed for {doc_id}: {e}")
        _job_status[doc_id] = {"status": "error", "message": str(e)}


@router.post("/upload", response_model=JobStatusResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    contents = await file.read()
    try:
        validate_file(file.filename, len(contents))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    doc_id = generate_doc_id()
    ext = Path(file.filename).suffix
    save_path = UPLOAD_DIR / f"{doc_id}{ext}"
    with open(save_path, "wb") as f:
        f.write(contents)
    logger.info(f"File saved: {save_path}")

    # Offload computation to background thread
    background_tasks.add_task(_index_document, doc_id, str(save_path), file.filename)

    return JobStatusResponse(
        doc_id=doc_id,
        status="processing",
        filename=file.filename,
    )


@router.get("/upload/status/{doc_id}", response_model=JobStatusResponse)
async def get_upload_status(doc_id: str):
    """
    Retrieves the status of an asynchronous document indexing job.
    """
    job = _job_status.get(doc_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"No job found for doc_id '{doc_id}'.")
    return JobStatusResponse(doc_id=doc_id, **job)
