from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import LocalSessionLocal
from app.core.jwt import decode_access_token
from app.models.auth import User
from app.repositories.auth import user_repo

# OAuth2 scheme configures Swagger documentation to use standard Bearer Token auth
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to provide a thread-safe local database session (SQLite).
    Ensures the session is correctly closed after request execution.
    """
    db = LocalSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Extracts, decodes, and validates JWT credentials, returning the active User model.
    Throws a 401 Unauthorized exception if validation fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None or token_data.sub is None:
        raise credentials_exception
        
    import uuid
    try:
        user_id = uuid.UUID(token_data.sub)
    except ValueError:
        raise credentials_exception
        
    user = user_repo.get(db, id=user_id)
    if not user:
        raise credentials_exception
    return user
