from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import uuid


class StockItem(BaseModel):
    __tablename__ = "stock_items"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    code = Column(String(500), nullable=False)
    code_hash = Column(String(64), nullable=False, unique=True)
    batch_id = Column(String(100), nullable=True)
    status = Column(String(20), default="available", index=True)
    # available, reserved, sold, expired, refunded
    expiry_date = Column(DateTime, nullable=True)
    reserved_for_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reserved_at = Column(DateTime, nullable=True)
    sold_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    sold_at = Column(DateTime, nullable=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    is_encrypted = Column(Boolean, default=False)

    def __repr__(self):
        return f"<StockItem {self.product_id} - {self.status}>"


class StockAudit(BaseModel):
    __tablename__ = "stock_audit"

    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False, index=True)
    action = Column(String(20), nullable=False)
    # created, reserved, sold, expired, refunded
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    changed_by = Column(String(50), default="system")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    metadata_json = Column(String(1000), nullable=True)

    def __repr__(self):
        return f"<StockAudit {self.stock_item_id} - {self.action}>"