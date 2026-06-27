import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy import Column, DateTime, Uuid

class Base(DeclarativeBase):
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    created_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    
    # Automatically generate table names in lowercase
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
