from sqlalchemy import Column, String, Boolean, DateTime
from app.models.base import BaseModel


class AdminUser(BaseModel):
    __tablename__ = "admin_users"

    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="admin")  # admin, super_admin
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime, nullable=True)
    two_factor_secret = Column(String(100), nullable=True)
    two_factor_enabled = Column(Boolean, default=False)

    def __repr__(self):
        return f"<AdminUser {self.email}>"


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    admin_user_id = Column(String(36), nullable=True)
    admin_email = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=True)
    details = Column(String(1000), nullable=True)
    ip_address = Column(String(45), nullable=True)

    def __repr__(self):
        return f"<AuditLog {self.action} - {self.entity_type}>"