from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate

class CRUDConsultation(CRUDBase[Consultation, ConsultationCreate, ConsultationUpdate]):
    def get_by_patient(self, db: Session, *, patient_id: UUID, skip: int = 0, limit: int = 100) -> List[Consultation]:
        """
        Retrieve all consultations associated with a specific patient.
        """
        return (
            db.query(self.model)
            .filter(self.model.patient_id == patient_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

consultation_repo = CRUDConsultation(Consultation, entity_type="consultation")
