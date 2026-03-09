from pathlib import Path
from fastapi import APIRouter, HTTPException

from app.models.request import QuestionRequest
from app.models.response import AnswerResponse
from app.vectorstore.faiss import FAISSStore
from app.core.pipeline import run_query
from app.utils.files import VECTORDB_DIR
from app.logger import logger

router = APIRouter()

@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):

    if not request.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    if not request.doc_id:
        raise HTTPException(
            status_code=400,
            detail="doc_id is required. Upload a document first and use its doc_id."
        )

    index_path = VECTORDB_DIR / request.doc_id
    if not index_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"No index found for doc_id '{request.doc_id}'. "
                   "Please upload the document again."
        )

    try:
        store = FAISSStore()
        store.load(str(index_path))
    except Exception as e:
        logger.error(f"Failed to load FAISS index: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to load document index."
        )

    try:
        result = await run_query(question=request.question, store=store)
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question."
        )

    return result
