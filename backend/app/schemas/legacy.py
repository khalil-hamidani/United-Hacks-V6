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
    recipient_ids: List[str]  # NEW: List of recipient IDs to assign this item to


class LegacyItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    recipient_ids: Optional[List[str]] = None  # NEW: Update recipient assignments


class LegacyItemResponse(BaseModel):
    id: str
    title: str
    recipient_ids: List[str]  # NEW: List of assigned recipient IDs
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


class RecipientWithItems(BaseModel):
    """Response for simulate-release grouped by recipient"""

    recipient: RecipientResponse
    legacy_items: List[DecryptedLegacyItem]


class SimulatedReleaseResponse(BaseModel):
    """Updated to support multiple recipients"""

    recipients: List[RecipientWithItems]  # Changed from single recipient to list
    message: str
