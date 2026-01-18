import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AuditAction(enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"
    SETTLED = "SETTLED"
    NOTIFIED = "NOTIFIED"


class ObligationAuditLog(Base):
    __tablename__ = "obligation_audit_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    obligation_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("financial_obligations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False)
    old_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    new_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    performed_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )

    obligation = relationship("FinancialObligation", back_populates="audit_logs")
    user = relationship("User")
