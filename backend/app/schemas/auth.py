# app/schemas/auth.py
from app.core.serializers import AppBaseModel
from pydantic import ConfigDict, BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID


class UserRegisterRequest(BaseModel):
    phone_number: str = Field(..., min_length=9, max_length=15, pattern=r"^\+?258\d{9}$")
    full_name: str = Field(..., min_length=3, max_length=100)
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class UserLoginRequest(BaseModel):
    phone_number: str = Field(..., min_length=9, max_length=15)
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class TokenResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(AppBaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    phone_number: str
    full_name: str
    email: Optional[str] = None
    user_type: str
    is_active: bool
    is_verified: bool

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v