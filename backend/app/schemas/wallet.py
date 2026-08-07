from app.core.serializers import AppBaseModel
from pydantic import ConfigDict, BaseModel
from typing import Optional
from decimal import Decimal


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
