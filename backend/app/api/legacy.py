from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.api.checkin import calculate_days_since, get_or_create_checkin, is_overdue
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
    RecipientWithItems,
    SimulatedReleaseResponse,
)

router = APIRouter(prefix="/legacy", tags=["legacy"])


# ============================================================================
# RECIPIENT ENDPOINTS (Multiple recipients per user)
# ============================================================================


@router.post(
    "/recipient", response_model=RecipientResponse, status_code=status.HTTP_201_CREATED
)
async def create_recipient(
    data: RecipientCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    """Create a new trusted recipient. Users can have multiple recipients."""
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


@router.get("/recipient", response_model=List[RecipientResponse])
async def list_recipients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[TrustedRecipient]:
    """List all trusted recipients for the current user."""
    result = await db.execute(
        select(TrustedRecipient)
        .where(TrustedRecipient.user_id == current_user.id)
        .order_by(TrustedRecipient.created_at)
    )
    return list(result.scalars().all())


@router.get("/recipient/{recipient_id}", response_model=RecipientResponse)
async def get_recipient(
    recipient_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    """Get a specific recipient by ID."""
    result = await db.execute(
        select(TrustedRecipient).where(
            TrustedRecipient.id == recipient_id,
            TrustedRecipient.user_id == current_user.id,
        )
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
        )
    return recipient


@router.put("/recipient/{recipient_id}", response_model=RecipientResponse)
async def update_recipient(
    recipient_id: str,
    data: RecipientUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrustedRecipient:
    """Update a recipient's information."""
    result = await db.execute(
        select(TrustedRecipient).where(
            TrustedRecipient.id == recipient_id,
            TrustedRecipient.user_id == current_user.id,
        )
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
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


@router.delete("/recipient/{recipient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipient(
    recipient_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a recipient. This will also remove all item assignments to this recipient."""
    result = await db.execute(
        select(TrustedRecipient).where(
            TrustedRecipient.id == recipient_id,
            TrustedRecipient.user_id == current_user.id,
        )
    )
    recipient = result.scalar_one_or_none()
    if recipient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
        )
    await db.delete(recipient)


# ============================================================================
# LEGACY ITEM ENDPOINTS (With recipient assignments)
# ============================================================================


@router.post(
    "/", response_model=LegacyItemResponse, status_code=status.HTTP_201_CREATED
)
async def create_legacy_item(
    data: LegacyItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LegacyItemResponse:
    """Create a new legacy item and assign it to specified recipients."""
    # Validate that all recipient IDs belong to the current user
    if data.recipient_ids:
        result = await db.execute(
            select(TrustedRecipient).where(
                TrustedRecipient.id.in_(data.recipient_ids),
                TrustedRecipient.user_id == current_user.id,
            )
        )
        recipients = list(result.scalars().all())
        if len(recipients) != len(data.recipient_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more recipient IDs are invalid",
            )

    # Create the item
    item = LegacyItem(
        user_id=current_user.id,
        title=data.title,
        encrypted_content=encrypt_content(data.content),
    )
    db.add(item)
    await db.flush()

    # Assign recipients using awaited_for to avoid lazy load
    if data.recipient_ids:
        result = await db.execute(
            select(TrustedRecipient).where(TrustedRecipient.id.in_(data.recipient_ids))
        )
        recipients_to_assign = list(result.scalars().all())

        # Load the relationship first to avoid lazy loading
        await db.refresh(item, ["recipients"])
        item.recipients.extend(recipients_to_assign)

    await db.commit()
    await db.refresh(item, ["recipients"])

    return LegacyItemResponse(
        id=item.id,
        title=item.title,
        recipient_ids=[r.id for r in item.recipients],
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get("/", response_model=List[LegacyItemResponse])
async def list_legacy_items(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[LegacyItemResponse]:
    """List all legacy items for the current user with their recipient assignments."""
    result = await db.execute(
        select(LegacyItem)
        .where(LegacyItem.user_id == current_user.id)
        .options(selectinload(LegacyItem.recipients))
        .order_by(LegacyItem.created_at.desc())
    )
    items = result.scalars().all()

    return [
        LegacyItemResponse(
            id=item.id,
            title=item.title,
            recipient_ids=[r.id for r in item.recipients],
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in items
    ]


@router.put("/{item_id}", response_model=LegacyItemResponse)
async def update_legacy_item(
    item_id: str,
    data: LegacyItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LegacyItemResponse:
    """Update a legacy item including its recipient assignments."""
    result = await db.execute(
        select(LegacyItem)
        .where(
            LegacyItem.id == item_id,
            LegacyItem.user_id == current_user.id,
        )
        .options(selectinload(LegacyItem.recipients))
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legacy item not found",
        )

    # Update basic fields
    if data.title is not None:
        item.title = data.title
    if data.content is not None:
        item.encrypted_content = encrypt_content(data.content)

    # Update recipient assignments
    if data.recipient_ids is not None:
        # Validate recipient IDs
        if data.recipient_ids:
            result = await db.execute(
                select(TrustedRecipient).where(
                    TrustedRecipient.id.in_(data.recipient_ids),
                    TrustedRecipient.user_id == current_user.id,
                )
            )
            recipients = list(result.scalars().all())
            if len(recipients) != len(data.recipient_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more recipient IDs are invalid",
                )
            # Clear and reassign
            item.recipients.clear()
            item.recipients.extend(recipients)
        else:
            item.recipients.clear()

    await db.commit()
    await db.refresh(item, ["recipients"])

    return LegacyItemResponse(
        id=item.id,
        title=item.title,
        recipient_ids=[r.id for r in item.recipients],
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_legacy_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a legacy item."""
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


# ============================================================================
# SIMULATE RELEASE (Grouped by recipient)
# ============================================================================


@router.post("/simulate-release", response_model=SimulatedReleaseResponse)
async def simulate_release(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SimulatedReleaseResponse:
    """
    Simulate the release of legacy items to recipients.
    Each recipient only receives items explicitly assigned to them.
    """
    # Check if user is overdue
    checkin = await get_or_create_checkin(current_user.id, db)
    days_since = calculate_days_since(checkin.last_checkin_at)
    if not is_overdue(days_since, checkin.interval_days):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not overdue. Release not triggered.",
        )

    # Get all recipients with their assigned items
    result = await db.execute(
        select(TrustedRecipient)
        .where(TrustedRecipient.user_id == current_user.id)
        .options(selectinload(TrustedRecipient.legacy_items))
        .order_by(TrustedRecipient.created_at)
    )
    recipients = result.scalars().all()

    if not recipients:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No trusted recipients configured",
        )

    # Build response grouped by recipient
    recipients_with_items = []
    for recipient in recipients:
        # Only include recipients who have items assigned
        if recipient.legacy_items:
            decrypted_items = [
                DecryptedLegacyItem(
                    id=item.id,
                    title=item.title,
                    content=decrypt_content(item.encrypted_content),
                    created_at=item.created_at,
                    updated_at=item.updated_at,
                )
                for item in recipient.legacy_items
            ]

            recipients_with_items.append(
                RecipientWithItems(
                    recipient=RecipientResponse(
                        id=recipient.id,
                        name=recipient.name,
                        email=recipient.email,
                        relationship_description=recipient.relationship_description,
                        created_at=recipient.created_at,
                        updated_at=recipient.updated_at,
                    ),
                    legacy_items=decrypted_items,
                )
            )

    return SimulatedReleaseResponse(
        recipients=recipients_with_items,
        message="Simulated release triggered. In production, each recipient would receive only their assigned messages.",
    )
