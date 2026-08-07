from typing import List
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.transaction import Transaction, TransactionItem
from app.models.product import Product
from app.models.stock import StockItem
from app.models.wallet import Wallet, WalletMovement
from app.schemas.transaction import (
    CheckoutRequest,
    CheckoutItem,
    TransactionResponse,
    TransactionDetailResponse,
    TransactionItemResponse,
)
from app.utils.reference_generator import generate_reference


class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def checkout_with_credits(self, user_id: str, request: CheckoutRequest) -> TransactionResponse:
        # Verificar carteira
        wallet_result = await self.db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = wallet_result.scalar_one_or_none()

        if not wallet:
            raise ValueError("Carteira não encontrada")

        # Calcular total
        total_credits = Decimal("0")
        items_detail = []

        for item in request.items:
            product_result = await self.db.execute(select(Product).where(Product.id == item.product_id))
            product = product_result.scalar_one_or_none()

            if not product or not product.is_active:
                raise ValueError(f"Produto {item.product_id} não encontrado ou inativo")

            # Verificar stock
            stock_count = await self.db.execute(
                select(StockItem).where(
                    StockItem.product_id == product.id,
                    StockItem.status == "available",
                    )
            )
            available = len(stock_count.scalars().all())

            if available < item.quantity:
                raise ValueError(f"Stock insuficiente para {product.name}")

            item_total = product.credit_price * item.quantity
            total_credits += item_total
            items_detail.append((product, item.quantity, product.credit_price))

        # Verificar saldo
        if wallet.balance_credit < total_credits:
            raise ValueError(f"Saldo insuficiente. Necessário: {total_credits}, Disponível: {wallet.balance_credit}")

        # Criar transação
        reference = generate_reference("TX")
        transaction = Transaction(
            user_id=user_id,
            reference=reference,
            total_credit=total_credits,
            payment_status="confirmed",
            delivery_status="processing",
            payment_method="credit",
            payment_confirmed_at=datetime.utcnow(),
        )
        self.db.add(transaction)
        await self.db.flush()

        # Processar itens e entregar stock
        transaction_items = []
        for product, qty, price in items_detail:
            # Buscar códigos disponíveis
            stock_result = await self.db.execute(
                select(StockItem).where(
                    StockItem.product_id == product.id,
                    StockItem.status == "available",
                    ).limit(qty)
            )
            stock_items = stock_result.scalars().all()

            for stock_item in stock_items:
                stock_item.status = "sold"
                stock_item.sold_to_user_id = user_id
                stock_item.sold_at = datetime.utcnow()
                stock_item.transaction_id = transaction.id

                transaction_item = TransactionItem(
                    transaction_id=transaction.id,
                    product_id=product.id,
                    stock_item_id=stock_item.id,
                    quantity=1,
                    unit_credit_price=price,
                    code_delivered=stock_item.code,
                )
                self.db.add(transaction_item)
                transaction_items.append(transaction_item)

        # Debitar carteira
        balance_before = wallet.balance_credit
        wallet.balance_credit -= total_credits
        wallet.total_spent_credit += total_credits

        movement = WalletMovement(
            user_id=user_id,
            amount=-total_credits,
            movement_type="purchase",
            reference=reference,
            balance_before=balance_before,
            balance_after=wallet.balance_credit,
            description=f"Compra de produtos",
        )
        self.db.add(movement)

        # Atualizar transação
        transaction.delivery_status = "delivered"
        transaction.delivered_at = datetime.utcnow()
        transaction.completed_at = datetime.utcnow()

        await self.db.flush()

        # Construir resposta
        items_response = []
        for ti in transaction_items:
            prod_result = await self.db.execute(select(Product).where(Product.id == ti.product_id))
            prod = prod_result.scalar_one_or_none()
            items_response.append(
                TransactionItemResponse(
                    product_id=str(ti.product_id),
                    product_name=prod.name if prod else None,
                    quantity=ti.quantity,
                    unit_credit_price=ti.unit_credit_price,
                    code_delivered=ti.code_delivered,
                )
            )

        return TransactionResponse(
            id=str(transaction.id),
            reference=transaction.reference,
            total_credit=transaction.total_credit,
            payment_status=transaction.payment_status,
            delivery_status=transaction.delivery_status,
            payment_method=transaction.payment_method,
            items=items_response,
            created_at=transaction.created_at.isoformat(),
        )

    async def get_transactions(self, user_id: str, page: int = 1, page_size: int = 20) -> tuple[List[TransactionResponse], int]:
        from sqlalchemy import func

        query = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
        )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        transactions = result.scalars().all()

        responses = []
        for tx in transactions:
            items_result = await self.db.execute(
                select(TransactionItem).where(TransactionItem.transaction_id == tx.id)
            )
            items = items_result.scalars().all()

            items_response = []
            for ti in items:
                prod_result = await self.db.execute(select(Product).where(Product.id == ti.product_id))
                prod = prod_result.scalar_one_or_none()
                items_response.append(
                    TransactionItemResponse(
                        product_id=str(ti.product_id),
                        product_name=prod.name if prod else None,
                        quantity=ti.quantity,
                        unit_credit_price=ti.unit_credit_price,
                        code_delivered=ti.code_delivered if tx.delivery_status == "delivered" else None,
                    )
                )

            responses.append(
                TransactionResponse(
                    id=str(tx.id),
                    reference=tx.reference,
                    total_credit=tx.total_credit,
                    payment_status=tx.payment_status,
                    delivery_status=tx.delivery_status,
                    payment_method=tx.payment_method,
                    items=items_response,
                    created_at=tx.created_at.isoformat(),
                )
            )

        return responses, total

    async def get_transaction_detail(self, user_id: str, transaction_id: str) -> TransactionDetailResponse:
        result = await self.db.execute(
            select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id)
        )
        tx = result.scalar_one_or_none()

        if not tx:
            raise ValueError("Transação não encontrada")

        items_result = await self.db.execute(
            select(TransactionItem).where(TransactionItem.transaction_id == tx.id)
        )
        items = items_result.scalars().all()

        items_response = []
        for ti in items:
            prod_result = await self.db.execute(select(Product).where(Product.id == ti.product_id))
            prod = prod_result.scalar_one_or_none()
            items_response.append(
                TransactionItemResponse(
                    product_id=str(ti.product_id),
                    product_name=prod.name if prod else None,
                    quantity=ti.quantity,
                    unit_credit_price=ti.unit_credit_price,
                    code_delivered=ti.code_delivered,
                )
            )

        return TransactionDetailResponse(
            id=str(tx.id),
            reference=tx.reference,
            total_credit=tx.total_credit,
            total_mzn=tx.total_mzn,
            payment_status=tx.payment_status,
            delivery_status=tx.delivery_status,
            payment_method=tx.payment_method,
            items=items_response,
            created_at=tx.created_at.isoformat(),
            payment_confirmed_at=tx.payment_confirmed_at.isoformat() if tx.payment_confirmed_at else None,
            delivered_at=tx.delivered_at.isoformat() if tx.delivered_at else None,
            completed_at=tx.completed_at.isoformat() if tx.completed_at else None,
        )