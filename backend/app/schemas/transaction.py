from app.core.serializers import AppBaseModel
from pydantic import ConfigDict, BaseModel
from typing import Optional, List
from decimal import Decimal


class CheckoutItem(BaseModel):
    product_id: str
    quantity: int = 1


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]


class TransactionItemResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: str
    product_name: Optional[str] = None
    quantity: int
    unit_credit_price: Decimal
    code_delivered: Optional[str] = None
class TransactionResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    reference: str
    total_credit: Decimal
    total_mzn: Optional[Decimal] = None
    payment_status: str
    delivery_status: str
    payment_method: str
    items: List[TransactionItemResponse] = []
    created_at: str
class TransactionDetailResponse(TransactionResponse):
    model_config = ConfigDict(from_attributes=True)
    payment_confirmed_at: Optional[str] = None
    delivered_at: Optional[str] = None
    completed_at: Optional[str] = None
