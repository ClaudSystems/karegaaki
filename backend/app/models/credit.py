from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import uuid


class CreditPackage(BaseModel):
    __tablename__ = "credit_packages"

    name = Column(String(100), nullable=False)
    credit_amount = Column(Numeric(10, 2), nullable=False)
    price_mzn = Column(Numeric(10, 2), nullable=False)
    bonus_credit = Column(Numeric(10, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    def __repr__(self):
        return f"<CreditPackage {self.name}>"


class CreditPurchase(BaseModel):
    __tablename__ = "credit_purchases"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    package_id = Column(UUID(as_uuid=True), ForeignKey("credit_packages.id"), nullable=False)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    amount_mzn = Column(Numeric(10, 2), nullable=False)
    credit_received = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending", index=True)
    # pending, confirmed, failed, expired
    payment_method = Column(String(20), default="mpesa")
    payment_confirmed_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<CreditPurchase {self.reference}>"