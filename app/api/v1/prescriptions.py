from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.api import deps
from app.models.auth import User
from app.schemas.prescription import Prescription, PrescriptionCreate, PrescriptionUpdate
from app.services.core import prescription_service

router = APIRouter()

@router.post("/", response_model=Prescription, status_code=status.HTTP_201_CREATED)
def create_prescription(
    *,
    db: Session = Depends(deps.get_db),
    obj_in: PrescriptionCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Issue a new prescription. Supports client-generated UUID for offline operations.
    """
    return prescription_service.create_prescription(db=db, obj_in=obj_in)

@router.get("/{prescription_id}", response_model=Prescription)
def read_prescription(
    prescription_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Fetch a prescription record by ID.
    """
    prescription = prescription_service.get_prescription(db, prescription_id=prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    return prescription

@router.put("/{prescription_id}", response_model=Prescription)
def update_prescription(
    prescription_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    obj_in: PrescriptionUpdate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Modify an existing prescription.
    """
    prescription = prescription_service.update_prescription(db, prescription_id=prescription_id, obj_in=obj_in)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    return prescription

@router.delete("/{prescription_id}", response_model=Prescription)
def delete_prescription(
    prescription_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a prescription record.
    """
    prescription = prescription_service.delete_prescription(db, prescription_id=prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    return prescription

@router.get("/consultation/{consultation_id}", response_model=List[Prescription])
def read_consultation_prescriptions(
    consultation_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get all prescriptions associated with a specific consultation.
    """
    return prescription_service.get_consultation_prescriptions(db, consultation_id=consultation_id)
