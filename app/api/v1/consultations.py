from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.api import deps
from app.models.auth import User
from app.schemas.consultation import Consultation, ConsultationCreate, ConsultationUpdate, ConsultationList
from app.services.core import consultation_service

router = APIRouter()

@router.get("/", response_model=ConsultationList)
def read_consultations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve list of consultations.
    """
    items = consultation_service.get_consultations(db, skip=skip, limit=limit)
    from app.models.consultation import Consultation as ConsultationModel
    total = db.query(ConsultationModel).count()
    return {"items": items, "total": total}

@router.post("/", response_model=Consultation, status_code=status.HTTP_201_CREATED)
def create_consultation(
    *,
    db: Session = Depends(deps.get_db),
    obj_in: ConsultationCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Log a new patient consultation. Supports client-generated UUID for offline operations.
    """
    return consultation_service.create_consultation(db=db, obj_in=obj_in)

@router.get("/{consultation_id}", response_model=Consultation)
def read_consultation(
    consultation_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve specific consultation details.
    """
    consultation = consultation_service.get_consultation(db, consultation_id=consultation_id)
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    return consultation

@router.put("/{consultation_id}", response_model=Consultation)
def update_consultation(
    consultation_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    obj_in: ConsultationUpdate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update details of an existing consultation.
    """
    consultation = consultation_service.update_consultation(db, consultation_id=consultation_id, obj_in=obj_in)
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    return consultation

@router.delete("/{consultation_id}", response_model=Consultation)
def delete_consultation(
    consultation_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a consultation record.
    """
    consultation = consultation_service.delete_consultation(db, consultation_id=consultation_id)
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    return consultation

@router.get("/patient/{patient_id}", response_model=List[Consultation])
def read_patient_consultations(
    patient_id: UUID,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve all consultations associated with a specific patient.
    """
    return consultation_service.get_patient_consultations(
        db, patient_id=patient_id, skip=skip, limit=limit
    )
