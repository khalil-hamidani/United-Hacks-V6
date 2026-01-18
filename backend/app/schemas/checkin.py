from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CheckinStatusResponse(BaseModel):
    last_checkin_at: Optional[datetime]
    interval_days: int
    days_since_last_checkin: Optional[int]
    overdue: bool

    class Config:
        from_attributes = True


class CheckinConfirmResponse(BaseModel):
    last_checkin_at: datetime
    message: str


class CheckinConfigUpdate(BaseModel):
    interval_days: int = Field(ge=1, le=730)  # 1 day to 2 years65)


class CheckinConfigResponse(BaseModel):
    interval_days: int
    message: str
