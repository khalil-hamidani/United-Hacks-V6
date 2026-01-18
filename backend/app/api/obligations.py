from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models import FinancialObligation, ObligationAuditLog, ObligationStatus, User
from app.schemas.obligation import (
    ObligationCreate,
    ObligationResponse,
    ObligationSummary,
    ObligationUpdate,
)

router = APIRouter()


@router.post("", response_model=ObligationResponse, status_code=status.HTTP_201_CREATED)
async def create_obligation(
    obligation_data: ObligationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obligation = FinancialObligation(
        user_id=current_user.id,
        creditor_name=obligation_data.creditor_name,
        amount=obligation_data.amount,
        currency=obligation_data.currency,
        description=obligation_data.description,
        due_date=obligation_data.due_date,
    )

    db.add(obligation)

    audit_log = ObligationAuditLog(
        obligation_id=obligation.id,
        user_id=current_user.id,
        action="CREATED",
        new_data={
            "creditor_name": obligation_data.creditor_name,
            "amount": str(obligation_data.amount),
            "currency": obligation_data.currency,
        },
    )
    db.add(audit_log)

    await db.commit()
    await db.refresh(obligation)

    return obligation


@router.get("", response_model=List[ObligationResponse])
async def list_obligations(
    is_settled: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(FinancialObligation).where(
        FinancialObligation.user_id == current_user.id
    )

    if is_settled is not None:
        status_filter = (
            ObligationStatus.SETTLED if is_settled else ObligationStatus.OUTSTANDING
        )
        query = query.where(FinancialObligation.status == status_filter)

    query = query.order_by(FinancialObligation.created_at.desc())

    result = await db.execute(query)
    obligations = result.scalars().all()

    return obligations


@router.get("/summary", response_model=ObligationSummary)
async def get_obligations_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch all obligations for the user
    result = await db.execute(
        select(FinancialObligation).where(
            FinancialObligation.user_id == current_user.id
        )
    )
    obligations = result.scalars().all()

    # Calculate summary using Python
    total_count = len(obligations)
    outstanding_count = sum(
        1 for o in obligations if o.status == ObligationStatus.OUTSTANDING
    )
    settled_count = sum(1 for o in obligations if o.status == ObligationStatus.SETTLED)
    total_amount = (
        sum(o.amount for o in obligations) if obligations else Decimal("0.00")
    )
    outstanding_amount = (
        sum(o.amount for o in obligations if o.status == ObligationStatus.OUTSTANDING)
        if obligations
        else Decimal("0.00")
    )

    return ObligationSummary(
        total_count=total_count,
        outstanding_count=outstanding_count,
        settled_count=settled_count,
        total_amount=total_amount,
        outstanding_amount=outstanding_amount,
    )


@router.get("/{obligation_id}", response_model=ObligationResponse)
async def get_obligation(
    obligation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(FinancialObligation).where(
        FinancialObligation.id == obligation_id,
        FinancialObligation.user_id == current_user.id,
    )

    result = await db.execute(query)
    obligation = result.scalar_one_or_none()

    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Obligation not found"
        )

    return obligation


@router.put("/{obligation_id}", response_model=ObligationResponse)
async def update_obligation(
    obligation_id: str,
    obligation_data: ObligationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(FinancialObligation).where(
        FinancialObligation.id == obligation_id,
        FinancialObligation.user_id == current_user.id,
    )

    result = await db.execute(query)
    obligation = result.scalar_one_or_none()

    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Obligation not found"
        )

    old_data = {
        "creditor_name": obligation.creditor_name,
        "amount": str(obligation.amount),
        "currency": obligation.currency,
    }

    update_data = obligation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(obligation, field, value)

    audit_log = ObligationAuditLog(
        obligation_id=obligation.id,
        user_id=current_user.id,
        action="UPDATED",
        old_data=old_data,
        new_data={
            "creditor_name": obligation.creditor_name,
            "amount": str(obligation.amount),
            "currency": obligation.currency,
        },
    )
    db.add(audit_log)

    await db.commit()
    await db.refresh(obligation)

    return obligation


@router.post("/{obligation_id}/settle", response_model=ObligationResponse)
async def settle_obligation(
    obligation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(FinancialObligation).where(
        FinancialObligation.id == obligation_id,
        FinancialObligation.user_id == current_user.id,
    )

    result = await db.execute(query)
    obligation = result.scalar_one_or_none()

    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Obligation not found"
        )

    if obligation.status == ObligationStatus.SETTLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Obligation is already settled",
        )

    obligation.status = ObligationStatus.SETTLED

    audit_log = ObligationAuditLog(
        obligation_id=obligation.id,
        user_id=current_user.id,
        action="SETTLED",
        old_data={"status": "OUTSTANDING"},
        new_data={"status": "SETTLED"},
    )
    db.add(audit_log)

    await db.commit()
    await db.refresh(obligation)

    return obligation


@router.delete("/{obligation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_obligation(
    obligation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(FinancialObligation).where(
        FinancialObligation.id == obligation_id,
        FinancialObligation.user_id == current_user.id,
    )

    result = await db.execute(query)
    obligation = result.scalar_one_or_none()

    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Obligation not found"
        )

    audit_log = ObligationAuditLog(
        obligation_id=obligation.id,
        user_id=current_user.id,
        action="DELETED",
        old_data={
            "creditor_name": obligation.creditor_name,
            "amount": str(obligation.amount),
            "status": obligation.status.value,
        },
    )
    db.add(audit_log)

    await db.delete(obligation)
    await db.commit()

    return None
