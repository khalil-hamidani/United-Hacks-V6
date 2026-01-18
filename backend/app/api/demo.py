"""
Demo release endpoint for testing email automation
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.api.checkin import calculate_days_since
from app.core.encryption import decrypt_content
from app.db.session import get_db
from app.models.checkin import Checkin
from app.models.financial_obligation import FinancialObligation
from app.models.legacy import LegacyItem, TrustedRecipient
from app.models.notification import NotificationLog, ReleaseEvent
from app.models.user import User
from app.schemas.notification import DemoReleaseResponse, RecipientNotification
from app.services.email_service import send_legacy_release_email

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/release", response_model=DemoReleaseResponse)
async def trigger_demo_release(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DemoReleaseResponse:
    """
    Trigger a demo release of Legacy Vault.
    Sends emails to all recipients with their assigned messages.
    """
    # Get check-in status
    checkin_result = await db.execute(
        select(Checkin).where(Checkin.user_id == current_user.id)
    )
    checkin = checkin_result.scalar_one_or_none()

    if not checkin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No check-in record found"
        )

    days_since = calculate_days_since(checkin.last_checkin_at) or 0

    # Get all recipients with their assigned items
    recipients_result = await db.execute(
        select(TrustedRecipient)
        .where(TrustedRecipient.user_id == current_user.id)
        .options(selectinload(TrustedRecipient.legacy_items))
    )
    recipients = list(recipients_result.scalars().all())

    if not recipients:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No recipients configured"
        )

    # Get financial obligations
    obligations_result = await db.execute(
        select(FinancialObligation).where(
            FinancialObligation.user_id == current_user.id,
            FinancialObligation.status == "OUTSTANDING",
        )
    )
    obligations = list(obligations_result.scalars().all())

    # Create release event
    release_event = ReleaseEvent(
        user_id=current_user.id,
        days_overdue=days_since,
        recipients_notified=0,
        is_demo=True,
        status="in_progress",
    )
    db.add(release_event)
    await db.flush()

    # Send emails to each recipient
    notifications = []
    successful_sends = 0

    for recipient in recipients:
        # Skip recipients with no assigned items
        if not recipient.legacy_items:
            continue

        # Decrypt legacy items
        decrypted_items = [
            {"title": item.title, "content": decrypt_content(item.encrypted_content)}
            for item in recipient.legacy_items
        ]

        # Prepare obligations data with all details
        obligations_data = (
            [
                {
                    "creditor_name": obl.creditor_name,
                    "amount": float(obl.amount),
                    "due_date": obl.due_date.isoformat() if obl.due_date else None,
                    "description": obl.description,
                }
                for obl in obligations
            ]
            if obligations
            else None
        )

        # Send email
        try:
            success = send_legacy_release_email(
                recipient_email=recipient.email,
                recipient_name=recipient.name,
                user_name=current_user.email.split("@")[
                    0
                ].title(),  # Use email username as name
                days_overdue=days_since,
                legacy_items=decrypted_items,
                obligations=obligations_data,
            )

            if success:
                notification_status = "sent"
                successful_sends += 1
                error_msg = None
            else:
                notification_status = "failed"
                error_msg = "Failed to send email"

            # Log notification
            notification_log = NotificationLog(
                user_id=current_user.id,
                recipient_id=recipient.id,
                email_type="legacy_release",
                status=notification_status,
                recipient_email=recipient.email,
                subject=f"A message from {current_user.email.split('@')[0].title()}",
                error_message=error_msg,
                is_demo=True,
            )
            db.add(notification_log)

            notifications.append(
                RecipientNotification(
                    recipient_id=recipient.id,
                    recipient_name=recipient.name,
                    recipient_email=recipient.email,
                    messages_count=len(decrypted_items),
                    status=notification_status,
                    error=error_msg,
                )
            )

        except Exception as e:
            # Log failed notification
            notification_log = NotificationLog(
                user_id=current_user.id,
                recipient_id=recipient.id,
                email_type="legacy_release",
                status="failed",
                recipient_email=recipient.email,
                subject=f"A message from {current_user.email.split('@')[0].title()}",
                error_message=str(e),
                is_demo=True,
            )
            db.add(notification_log)

            notifications.append(
                RecipientNotification(
                    recipient_id=recipient.id,
                    recipient_name=recipient.name,
                    recipient_email=recipient.email,
                    messages_count=len(decrypted_items),
                    status="failed",
                    error=str(e),
                )
            )

    # Update release event
    release_event.recipients_notified = successful_sends
    release_event.status = "success" if successful_sends > 0 else "failed"

    await db.commit()
    await db.refresh(release_event)

    return DemoReleaseResponse(
        success=successful_sends > 0,
        release_event_id=release_event.id,
        days_overdue=days_since,
        recipients_notified=successful_sends,
        notifications=notifications,
        message=f"Demo release completed. {successful_sends} recipient(s) notified.",
    )
