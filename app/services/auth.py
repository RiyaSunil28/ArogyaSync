from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.auth import user_repo
from app.models.auth import User
from app.schemas.auth import UserCreate
from app.core.security import get_password_hash, verify_password

class AuthService:
    def authenticate(self, db: Session, *, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user by username and password. Returns the User model if valid, else None.
        """
        user = user_repo.get_by_username(db, username=username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Create a new user/doctor account, ensuring username uniqueness and hashing the password.
        """
        existing_user = user_repo.get_by_username(db, username=obj_in.username)
        if existing_user:
            raise ValueError("Username already registered")
            
        hashed_password = get_password_hash(obj_in.password)
        db_obj = User(
            username=obj_in.username,
            hashed_password=hashed_password,
            full_name=obj_in.full_name,
            role=obj_in.role
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

auth_service = AuthService()
