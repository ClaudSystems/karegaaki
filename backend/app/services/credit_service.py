from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.credit import CreditPackage, CreditPurchase
from app.models.wallet import Wallet, WalletMovement
from app.schemas.credit import (
    CreditPackageResponse,
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

    async def purchase_credits(self, user_id: str, request_data: dict) -> CreditPurchaseResponse:
        package_result = await self.db.execute(
            select(CreditPackage).where(CreditPackage.id == request_data["package_id"])
        )
        package = package_result.scalar_one_or_none()

        if not package or not package.is_active:
            raise ValueError("Pacote não encontrado ou inativo")

        reference = generate_reference("CRE")
        payment_method = request_data.get("payment_method", "mpesa")

        purchase = CreditPurchase(
            user_id=user_id,
            package_id=package.id,
            reference=reference,
            amount_mzn=package.price_mzn,
            credit_received=package.credit_amount + package.bonus_credit,
            payment_method=payment_method,
            expires_at=datetime.utcnow() + timedelta(days=settings.CREDIT_EXPIRY_DAYS),
        )
        self.db.add(purchase)
        await self.db.flush()

        # Configurações por método de pagamento
        payment_config = {
            "mpesa": {
                "name": "M-Pesa",
                "number": "84XXXXXXX",
                "confirmation_name": "Vodacom M-Pesa",
            },
            "emola": {
                "name": "e-Mola",
                "number": "86XXXXXXX",
                "confirmation_name": "Movitel e-Mola",
            },
            "mpesa_direct": {
                "name": "M-Pesa (Direto)",
                "number": "84XXXXXXX",
                "confirmation_name": "KaregaAki Lda",
            },
            "emola_direct": {
                "name": "e-Mola (Direto)",
                "number": "86XXXXXXX",
                "confirmation_name": "KaregaAki Lda",
            },
        }

        config = payment_config.get(payment_method, payment_config["mpesa"])

        return CreditPurchaseResponse(
            id=str(purchase.id),
            reference=reference,
            amount_mzn=purchase.amount_mzn,
            credit_received=purchase.credit_received,
            status="pending",
            payment_method=payment_method,
            payment_name=config["name"],
            payment_number=config["number"],
            confirmation_name=config["confirmation_name"],
            payment_instructions=f"Envie {purchase.amount_mzn} MZN para {config['number']} ({config['name']}) com a referência {reference}",
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

        # Para simulação, aceitar qualquer valor
        # Usar o valor da própria compra
        amount_received = purchase.amount_mzn

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