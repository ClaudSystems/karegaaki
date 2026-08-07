from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.wallet import Wallet
from app.core.security import hash_pin, verify_pin, create_access_token, create_refresh_token
from app.schemas.auth import UserRegisterRequest, TokenResponse, UserResponse
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, request: UserRegisterRequest) -> TokenResponse:
        # Verificar se telefone já existe
        result = await self.db.execute(
            select(User).where(User.phone_number == request.phone_number)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este número de telefone já está registado",
            )

        # Criar hash do PIN
        pin_hash, pin_salt = hash_pin(request.pin)

        # Criar utilizador
        user = User(
            phone_number=request.phone_number,
            full_name=request.full_name,
            pin_hash=pin_hash,
            pin_salt=pin_salt,
        )
        self.db.add(user)
        await self.db.flush()

        # Criar carteira
        wallet = Wallet(user_id=user.id)
        self.db.add(wallet)
        await self.db.flush()

        # Gerar tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, phone_number: str, pin: str) -> TokenResponse:
        result = await self.db.execute(
            select(User).where(User.phone_number == phone_number)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Número de telefone ou PIN incorreto",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conta desativada. Contacte o suporte.",
            )

        if user.locked_until and user.locked_until > datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Conta bloqueada temporariamente. Tente novamente mais tarde.",
            )

        if not verify_pin(pin, user.pin_hash):
            user.login_attempts += 1
            if user.login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            await self.db.flush()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Número de telefone ou PIN incorreto",
            )

        # Login bem-sucedido
        user.login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.utcnow()
        await self.db.flush()

        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def get_profile(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)