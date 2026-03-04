from pydantic import BaseModel
from typing import Optional

class QuestionRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None
