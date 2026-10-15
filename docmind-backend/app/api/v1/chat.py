from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.chat import ChatHistory
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.embedding_service import EmbeddingEngine
from app.services.vector_db import ChromaVectorDB
from app.services.gemini_service import GeminiAIService

router = APIRouter()
embed_engine = EmbeddingEngine()
vector_db = ChromaVectorDB()
gemini_service = GeminiAIService()

@router.post("/ask", response_model=ChatResponse)
def ask_document_bot(
    request: ChatRequest, 
    current_user = Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
):
    """Runs a complete RAG workflow: translates queries to vectors, fetches context, and calls Gemini."""
    # 1. Translate user query into a 384-dimensional dense vector array
    query_vector = embed_engine.generate_embedding(request.message)
    
    # 2. Extract semantic document context chunks matching the document reference
    matched_contexts = vector_db.query_similarity(
        doc_id=request.history_id, 
        query_embedding=query_vector, 
        top_k=3
    )
    
    if not matched_contexts:
         raise HTTPException(status_code=404, detail="No source contexts resolved for processing.")

    # 3. Synthesize the context data chunks using Gemini AI
    ai_answer = gemini_service.generate_rag_answer(
        question=request.message, 
        context_chunks=matched_contexts
    )
    
    # 4. Save the transaction logs inside your relational database
    chat_log = ChatHistory(
        user_id=current_user.id, 
        document_id=request.history_id, 
        query=request.message, 
        response=ai_answer
    )
    db.add(chat_log)
    db.commit()
    db.refresh(chat_log)
    
    # 5. Return explicit mapping matching Pydantic schemas ('history_id' and 'answer')
    return ChatResponse(
        history_id=chat_log.document_id,
        answer=chat_log.response
    )

@router.get("/history/{document_id}", response_model=List[ChatResponse])
def get_chat_history(
    document_id: str, 
    current_user = Depends(deps.get_current_user), 
    db: Session = Depends(deps.get_db)
):
    """Fetches previous conversational records for a document to populate the UI."""
    histories = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id, 
        ChatHistory.document_id == document_id
    ).all()
    
    # Proactively map structural database outputs to prevent response shape mismatches
    return [
        ChatResponse(history_id=h.document_id, answer=h.response)
        for h in histories
    ]
