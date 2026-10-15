import uuid
from sqlalchemy import String, Column, ForeignKey, Text, JSON
from app.database.base_class import Base

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary_text = Column(Text, nullable=False)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    quiz_data = Column(JSON, nullable=False)  # Stores the questions as a structured JSON object

class StudyQuestion(Base):
    __tablename__ = "study_questions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    level = Column(String, nullable=False)  # beginner, intermediate, advanced
    question_text = Column(Text, nullable=False)
    ideal_answer = Column(Text, nullable=False)
