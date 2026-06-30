from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.schemas.user import TokenData

# Defines the location where FastAPI will look to extract authentication tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator:
    """Yields a database session transactional context per request, then safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Intercepts requests to verify JWT claims and return the authenticated user identity."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND if status.HTTP_401_UNAUTHORIZED else status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Cryptographically parse and check signature validity
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Safeguard: Explicitly cast to integer if your User ID model uses sequential integers 
        # to prevent PostgreSQL from throwing a Character Varying type mismatch error.
        try:
            processed_id = int(user_id) if user_id.isdigit() else user_id
        except ValueError:
            processed_id = user_id

        token_data = TokenData(user_id=processed_id)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user
