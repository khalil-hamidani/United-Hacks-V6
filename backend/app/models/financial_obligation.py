import enum
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DECIMAL, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ObligationStatus(enum.Enum):
    OUTSTANDING = "OUTSTANDING"
    SETTLED = "SETTLED"


class FinancialObligation(Base):
    __tablename__ = "financial_obligations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    creditor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    status: Mapped[ObligationStatus] = mapped_column(
        Enum(ObligationStatus), nullable=False, default=ObligationStatus.OUTSTANDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="financial_obligations")
    audit_logs = relationship(
        "ObligationAuditLog", back_populates="obligation", cascade="all, delete-orphan"
    )
