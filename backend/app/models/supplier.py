from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, Text
from app.models.base import BaseModel


class Supplier(BaseModel):
    __tablename__ = "suppliers"

    name = Column(String(100), nullable=False, unique=True)
    supplier_type = Column(String(20), default="api")  # api, manual
    base_url = Column(String(500), nullable=True)
    api_key_encrypted = Column(String(500), nullable=True)
    api_secret_encrypted = Column(String(500), nullable=True)
    credit_balance_usd = Column(Numeric(10, 4), default=0.0)
    min_credit_alert = Column(Numeric(10, 4), default=50.0)
    critical_credit_alert = Column(Numeric(10, 4), default=10.0)
    rate_limit_per_minute = Column(Integer, default=60)
    timeout_seconds = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    priority_order = Column(Integer, default=0)
    last_sync_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Supplier {self.name}>"


class SupplierApiLog(BaseModel):
    __tablename__ = "supplier_api_logs"

    supplier_id = Column(String(36), nullable=False, index=True)
    endpoint = Column(String(500), nullable=False)
    method = Column(String(10), nullable=False)
    request_data = Column(Text, nullable=True)
    response_data = Column(Text, nullable=True)
    status_code = Column(Integer, nullable=True)
    success = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<SupplierApiLog {self.supplier_id} - {self.endpoint}>"