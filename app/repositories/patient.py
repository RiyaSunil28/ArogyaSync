from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[Patient, PatientCreate, PatientUpdate]):
    def search_by_name(self, db: Session, *, name: str, skip: int = 0, limit: int = 100) -> List[Patient]:
        """
        Search patients by name using case-insensitive substring matching.
        """
        return (
            db.query(self.model)
            .filter(self.model.name.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

patient_repo = CRUDPatient(Patient, entity_type="patient")
