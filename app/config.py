import os
from pydantic import BaseModel, field_validator, model_validator
from pydantic_settings import BaseSettings
from typing import Optional, List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "Offline-First PHC Management System"
    API_V1_STR: str = "/api/v1"
    
    # Environment Setup
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development") # development / production

    # JWT Auth Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeychangeinproduction")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week for offline environment flexibility

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """
        Parses comma-separated string inputs from environment vars (e.g. "http://localhost,http://192.168.1.50")
        into list arrays.
        """
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @model_validator(mode="after")
    def validate_production_secret(self) -> "Settings":
        """
        Prevent the application from starting in production with a default security token key.
        """
        if self.ENVIRONMENT.lower() == "production":
            if self.SECRET_KEY == "supersecretkeychangeinproduction":
                raise ValueError(
                    "SECURITY EXCEPTION: Default SECRET_KEY must be changed when running in production mode!"
                )
        return self

    # Database Settings
    LOCAL_DATABASE_URL: str = os.getenv("LOCAL_DATABASE_URL", "sqlite:///./local_phc.db")
    CLOUD_DATABASE_URL: Optional[str] = os.getenv("CLOUD_DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/arogyasync_cloud")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
