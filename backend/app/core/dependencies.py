from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from sqlalchemy import select
from app.models.admin import AdminUser

security = HTTPBearer()


async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilizador não encontrado ou inativo")

    return user
from app.models.admin import AdminUser


async def get_current_admin(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db),
) -> AdminUser:
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")

    if payload.get("type") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token inválido para admin")

    admin_id = payload.get("sub")
    if admin_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()

    if admin is None or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin não encontrado ou inativo")

    return admin

