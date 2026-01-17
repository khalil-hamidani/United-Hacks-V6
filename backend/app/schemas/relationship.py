from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.relationship import RelationshipState


class RelationshipCreate(BaseModel):
    name: str
    state: RelationshipState = RelationshipState.UNCLEAR
    notes: Optional[str] = None


class RelationshipUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[RelationshipState] = None
    notes: Optional[str] = None


class IndicatorResponse(BaseModel):
    label: str
    level: int


class RelationshipResponse(BaseModel):
    id: str
    name: str
    state: RelationshipState
    notes: Optional[str]
    indicator: IndicatorResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
