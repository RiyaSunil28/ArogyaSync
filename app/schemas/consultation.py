from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ConsultationBase(BaseModel):
    patient_id: UUID
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    doctor_notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    id: Optional[UUID] = None  # Allows client-generated UUIDs for offline syncing

class ConsultationUpdate(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    doctor_notes: Optional[str] = None

class ConsultationInDBBase(ConsultationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Consultation(ConsultationInDBBase):
    pass

class ConsultationList(BaseModel):
    items: List[Consultation]
    total: int
