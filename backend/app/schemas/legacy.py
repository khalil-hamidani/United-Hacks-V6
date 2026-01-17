from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class RecipientCreate(BaseModel):
    name: str
    email: EmailStr
    relationship_description: Optional[str] = None


class RecipientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    relationship_description: Optional[str] = None


class RecipientResponse(BaseModel):
    id: str
    name: str
    email: str
    relationship_description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LegacyItemCreate(BaseModel):
    title: str
    content: str


class LegacyItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class LegacyItemResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DecryptedLegacyItem(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class SimulatedReleaseResponse(BaseModel):
    recipient: RecipientResponse
    legacy_items: List[DecryptedLegacyItem]
    message: str
