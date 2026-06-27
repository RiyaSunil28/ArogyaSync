from app.repositories.auth import user_repo
from app.repositories.patient import patient_repo
from app.repositories.consultation import consultation_repo
from app.repositories.prescription import prescription_repo
from app.repositories.vaccination import vaccination_repo
from app.repositories.sync import sync_queue_repo

__all__ = [
    "user_repo",
    "patient_repo",
    "consultation_repo",
    "prescription_repo",
    "vaccination_repo",
    "sync_queue_repo"
]
