from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import AdminUser
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
import bcrypt

router = APIRouter(prefix="/admin/auth", tags=["Admin - Autenticação"])


def create_admin_token(admin_id: str, role: str, token_type: str = "admin") -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": admin_id,
        "role": role,
        "type": token_type,
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


class AdminLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def admin_login(data: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AdminUser).where(AdminUser.email == data.email)
    )
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    if not bcrypt.checkpw(
            data.password.encode("utf-8"),
            admin.password_hash.encode("utf-8")
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada"
        )

    admin.last_login_at = datetime.utcnow()
    await db.flush()
    await db.commit()

    access_token = create_admin_token(str(admin.id), admin.role, "admin")
    refresh_token = create_admin_token(str(admin.id), admin.role, "admin_refresh")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "admin": {
            "id": str(admin.id),
            "email": admin.email,
            "full_name": admin.full_name,
            "role": admin.role,
        }
    }


@router.get("/me")
async def get_admin_profile(
        current_admin=Depends(get_current_admin),
):
    return {
        "id": str(current_admin.id),
        "email": current_admin.email,
        "full_name": current_admin.full_name,
        "role": current_admin.role,
        "is_active": current_admin.is_active,
        "last_login_at": current_admin.last_login_at.isoformat() if current_admin.last_login_at else None,
    }