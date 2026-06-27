from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.api import deps
from app.models.auth import User
from app.schemas.vaccination import Vaccination, VaccinationCreate, VaccinationUpdate
from app.services.core import vaccination_service

router = APIRouter()

@router.post("/", response_model=Vaccination, status_code=status.HTTP_201_CREATED)
def create_vaccination(
    *,
    db: Session = Depends(deps.get_db),
    obj_in: VaccinationCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Log a new patient vaccination record. Supports client-generated UUID for offline operations.
    """
    return vaccination_service.create_vaccination(db=db, obj_in=obj_in)

@router.get("/{vaccination_id}", response_model=Vaccination)
def read_vaccination(
    vaccination_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve specific vaccination details.
    """
    vaccination = vaccination_service.get_vaccination(db, vaccination_id=vaccination_id)
    if not vaccination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccination record not found"
        )
    return vaccination

@router.put("/{vaccination_id}", response_model=Vaccination)
def update_vaccination(
    vaccination_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    obj_in: VaccinationUpdate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update an existing vaccination record.
    """
    vaccination = vaccination_service.update_vaccination(db, vaccination_id=vaccination_id, obj_in=obj_in)
    if not vaccination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccination record not found"
        )
    return vaccination

@router.delete("/{vaccination_id}", response_model=Vaccination)
def delete_vaccination(
    vaccination_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a vaccination record.
    """
    vaccination = vaccination_service.delete_vaccination(db, vaccination_id=vaccination_id)
    if not vaccination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccination record not found"
        )
    return vaccination

@router.get("/patient/{patient_id}", response_model=List[Vaccination])
def read_patient_vaccinations(
    patient_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get all vaccination records associated with a specific patient.
    """
    return vaccination_service.get_patient_vaccinations(db, patient_id=patient_id)
