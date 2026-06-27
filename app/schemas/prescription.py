from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PrescriptionBase(BaseModel):
    consultation_id: UUID
    medicine_name: str = Field(..., max_length=100)
    dosage: str = Field(..., max_length=50)
    duration: str = Field(..., max_length=50)

class PrescriptionCreate(PrescriptionBase):
    id: Optional[UUID] = None  # Allows client-generated UUIDs for offline syncing

class PrescriptionUpdate(BaseModel):
    medicine_name: Optional[str] = Field(None, max_length=100)
    dosage: Optional[str] = Field(None, max_length=50)
    duration: Optional[str] = Field(None, max_length=50)

class PrescriptionInDBBase(PrescriptionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Prescription(PrescriptionInDBBase):
    pass

class PrescriptionList(BaseModel):
    items: List[Prescription]
    total: int
