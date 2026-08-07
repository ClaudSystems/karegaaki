from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from uuid import UUID


class CreditPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    credit_amount: Decimal
    price_mzn: Decimal
    bonus_credit: Decimal
    is_active: bool
    display_order: int


class CreditPurchaseRequest(BaseModel):
    package_id: str


class CreditPurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    reference: str
    amount_mzn: Decimal
    credit_received: Decimal
    status: str
    payment_instructions: Optional[str] = None


class CreditPurchaseStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    reference: str
    status: str
    credit_received: Decimal
    confirmed_at: Optional[str] = None