from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Dispute(BaseModel):
    __tablename__ = "disputes"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    dispute_type = Column(String(30), nullable=False)
    status = Column(String(20), default="open")
    description = Column(Text, nullable=False)
    admin_response = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    priority = Column(String(10), default="normal")
    reopen_count = Column(Integer, default=0)
    reopened_at = Column(DateTime, nullable=True)
    reopen_reason = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Dispute {self.reference}>"


class DisputeMessage(BaseModel):
    __tablename__ = "dispute_messages"

    dispute_id = Column(UUID(as_uuid=True), ForeignKey("disputes.id"), nullable=False, index=True)
    sender_type = Column(String(10), nullable=False)  # client, admin
    sender_id = Column(UUID(as_uuid=True), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(String(1), default="0")

    def __repr__(self):
        return f"<DisputeMessage {self.dispute_id} - {self.sender_type}>"