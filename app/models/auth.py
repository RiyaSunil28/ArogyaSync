from sqlalchemy import Column, String
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"  # Override default name 'user' to avoid database keyword conflicts

    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="DOCTOR", nullable=False)  # DOCTOR, NURSE, ADMIN
