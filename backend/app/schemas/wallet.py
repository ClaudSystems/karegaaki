from app.core.serializers import AppBaseModel
from pydantic import ConfigDict, field_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from uuid import UUID


class WalletBalanceResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    balance_credit: Decimal
    total_purchased_credit: Decimal
    total_spent_credit: Decimal


class WalletMovementResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    amount: Decimal
    movement_type: str
    reference: Optional[str] = None
    balance_before: Optional[Decimal] = None
    balance_after: Optional[Decimal] = None
    description: Optional[str] = None
    created_at: str

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v