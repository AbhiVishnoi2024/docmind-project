from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    """Handles new user creation, password hashing, and system validation checks."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = get_password_hash(user_in.password)
    new_user = User(name=user_in.name, email=user_in.email, hashed_password=hashed_pass)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_in: UserUpdate, 
    current_user = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Updates the authenticated user's profile information."""
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.email is not None:
        existing = db.query(User).filter(User.email == user_in.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_in.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/login", response_model=Token)
async def login_user(request: Request, db: Session = Depends(deps.get_db)):
    """Verifies credentials and returns a secure JWT token session.

    Accepts either form-encoded OAuth2 form (`username` + `password`) or JSON
    payload (`email`/`username` + `password`). This keeps compatibility with
    both clients and the frontend.
    """
    content_type = request.headers.get('content-type', '')
    email = None
    password = None

    if 'application/json' in content_type:
        body = await request.json()
        email = body.get('email') or body.get('username')
        password = body.get('password')
    else:
        # attempt to parse form data (covers application/x-www-form-urlencoded)
        form = await request.form()
        email = form.get('username') or form.get('email')
        password = form.get('password')

    if not email or not password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing credentials: email/username and password are required")

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"}
