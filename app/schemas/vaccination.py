from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class VaccinationBase(BaseModel):
    patient_id: UUID
    vaccine_name: str = Field(..., max_length=100)
    vaccination_date: date
    status: str = Field(..., max_length=50)  # PENDING, COMPLETED, OVERDUE

class VaccinationCreate(VaccinationBase):
    id: Optional[UUID] = None  # Allows client-generated UUIDs for offline syncing

class VaccinationUpdate(BaseModel):
    vaccine_name: Optional[str] = Field(None, max_length=100)
    vaccination_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)

class VaccinationInDBBase(VaccinationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Vaccination(VaccinationInDBBase):
    pass

class VaccinationList(BaseModel):
    items: List[Vaccination]
    total: int
