from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import uuid


class Transaction(BaseModel):
    __tablename__ = "transactions"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    total_credit = Column(Numeric(10, 2), nullable=False)
    total_mzn = Column(Numeric(10, 2), nullable=True)
    payment_status = Column(String(20), default="pending", index=True)
    # pending, confirmed, failed, cancelled
    delivery_status = Column(String(20), default="pending", index=True)
    # pending, processing, delivered, failed
    payment_method = Column(String(20), default="credit")
    # credit, mpesa, emola
    payment_reference = Column(String(100), nullable=True)
    payment_confirmed_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<Transaction {self.reference}>"


class TransactionItem(BaseModel):
    __tablename__ = "transaction_items"

    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=True)
    quantity = Column(Integer, default=1)
    unit_credit_price = Column(Numeric(10, 2), nullable=False)
    unit_mzn_price = Column(Numeric(10, 2), nullable=True)
    code_delivered = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<TransactionItem tx={self.transaction_id} product={self.product_id}>"