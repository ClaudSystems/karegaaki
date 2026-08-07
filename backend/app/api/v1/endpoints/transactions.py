from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.transaction import CheckoutRequest
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transações"])


@router.post("/checkout")
async def checkout_with_credits(
        request: CheckoutRequest,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = TransactionService(db)
    result = await service.checkout_with_credits(str(current_user.id), request)
    return result.model_dump()


@router.get("")
async def get_transactions(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = TransactionService(db)
    transactions, total = await service.get_transactions(str(current_user.id), page, page_size)
    return {
        "items": [t.model_dump() for t in transactions],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{transaction_id}")
async def get_transaction_detail(
        transaction_id: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = TransactionService(db)
    result = await service.get_transaction_detail(str(current_user.id), transaction_id)
    return result.model_dump()