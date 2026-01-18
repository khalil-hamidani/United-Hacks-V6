import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models import TrustedPerson, User, VerificationStatus
from app.schemas.trusted_person import (
    TrustedPersonCreate,
    TrustedPersonResponse,
    TrustedPersonUpdate,
    TrustedPersonVerification,
)

router = APIRouter()


@router.post(
    "", response_model=TrustedPersonResponse, status_code=status.HTTP_201_CREATED
)
async def create_trusted_person(
    trusted_person_data: TrustedPersonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_query = select(TrustedPerson).where(
        TrustedPerson.user_id == current_user.id
    )
    result = await db.execute(existing_query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trusted person already exists. Use PUT to update.",
        )

    verification_token = secrets.token_urlsafe(32)

    trusted_person = TrustedPerson(
        user_id=current_user.id,
        full_name=trusted_person_data.full_name,
        email=trusted_person_data.email,
        phone=trusted_person_data.phone,
        relationship_to_user=trusted_person_data.relationship_to_user,
        encrypted_note=trusted_person_data.personal_note,
        verification_token=verification_token,
    )

    db.add(trusted_person)
    await db.commit()
    await db.refresh(trusted_person)

    return trusted_person


@router.get("", response_model=Optional[TrustedPersonResponse])
async def get_trusted_person(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(TrustedPerson).where(TrustedPerson.user_id == current_user.id)

    result = await db.execute(query)
    trusted_person = result.scalar_one_or_none()

    return trusted_person


@router.put("", response_model=TrustedPersonResponse)
async def update_trusted_person(
    trusted_person_data: TrustedPersonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(TrustedPerson).where(TrustedPerson.user_id == current_user.id)

    result = await db.execute(query)
    trusted_person = result.scalar_one_or_none()

    if not trusted_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted person not found. Use POST to create.",
        )

    update_data = trusted_person_data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != trusted_person.email:
        trusted_person.verification_status = VerificationStatus.PENDING
        trusted_person.verification_token = secrets.token_urlsafe(32)
        trusted_person.last_verified_at = None

    for field, value in update_data.items():
        if field == "personal_note":
            setattr(trusted_person, "encrypted_note", value)
        else:
            setattr(trusted_person, field, value)

    await db.commit()
    await db.refresh(trusted_person)

    return trusted_person


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trusted_person(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(TrustedPerson).where(TrustedPerson.user_id == current_user.id)

    result = await db.execute(query)
    trusted_person = result.scalar_one_or_none()

    if not trusted_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trusted person not found"
        )

    await db.delete(trusted_person)
    await db.commit()

    return None


@router.post("/verify", response_model=dict)
async def send_verification_email(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(TrustedPerson).where(TrustedPerson.user_id == current_user.id)

    result = await db.execute(query)
    trusted_person = result.scalar_one_or_none()

    if not trusted_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trusted person not found"
        )

    return {
        "message": "Verification email sent",
        "email": trusted_person.email,
        "status": "pending",
    }


@router.get("/verify/{token}", response_model=TrustedPersonVerification)
async def verify_trusted_person(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(TrustedPerson).where(TrustedPerson.verification_token == token)

    result = await db.execute(query)
    trusted_person = result.scalar_one_or_none()

    if not trusted_person:
        return TrustedPersonVerification(
            token=token,
            verified=False,
            message="Invalid or expired verification token",
        )

    from datetime import datetime

    trusted_person.verification_status = VerificationStatus.VERIFIED
    trusted_person.last_verified_at = datetime.utcnow()
    trusted_person.verification_token = None

    await db.commit()

    return TrustedPersonVerification(
        token=token,
        verified=True,
        message="Email verified successfully",
    )
