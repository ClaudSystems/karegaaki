from sqlalchemy import Column, String, Boolean, DateTime, Integer
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    pin_hash = Column(String(255), nullable=False)
    pin_salt = Column(String(64), nullable=False)
    user_type = Column(String(20), default="customer")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    fcm_token = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<User {self.phone_number}>"