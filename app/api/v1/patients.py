from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.api import deps
from app.models.auth import User
from app.schemas.patient import Patient, PatientCreate, PatientUpdate, PatientList
from app.services.core import patient_service

router = APIRouter()

@router.get("/", response_model=PatientList)
def read_patients(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Retrieve patients with optional pagination and name search.
    """
    if search:
        items = patient_service.search_patients(db, query=search, skip=skip, limit=limit)
        total = len(items)  # In a search context, we display the matches count
    else:
        items = patient_service.get_patients(db, skip=skip, limit=limit)
        from app.models.patient import Patient as PatientModel
        total = db.query(PatientModel).count()
        
    return {"items": items, "total": total}

@router.post("/", response_model=Patient, status_code=status.HTTP_201_CREATED)
def create_patient(
    *,
    db: Session = Depends(deps.get_db),
    obj_in: PatientCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Register a new patient. The client can optionally specify a UUID (required for offline workflows).
    """
    return patient_service.create_patient(db=db, obj_in=obj_in)

@router.get("/{patient_id}", response_model=Patient)
def read_patient(
    patient_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get patient details by UUID.
    """
    patient = patient_service.get_patient(db, patient_id=patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient

@router.put("/{patient_id}", response_model=Patient)
def update_patient(
    patient_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    obj_in: PatientUpdate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Update details of an existing patient.
    """
    patient = patient_service.update_patient(db, patient_id=patient_id, obj_in=obj_in)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient

@router.delete("/{patient_id}", response_model=Patient)
def delete_patient(
    patient_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Remove a patient record.
    """
    patient = patient_service.delete_patient(db, patient_id=patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient
