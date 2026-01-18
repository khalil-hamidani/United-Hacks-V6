from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ObligationBase(BaseModel):
    creditor_name: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v.quantize(Decimal("0.01"))


class ObligationCreate(ObligationBase):
    pass


class ObligationUpdate(BaseModel):
    creditor_name: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    description: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None:
            if v <= 0:
                raise ValueError("Amount must be greater than zero")
            return v.quantize(Decimal("0.01"))
        return v


class ObligationResponse(ObligationBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ObligationSummary(BaseModel):
    total_count: int
    outstanding_count: int
    settled_count: int
    total_amount: Decimal
    outstanding_amount: Decimal
    currency: str = "USD"
