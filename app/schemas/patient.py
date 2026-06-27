from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PatientBase(BaseModel):
    name: str = Field(..., max_length=100)
    age: int = Field(..., ge=0, le=150)
    gender: str = Field(..., max_length=20)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)

class PatientCreate(PatientBase):
    id: Optional[UUID] = None  # Allows client-generated UUIDs for offline syncing

class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)

class PatientInDBBase(PatientBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Patient(PatientInDBBase):
    pass

class PatientList(BaseModel):
    items: List[Patient]
    total: int
