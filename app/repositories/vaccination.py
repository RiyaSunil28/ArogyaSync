from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.vaccination import Vaccination
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate

class CRUDVaccination(CRUDBase[Vaccination, VaccinationCreate, VaccinationUpdate]):
    def get_by_patient(self, db: Session, *, patient_id: UUID) -> List[Vaccination]:
        """
        Retrieve all vaccination records associated with a specific patient.
        """
        return (
            db.query(self.model)
            .filter(self.model.patient_id == patient_id)
            .all()
        )

vaccination_repo = CRUDVaccination(Vaccination, entity_type="vaccination")
