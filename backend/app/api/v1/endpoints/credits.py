from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.credit import CreditPurchaseRequest
from app.services.credit_service import CreditService

router = APIRouter(prefix="/credits", tags=["Créditos"])

from sqlalchemy import select
from decimal import Decimal
from app.models.credit import CreditPurchase
from pydantic import BaseModel

class ConfirmPurchaseRequest(BaseModel):
    reference: str


@router.post("/purchase/confirm")
async def confirm_credit_purchase(
        data: ConfirmPurchaseRequest,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    """Confirma pagamento de créditos"""
    from decimal import Decimal
    service = CreditService(db)
    result = await service.confirm_purchase(
        reference=data.reference,
        amount_received=Decimal("0"),
    )
    return result.model_dump(mode="json")

@router.get("/packages")
async def get_packages(db: AsyncSession = Depends(get_db)):
    service = CreditService(db)
    return [p.model_dump(mode="json") for p in await service.get_packages()]


@router.post("/purchase")
async def purchase_credits(
        request: CreditPurchaseRequest,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = CreditService(db)
    result = await service.purchase_credits(str(current_user.id), request.model_dump())
    return result.model_dump()


@router.get("/purchase/{reference}/status")
async def get_purchase_status(
        reference: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = CreditService(db)
    result = await service.get_purchase_status(reference)
    if not result:
        return {"error": "Referência não encontrada"}, 404
    return result.model_dump()
@router.post("/purchase")
async def purchase_credits(
        request: CreditPurchaseRequest,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = CreditService(db)
    result = await service.purchase_credits(str(current_user.id), request.model_dump())
    return result.model_dump(mode="json")
