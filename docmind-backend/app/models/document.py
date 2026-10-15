import uuid
from sqlalchemy import String, Column, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base_class import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    # The ForeignKey links each document to a specific user. ondelete="CASCADE" ensures 
    # that if a user deletes their account, all their uploaded documents are cleaned up automatically.
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="processed")
