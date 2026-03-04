from pydantic import BaseModel
from typing import List, Dict, Any

class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    chunk_count: int

class AnswerResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
