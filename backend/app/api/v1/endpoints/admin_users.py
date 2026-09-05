from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import AdminUser, AuditLog
from pydantic import BaseModel
from typing import Optional
import bcrypt

router = APIRouter(prefix="/admin/users", tags=["Admin - Utilizadores"])


class AdminUserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "admin"


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@router.get("")
async def get_admin_users(
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    users = result.scalars().all()
    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "two_factor_enabled": u.two_factor_enabled,
            }
            for u in users
        ]
    }


@router.post("")
async def create_admin_user(
        data: AdminUserCreate,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    existing = await db.execute(select(AdminUser).where(AdminUser.email == data.email))
    if existing.scalar_one_or_none():
        return {"error": "Email já existe"}, 409

    user = AdminUser(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.commit()

    log = AuditLog(
        admin_user_id=str(current_admin.id),
        admin_email=current_admin.email,
        action="create_admin",
        entity_type="admin_user",
        entity_id=str(user.id),
        details=f"Criado admin: {user.email}",
    )
    db.add(log)
    await db.commit()

    return {"id": str(user.id), "email": user.email, "message": "Admin criado"}


@router.put("/{user_id}")
async def update_admin_user(
        user_id: str,
        data: AdminUserUpdate,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(AdminUser).where(AdminUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return {"error": "Utilizador não encontrado"}, 404

    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))

    for k, v in update_data.items():
        setattr(user, k, v)

    await db.flush()
    await db.commit()
    return {"id": str(user.id), "message": "Atualizado"}


@router.get("/audit")
async def get_audit_logs(
        page: int = 1,
        page_size: int = 50,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = select(AuditLog).order_by(AuditLog.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "items": [
            {
                "id": str(log.id),
                "admin_email": log.admin_email,
                "action": log.action,
                "entity_type": log.entity_type,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
    }