from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.repositories.patient import patient_repo
from app.repositories.consultation import consultation_repo
from app.repositories.prescription import prescription_repo
from app.repositories.vaccination import vaccination_repo

from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.prescription import Prescription
from app.models.vaccination import Vaccination

from app.schemas.patient import PatientCreate, PatientUpdate
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate

class PatientService:
    def get_patient(self, db: Session, patient_id: UUID) -> Optional[Patient]:
        return patient_repo.get(db, id=patient_id)

    def get_patients(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Patient]:
        return patient_repo.get_multi(db, skip=skip, limit=limit)

    def create_patient(self, db: Session, *, obj_in: PatientCreate) -> Patient:
        db_obj = patient_repo.create(db, obj_in=obj_in)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_patient(self, db: Session, *, patient_id: UUID, obj_in: PatientUpdate) -> Optional[Patient]:
        db_obj = patient_repo.get(db, id=patient_id)
        if not db_obj:
            return None
        updated_obj = patient_repo.update(db, db_obj=db_obj, obj_in=obj_in)
        db.commit()
        db.refresh(updated_obj)
        return updated_obj

    def delete_patient(self, db: Session, *, patient_id: UUID) -> Optional[Patient]:
        db_obj = patient_repo.get(db, id=patient_id)
        if not db_obj:
            return None
        deleted_obj = patient_repo.remove(db, id=patient_id)
        db.commit()
        return deleted_obj

    def search_patients(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> List[Patient]:
        return patient_repo.search_by_name(db, name=query, skip=skip, limit=limit)


class ConsultationService:
    def get_consultation(self, db: Session, consultation_id: UUID) -> Optional[Consultation]:
        return consultation_repo.get(db, id=consultation_id)

    def get_consultations(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Consultation]:
        return consultation_repo.get_multi(db, skip=skip, limit=limit)

    def get_patient_consultations(self, db: Session, *, patient_id: UUID, skip: int = 0, limit: int = 100) -> List[Consultation]:
        return consultation_repo.get_by_patient(db, patient_id=patient_id, skip=skip, limit=limit)

    def create_consultation(self, db: Session, *, obj_in: ConsultationCreate) -> Consultation:
        db_obj = consultation_repo.create(db, obj_in=obj_in)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_consultation(self, db: Session, *, consultation_id: UUID, obj_in: ConsultationUpdate) -> Optional[Consultation]:
        db_obj = consultation_repo.get(db, id=consultation_id)
        if not db_obj:
            return None
        updated_obj = consultation_repo.update(db, db_obj=db_obj, obj_in=obj_in)
        db.commit()
        db.refresh(updated_obj)
        return updated_obj

    def delete_consultation(self, db: Session, *, consultation_id: UUID) -> Optional[Consultation]:
        db_obj = consultation_repo.get(db, id=consultation_id)
        if not db_obj:
            return None
        deleted_obj = consultation_repo.remove(db, id=consultation_id)
        db.commit()
        return deleted_obj


class PrescriptionService:
    def get_prescription(self, db: Session, prescription_id: UUID) -> Optional[Prescription]:
        return prescription_repo.get(db, id=prescription_id)

    def get_consultation_prescriptions(self, db: Session, *, consultation_id: UUID) -> List[Prescription]:
        return prescription_repo.get_by_consultation(db, consultation_id=consultation_id)

    def create_prescription(self, db: Session, *, obj_in: PrescriptionCreate) -> Prescription:
        db_obj = prescription_repo.create(db, obj_in=obj_in)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_prescription(self, db: Session, *, prescription_id: UUID, obj_in: PrescriptionUpdate) -> Optional[Prescription]:
        db_obj = prescription_repo.get(db, id=prescription_id)
        if not db_obj:
            return None
        updated_obj = prescription_repo.update(db, db_obj=db_obj, obj_in=obj_in)
        db.commit()
        db.refresh(updated_obj)
        return updated_obj

    def delete_prescription(self, db: Session, *, prescription_id: UUID) -> Optional[Prescription]:
        db_obj = prescription_repo.get(db, id=prescription_id)
        if not db_obj:
            return None
        deleted_obj = prescription_repo.remove(db, id=prescription_id)
        db.commit()
        return deleted_obj


class VaccinationService:
    def get_vaccination(self, db: Session, vaccination_id: UUID) -> Optional[Vaccination]:
        return vaccination_repo.get(db, id=vaccination_id)

    def get_patient_vaccinations(self, db: Session, *, patient_id: UUID) -> List[Vaccination]:
        return vaccination_repo.get_by_patient(db, patient_id=patient_id)

    def create_vaccination(self, db: Session, *, obj_in: VaccinationCreate) -> Vaccination:
        db_obj = vaccination_repo.create(db, obj_in=obj_in)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_vaccination(self, db: Session, *, vaccination_id: UUID, obj_in: VaccinationUpdate) -> Optional[Vaccination]:
        db_obj = vaccination_repo.get(db, id=vaccination_id)
        if not db_obj:
            return None
        updated_obj = vaccination_repo.update(db, db_obj=db_obj, obj_in=obj_in)
        db.commit()
        db.refresh(updated_obj)
        return updated_obj

    def delete_vaccination(self, db: Session, *, vaccination_id: UUID) -> Optional[Vaccination]:
        db_obj = vaccination_repo.get(db, id=vaccination_id)
        if not db_obj:
            return None
        deleted_obj = vaccination_repo.remove(db, id=vaccination_id)
        db.commit()
        return deleted_obj


patient_service = PatientService()
consultation_service = ConsultationService()
prescription_service = PrescriptionService()
vaccination_service = VaccinationService()
