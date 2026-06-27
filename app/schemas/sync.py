from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SyncQueueBase(BaseModel):
    entity_type: str = Field(..., max_length=50)      # patient, consultation, prescription, vaccination
    entity_id: UUID
    operation_type: str = Field(..., max_length=20)   # CREATE, UPDATE, DELETE
    sync_status: str = Field("PENDING", max_length=20) # PENDING, SYNCED, FAILED
    error_message: Optional[str] = None

class SyncQueueCreate(SyncQueueBase):
    pass

class SyncQueueUpdate(BaseModel):
    sync_status: Optional[str] = Field(None, max_length=20)
    error_message: Optional[str] = None

class SyncQueueInDBBase(SyncQueueBase):
    id: UUID
    timestamp: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SyncQueue(SyncQueueInDBBase):
    pass
