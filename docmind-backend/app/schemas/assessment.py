from pydantic import BaseModel
from typing import List, Dict, Any

class SummaryResponse(BaseModel):
    document_id: str
    summary_text: str
    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    document_id: str
    quiz_data: List[Dict[str, Any]]
    class Config:
        from_attributes = True

class StudyQuestionResponse(BaseModel):
    id: str
    document_id: str
    level: str
    question_text: str
    ideal_answer: str
    class Config:
        from_attributes = True
