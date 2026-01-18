"""
Notification logging model to track sent emails
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("trusted_recipients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # 'legacy_release', 'reminder'
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # 'sent', 'failed'
    recipient_email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class ReleaseEvent(Base):
    __tablename__ = "release_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    days_overdue: Mapped[int] = mapped_column(Integer, nullable=False)
    recipients_notified: Mapped[int] = mapped_column(Integer, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # 'success', 'partial', 'failed'
