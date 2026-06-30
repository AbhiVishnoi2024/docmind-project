from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
from app.api import deps
from app.models.assessment import Summary, Quiz, StudyQuestion
from app.models.document import Document
from app.services.vector_db import ChromaVectorDB
from app.services.gemini_service import GeminiAIService

router = APIRouter()
vector_db = ChromaVectorDB()
gemini_service = GeminiAIService()

def get_document_chunks(doc_id: str) -> List[str]:
    collection = vector_db.get_or_create_collection(doc_id)
    data = collection.peek(limit=15)
    if not data or not data['documents']:
        raise HTTPException(status_code=404, detail="Document chunks index layer is vacant.")
    return data['documents']

@router.post("/summary/{document_id}")
def generate_document_summary(document_id: str, current_user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Generates an automated executive summary and caches it in PostgreSQL to save token costs."""
    existing = db.query(Summary).filter(Summary.document_id == document_id).first()
    if existing:
        return {"document_id": document_id, "summary_text": existing.summary_text}

    chunks = get_document_chunks(document_id)
    summary_text = gemini_service.generate_summary(chunks)
    
    new_summary = Summary(document_id=document_id, summary_text=summary_text)
    db.add(new_summary)
    db.commit()
    return {"document_id": document_id, "summary_text": summary_text}

@router.post("/quiz/{document_id}")
def generate_document_quiz(document_id: str, current_user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Generates a multiple choice quiz based on document text and outputs structured JSON data."""
    existing = db.query(Quiz).filter(Quiz.document_id == document_id).first()
    if existing:
        return {"document_id": document_id, "quiz_data": existing.quiz_data}

    chunks = get_document_chunks(document_id)
    raw_json = gemini_service.generate_quiz(chunks)
    try:
        parsed_data = json.loads(raw_json)
    except Exception:
        raise HTTPException(status_code=500, detail="AI produced an invalid structured JSON object.")

    new_quiz = Quiz(document_id=document_id, quiz_data=parsed_data)
    db.add(new_quiz)
    db.commit()
    return {"document_id": document_id, "quiz_data": parsed_data}

@router.post("/questions/{document_id}/{level}")
def generate_tiered_questions(document_id: str, level: str, current_user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Generates tiered study questions matching specific educational difficulty settings."""
    if level not in ["beginner", "intermediate", "advanced"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty categorization mapping.")
        
    existing = db.query(StudyQuestion).filter(StudyQuestion.document_id == document_id, StudyQuestion.level == level).all()
    if existing:
        return [{"question_text": q.question_text, "ideal_answer": q.ideal_answer} for q in existing]

    chunks = get_document_chunks(document_id)
    raw_json = gemini_service.generate_study_questions(chunks, level)
    try:
        parsed_questions = json.loads(raw_json)
    except Exception:
         raise HTTPException(status_code=500, detail="AI structural format fault mapping array rows.")

    saved_objects = []
    for q in parsed_questions:
        sq = StudyQuestion(document_id=document_id, level=level, question_text=q["question_text"], ideal_answer=q["ideal_answer"])
        db.add(sq)
        saved_objects.append(sq)
        
    db.commit()
    return [{"question_text": q.question_text, "ideal_answer": q.ideal_answer} for q in saved_objects]
