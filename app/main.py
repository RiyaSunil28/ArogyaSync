from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import api_router
from app.db.base import Base
from app.db.session import local_engine
from app.services.background_sync import start_background_sync

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Offline-First Primary Health Centre (PHC) Management System with SQLite-to-PostgreSQL synchronization",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS middleware (essential for web client interfaces accessing locally hosted API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    """
    On startup, automatically create SQLite tables if they do not exist.
    This ensures smooth offline-first developer and deployment initialization.
    """
    Base.metadata.create_all(bind=local_engine)
    start_background_sync()

@app.get("/")
def root_route():
    return {
        "message": "Welcome to the Offline-First PHC Management System API",
        "docs_url": "/docs",
        "project_name": settings.PROJECT_NAME
    }
