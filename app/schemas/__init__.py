from app.schemas.auth import User, UserCreate, UserUpdate, Token, TokenPayload
from app.schemas.patient import Patient, PatientCreate, PatientUpdate, PatientList
from app.schemas.consultation import Consultation, ConsultationCreate, ConsultationUpdate, ConsultationList
from app.schemas.prescription import Prescription, PrescriptionCreate, PrescriptionUpdate, PrescriptionList
from app.schemas.vaccination import Vaccination, VaccinationCreate, VaccinationUpdate, VaccinationList
from app.schemas.sync import SyncQueue, SyncQueueCreate, SyncQueueUpdate

__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
    "Token",
    "TokenPayload",
    "Patient",
    "PatientCreate",
    "PatientUpdate",
    "PatientList",
    "Consultation",
    "ConsultationCreate",
    "ConsultationUpdate",
    "ConsultationList",
    "Prescription",
    "PrescriptionCreate",
    "PrescriptionUpdate",
    "PrescriptionList",
    "Vaccination",
    "VaccinationCreate",
    "VaccinationUpdate",
    "VaccinationList",
    "SyncQueue",
    "SyncQueueCreate",
    "SyncQueueUpdate"
]
