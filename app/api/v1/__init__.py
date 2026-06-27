from fastapi import APIRouter
from app.api.v1 import auth, patients, consultations, prescriptions, vaccinations, sync

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["Consultations"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(vaccinations.router, prefix="/vaccinations", tags=["Vaccinations"])
api_router.include_router(sync.router, prefix="/sync", tags=["Sync Engine"])
