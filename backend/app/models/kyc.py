from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class CustomerProfile(BaseModel):
    __tablename__ = "customer_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    kyc_level = Column(String(20), default="basic")
    credit_score = Column(Numeric(5, 2), default=0.00)
    total_spent_mzn = Column(Numeric(12, 2), default=0.00)
    total_transactions = Column(Numeric(10, 0), default=0)
    max_credit_limit = Column(Numeric(10, 2), default=500.00)
    document_type = Column(String(30), nullable=True)
    document_number = Column(String(50), nullable=True)
    document_verified = Column(Boolean, default=False)
    address = Column(String(200), nullable=True)
    notes = Column(String(500), nullable=True)
    is_blocked = Column(Boolean, default=False)
    blocked_reason = Column(String(200), nullable=True)

    # 🆕 Novos campos KYC
    bi_document_uploaded = Column(Boolean, default=False)
    bi_document_path = Column(String(500), nullable=True)
    bi_document_status = Column(String(20), nullable=True)  # pending_review, approved, rejected
    selfie_video_uploaded = Column(Boolean, default=False)
    selfie_video_path = Column(String(500), nullable=True)
    selfie_video_status = Column(String(20), nullable=True)  # pending_review, approved, rejected


class KycLevelConfig(BaseModel):
    __tablename__ = "kyc_level_configs"

    level = Column(String(20), unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    min_credit_score = Column(Numeric(5, 2), default=0.00)
    max_credit_limit = Column(Numeric(10, 2), default=500.00)
    require_document = Column(Boolean, default=False)
    require_address = Column(Boolean, default=False)
    daily_transaction_limit = Column(Numeric(10, 0), default=5)
    monthly_transaction_limit = Column(Numeric(10, 0), default=50)

    def __repr__(self):
        return f"<KycLevelConfig {self.level}>"