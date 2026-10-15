import uuid
from sqlalchemy import String, Column, DateTime
from sqlalchemy.sql import func
from app.database.base_class import Base

class User(Base):
    __tablename__ = "users"

    # We use UUID strings instead of basic integers to prevent user enumeration attacks
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
