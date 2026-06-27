from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate

class CRUDPrescription(CRUDBase[Prescription, PrescriptionCreate, PrescriptionUpdate]):
    def get_by_consultation(self, db: Session, *, consultation_id: UUID) -> List[Prescription]:
        """
        Retrieve all prescriptions associated with a specific consultation.
        """
        return (
            db.query(self.model)
            .filter(self.model.consultation_id == consultation_id)
            .all()
        )

prescription_repo = CRUDPrescription(Prescription, entity_type="prescription")
