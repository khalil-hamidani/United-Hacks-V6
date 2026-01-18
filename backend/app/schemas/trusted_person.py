from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TrustedPersonBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    relationship_to_user: Optional[str] = Field(None, max_length=100)
    personal_note: Optional[str] = None


class TrustedPersonCreate(TrustedPersonBase):
    pass


class TrustedPersonUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    relationship_to_user: Optional[str] = Field(None, max_length=100)
    personal_note: Optional[str] = None


class TrustedPersonResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str]
    relationship_to_user: Optional[str]
    verification_status: str
    last_verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrustedPersonVerification(BaseModel):
    token: str
    verified: bool
    message: str
