from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.api.checkin import get_or_create_checkin, calculate_days_since, is_overdue
from app.core.encryption import decrypt_content, encrypt_content
from app.db.session import get_db
from app.models.legacy import LegacyItem, TrustedRecipient
from app.models.user import User
from app.schemas.legacy import (
    DecryptedLegacyItem,
    LegacyItemCreate,
    LegacyItemResponse,
    LegacyItemUpdate,
    RecipientCreate,
    RecipientResponse,
    RecipientUpdate,
    SimulatedReleaseResponse,
)

router = APIRouter(prefix="/legacy", tags=["legacy"])


@router.post(
    "/recipient", response_model=RecipientResponse, status_code=status.HTTP_201_CREATED
)
async def create_recipient(
    data: RecipientCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    result = await db.execute(
        select(TrustedRecipient).where(TrustedRecipient.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipient already exists. Use PUT to update.",
        )
    recipient = TrustedRecipient(
        user_id=current_user.id,
        name=data.name,
        email=data.email,
        relationship_description=data.relationship_description,
    )
    db.add(recipient)
    await db.flush()
    await db.refresh(recipient)
    return recipient


@router.get("/recipient", response_model=RecipientResponse)
async def get_recipient(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    result = await db.execute(
        select(TrustedRecipient).where(TrustedRecipient.user_id == current_user.id)
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recipient configured",
        )
    return recipient


@router.put("/recipient", response_model=RecipientResponse)
async def update_recipient(
    data: RecipientUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    result = await db.execute(
        select(TrustedRecipient).where(TrustedRecipient.user_id == current_user.id)
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recipient configured",
        )
    if data.name is not None:
        recipient.name = data.name
    if data.email is not None:
        recipient.email = data.email
    if data.relationship_description is not None:
        recipient.relationship_description = data.relationship_description
    await db.flush()
    await db.refresh(recipient)
    return recipient


@router.delete("/recipient", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipient(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(
        select(TrustedRecipient).where(TrustedRecipient.user_id == current_user.id)
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recipient configured",
        )
    await db.delete(recipient)


@router.post(
    "/", response_model=LegacyItemResponse, status_code=status.HTTP_201_CREATED
)
async def create_legacy_item(
    data: LegacyItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LegacyItem:
    item = LegacyItem(
        user_id=current_user.id,
        title=data.title,
        encrypted_content=encrypt_content(data.content),
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.get("/", response_model=List[LegacyItemResponse])
async def list_legacy_items(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[LegacyItem]:
    result = await db.execute(
        select(LegacyItem).where(LegacyItem.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.put("/{item_id}", response_model=LegacyItemResponse)
async def update_legacy_item(
    item_id: str,
    data: LegacyItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LegacyItem:
    result = await db.execute(
        select(LegacyItem).where(
            LegacyItem.id == item_id,
            LegacyItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legacy item not found",
        )
    if data.title is not None:
        item.title = data.title
    if data.content is not None:
        item.encrypted_content = encrypt_content(data.content)
    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_legacy_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(
        select(LegacyItem).where(
            LegacyItem.id == item_id,
            LegacyItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legacy item not found",
        )
    await db.delete(item)


@router.post("/simulate-release", response_model=SimulatedReleaseResponse)
async def simulate_release(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    checkin = await get_or_create_checkin(current_user.id, db)
    days_since = calculate_days_since(checkin.last_checkin_at)
    if not is_overdue(days_since, checkin.interval_days):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not overdue. Release not triggered.",
        )

    recipient_result = await db.execute(
        select(TrustedRecipient).where(TrustedRecipient.user_id == current_user.id)
    )
    recipient = recipient_result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No trusted recipient configured",
        )

    items_result = await db.execute(
        select(LegacyItem).where(LegacyItem.user_id == current_user.id)
    )
    items = items_result.scalars().all()

    decrypted_items = [
        DecryptedLegacyItem(
            id=item.id,
            title=item.title,
            content=decrypt_content(item.encrypted_content),
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in items
    ]

    return {
        "recipient": recipient,
        "legacy_items": decrypted_items,
        "message": "Simulated release triggered. In production, this would notify the recipient.",
    }
