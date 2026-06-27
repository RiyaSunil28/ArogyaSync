from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    role: str = Field("DOCTOR", max_length=20)  # DOCTOR, NURSE, ADMIN

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6)

class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

# Authentication Specific Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
