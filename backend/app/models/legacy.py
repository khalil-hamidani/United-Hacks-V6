from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Join table for many-to-many relationship between legacy items and recipients
legacy_item_recipients = Table(
    "legacy_item_recipients",
    Base.metadata,
    Column(
        "legacy_item_id",
        String(36),
        ForeignKey("legacy_items.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "recipient_id",
        String(36),
        ForeignKey("trusted_recipients.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class TrustedRecipient(Base):
    __tablename__ = "trusted_recipients"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # Removed unique=True to allow multiple recipients per user
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    relationship_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship to legacy items
    legacy_items: Mapped[list["LegacyItem"]] = relationship(
        "LegacyItem", secondary=legacy_item_recipients, back_populates="recipients"
    )


class LegacyItem(Base):
    __tablename__ = "legacy_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship to recipients
    recipients: Mapped[list["TrustedRecipient"]] = relationship(
        "TrustedRecipient",
        secondary=legacy_item_recipients,
        back_populates="legacy_items",
    )
