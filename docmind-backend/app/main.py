from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine
from app.database.base_class import Base

# Import all database models to ensure they register correctly with the metadata layer
from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatHistory
from app.models.assessment import Summary, Quiz, StudyQuestion

# Automatically initialize and create all relational tables in PostgreSQL on startup
Base.metadata.create_all(bind=engine)

# Import our API routes
from app.api.v1 import auth, documents, chat, assessment

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="The complete high-performance orchestration engine for the DocMind AI RAG Chatbot"
)

# Crucial CORS configuration to bridge the gap between Windows React and the Ubuntu Virtual Machine
origins = [
    "http://localhost:3000",
    "[http://127.0.0.1:3000](http://127.0.0.1:3000)",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"], # Allows all HTTP headers (including Authorization tokens)
)

# Connect all modular endpoints to the central application router
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication System"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Document Management Pipelines"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Conversational RAG Modules"])
app.include_router(assessment.router, prefix="/api/v1/assessment", tags=["AI Academic Assessment Generators"])

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "environment": "Ubuntu VirtualBox Verified Tiers Container",
        "message": "Welcome to the DocMind AI System Matrix Backend Engine"
    }
