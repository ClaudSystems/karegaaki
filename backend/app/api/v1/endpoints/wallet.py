from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallet", tags=["Carteira"])


@router.get("/balance")
async def get_balance(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = WalletService(db)
    result = await service.get_balance(str(current_user.id))
    return result.model_dump()


@router.get("/history")
async def get_history(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = WalletService(db)
    movements, total = await service.get_history(str(current_user.id), page, page_size)
    return {
        "items": [m.model_dump() for m in movements],
        "total": total,
        "page": page,
        "page_size": page_size,
    }