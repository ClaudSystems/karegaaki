from sqlalchemy import Column, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import uuid


class Wallet(BaseModel):
    __tablename__ = "wallets"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    balance_credit = Column(Numeric(10, 2), default=0.00)
    total_purchased_credit = Column(Numeric(10, 2), default=0.00)
    total_spent_credit = Column(Numeric(10, 2), default=0.00)
    total_purchased_mzn = Column(Numeric(10, 2), default=0.00)

    def __repr__(self):
        return f"<Wallet user={self.user_id} balance={self.balance_credit}>"


class WalletMovement(BaseModel):
    __tablename__ = "wallet_movements"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    # positivo = entrada, negativo = saida
    movement_type = Column(String(30), nullable=False)
    # credit_purchase, purchase, expired, manual_adjustment, refund
    reference = Column(String(100), nullable=True)
    balance_before = Column(Numeric(10, 2), nullable=True)
    balance_after = Column(Numeric(10, 2), nullable=True)
    description = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<WalletMovement user={self.user_id} amount={self.amount} type={self.movement_type}>"