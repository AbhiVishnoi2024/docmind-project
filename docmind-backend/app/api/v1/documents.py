from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.pdf_processor import PDFProcessorService
from app.services.embedding_service import EmbeddingEngine
from app.services.vector_db import ChromaVectorDB
import os
import uuid

router = APIRouter()
pdf_service = PDFProcessorService()
embed_engine = EmbeddingEngine()
vector_db = ChromaVectorDB()

@router.post("/upload", response_model=DocumentResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Processes uploaded files, extracts text, generates embeddings, and indexes them in ChromaDB."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid format. PDF context only.")
    
    doc_id = str(uuid.uuid4())
    os.makedirs("./storage/pdfs", exist_ok=True)
    file_path = os.path.join("./storage/pdfs", f"{doc_id}.pdf")

    # Streams raw uploaded file bytes to storage
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        # Run text extraction, logical chunking, and vector indexing pipelines
        extracted_pages = pdf_service.extract_text_by_page(file_path)
        chunks = pdf_service.chunk_text(extracted_pages)
        if chunks:
            raw_texts = [c["text"] for c in chunks]
            embeddings = embed_engine.generate_batch_embeddings(raw_texts)
            vector_db.add_chunks(doc_id=doc_id, chunks=chunks, embeddings=embeddings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing execution error: {str(e)}")

    db_doc = Document(id=doc_id, user_id=current_user.id, file_name=file.filename, file_path=file_path, status="processed")
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@router.get("/", response_model=List[DocumentResponse])
def get_user_documents(current_user=Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    """Fetches uploaded document listings for the authenticated user."""
    return db.query(Document).filter(Document.user_id == current_user.id).all()
