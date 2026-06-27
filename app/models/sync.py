from sqlalchemy import Column, String, Text, DateTime, Uuid
from datetime import datetime, timezone
from app.db.base_class import Base

class SyncQueue(Base):
    __tablename__ = "sync_queue"

    entity_type = Column(String(50), index=True, nullable=False)      # patient, consultation, prescription, vaccination
    entity_id = Column(Uuid, index=True, nullable=False)
    operation_type = Column(String(20), index=True, nullable=False)   # CREATE, UPDATE, DELETE
    sync_status = Column(String(20), default="PENDING", index=True, nullable=False)  # PENDING, SYNCED, FAILED
    timestamp = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    error_message = Column(Text, nullable=True)
