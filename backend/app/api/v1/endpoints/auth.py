from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(request)


@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(request.phone_number, request.pin)


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.get_profile(current_user)