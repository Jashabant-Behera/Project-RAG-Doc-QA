import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException

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

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):

    # Step 1: Read and validate
    contents = await file.read()
    try:
        validate_file(file.filename, len(contents))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Step 2: Generate doc_id and save file to disk
    doc_id = generate_doc_id()
    ext = Path(file.filename).suffix
    save_path = UPLOAD_DIR / f"{doc_id}{ext}"

    with open(save_path, "wb") as f:
        f.write(contents)
    logger.info(f"File saved: {save_path}")

    # Step 3: Extract text
    try:
        text, metadata = extract_text(str(save_path))
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Text extraction failed: {str(e)}"
        )

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Document appears to be empty or unreadable."
        )

    # Step 4: Chunk
    chunks = chunk_text(text, doc_id, metadata)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="Document produced no chunks."
        )

    # Step 5: Embed
    texts = [c["text"] for c in chunks]
    vectors = encode(texts)

    # Step 6: Safe FAISS index handling (Fix 2)
    index_path = get_doc_index_path(doc_id)
    store = FAISSStore(dim=vectors.shape[1])

    if (index_path / "index.faiss").exists():
        store.load(str(index_path))
        logger.info(f"Existing index found for {doc_id}, appending.")

    metadatas = [c["metadata"] for c in chunks]
    store.add(vectors, metadatas)
    store.save(str(index_path))

    logger.info(f"Document {doc_id} indexed. Chunks: {len(chunks)}")

    return UploadResponse(
        doc_id=doc_id,
        filename=file.filename,
        chunk_count=len(chunks)
    )
