from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Dispute(BaseModel):
    __tablename__ = "disputes"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    dispute_type = Column(String(30), nullable=False)
    # payment_not_confirmed, code_not_received, wrong_amount, expired_code, other
    status = Column(String(20), default="open")
    # open, under_review, resolved_refunded, resolved_resent, resolved_rejected, closed
    description = Column(Text, nullable=False)
    admin_response = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    priority = Column(String(10), default="normal")  # low, normal, high, urgent

    def __repr__(self):
        return f"<Dispute {self.reference}>"