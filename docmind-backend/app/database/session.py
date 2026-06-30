from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine instantiation with performance pooling configurations
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, 
    pool_size=10,       
    max_overflow=20     
)

# Session factory for producing clean database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
