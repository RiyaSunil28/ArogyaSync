from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.auth import User
from app.schemas.auth import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """
        Retrieve a user record by username.
        """
        return db.query(self.model).filter(self.model.username == username).first()

user_repo = CRUDUser(User)
