from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.credit import CreditPackage, CreditPurchase
from app.models.wallet import Wallet, WalletMovement
from app.schemas.credit import (
    CreditPackageResponse,
    CreditPurchaseRequest,
    CreditPurchaseResponse,
    CreditPurchaseStatusResponse,
)
from app.core.config import settings
from app.utils.reference_generator import generate_reference


class CreditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_packages(self) -> List[CreditPackageResponse]:
        result = await self.db.execute(
            select(CreditPackage)
            .where(CreditPackage.is_active == True)
            .order_by(CreditPackage.display_order)
        )
        packages = result.scalars().all()
        return [CreditPackageResponse.model_validate(p) for p in packages]

    async def purchase_credits(self, user_id: str, request: CreditPurchaseRequest) -> CreditPurchaseResponse:
        package_result = await self.db.execute(
            select(CreditPackage).where(CreditPackage.id == request.package_id)
        )
        package = package_result.scalar_one_or_none()

        if not package or not package.is_active:
            raise ValueError("Pacote não encontrado ou inativo")

        reference = generate_reference("CRE")

        purchase = CreditPurchase(
            user_id=user_id,
            package_id=package.id,
            reference=reference,
            amount_mzn=package.price_mzn,
            credit_received=package.credit_amount + package.bonus_credit,
            expires_at=datetime.utcnow() + timedelta(days=settings.CREDIT_EXPIRY_DAYS),
        )
        self.db.add(purchase)
        await self.db.flush()

        return CreditPurchaseResponse(
            id=str(purchase.id),
            reference=reference,
            amount_mzn=purchase.amount_mzn,
            credit_received=purchase.credit_received,
            status="pending",
            payment_instructions=f"Envie {purchase.amount_mzn} MZN para 84XXXXXXX com a referência {reference}",
        )

    async def confirm_purchase(self, reference: str, amount_received: Decimal) -> CreditPurchaseStatusResponse:
        result = await self.db.execute(
            select(CreditPurchase).where(CreditPurchase.reference == reference)
        )
        purchase = result.scalar_one_or_none()

        if not purchase:
            raise ValueError("Compra não encontrada")

        if purchase.status != "pending":
            raise ValueError("Compra já processada")

        if abs(purchase.amount_mzn - amount_received) > Decimal("0.50"):
            raise ValueError("Valor recebido não confere")

        purchase.status = "confirmed"
        purchase.payment_confirmed_at = datetime.utcnow()
        purchase.delivered_at = datetime.utcnow()

        # Creditar saldo
        wallet_result = await self.db.execute(
            select(Wallet).where(Wallet.user_id == purchase.user_id)
        )
        wallet = wallet_result.scalar_one_or_none()

        if not wallet:
            raise ValueError("Carteira não encontrada")

        wallet.balance_credit += purchase.credit_received
        wallet.total_purchased_credit += purchase.credit_received
        wallet.total_purchased_mzn += purchase.amount_mzn

        # Registrar movimento
        movement = WalletMovement(
            user_id=purchase.user_id,
            amount=purchase.credit_received,
            movement_type="credit_purchase",
            reference=reference,
            balance_before=wallet.balance_credit - purchase.credit_received,
            balance_after=wallet.balance_credit,
            description=f"Compra de {purchase.credit_received} créditos",
        )
        self.db.add(movement)
        await self.db.flush()

        return CreditPurchaseStatusResponse(
            reference=reference,
            status="confirmed",
            credit_received=purchase.credit_received,
            confirmed_at=purchase.payment_confirmed_at.isoformat() if purchase.payment_confirmed_at else None,
        )

    async def get_purchase_status(self, reference: str) -> Optional[CreditPurchaseStatusResponse]:
        result = await self.db.execute(
            select(CreditPurchase).where(CreditPurchase.reference == reference)
        )
        purchase = result.scalar_one_or_none()

        if not purchase:
            return None

        return CreditPurchaseStatusResponse(
            reference=purchase.reference,
            status=purchase.status,
            credit_received=purchase.credit_received,
            confirmed_at=purchase.payment_confirmed_at.isoformat() if purchase.payment_confirmed_at else None,
        )