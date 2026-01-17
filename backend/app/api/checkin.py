from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.checkin import Checkin
from app.models.user import User
from app.schemas.checkin import (
    CheckinConfigResponse,
    CheckinConfigUpdate,
    CheckinConfirmResponse,
    CheckinStatusResponse,
)

router = APIRouter(prefix="/checkin", tags=["checkin"])


async def get_or_create_checkin(user_id: str, db: AsyncSession) -> Checkin:
    result = await db.execute(select(Checkin).where(Checkin.user_id == user_id))
    checkin = result.scalar_one_or_none()
    if checkin is None:
        checkin = Checkin(user_id=user_id)
        db.add(checkin)
        await db.flush()
        await db.refresh(checkin)
    return checkin


def calculate_days_since(last_checkin_at: Optional[datetime]) -> Optional[int]:
    if last_checkin_at is None:
        return None
    delta = datetime.utcnow() - last_checkin_at
    return delta.days


def is_overdue(days_since: Optional[int], interval_days: int) -> bool:
    if days_since is None:
        return True
    return days_since > interval_days


@router.get("/status", response_model=CheckinStatusResponse)
async def get_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    checkin = await get_or_create_checkin(current_user.id, db)
    days_since = calculate_days_since(checkin.last_checkin_at)
    return {
        "last_checkin_at": checkin.last_checkin_at,
        "interval_days": checkin.interval_days,
        "days_since_last_checkin": days_since,
        "overdue": is_overdue(days_since, checkin.interval_days),
    }


@router.post("/confirm", response_model=CheckinConfirmResponse)
async def confirm_checkin(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    checkin = await get_or_create_checkin(current_user.id, db)
    checkin.last_checkin_at = datetime.utcnow()
    await db.flush()
    await db.refresh(checkin)
    return {
        "last_checkin_at": checkin.last_checkin_at,
        "message": "Check-in confirmed",
    }


@router.put("/config", response_model=CheckinConfigResponse)
async def update_config(
    data: CheckinConfigUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    checkin = await get_or_create_checkin(current_user.id, db)
    checkin.interval_days = data.interval_days
    await db.flush()
    await db.refresh(checkin)
    return {
        "interval_days": checkin.interval_days,
        "message": "Check-in interval updated",
    }
