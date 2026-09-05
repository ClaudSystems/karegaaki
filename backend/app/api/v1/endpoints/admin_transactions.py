from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.transaction import Transaction, TransactionItem
from app.models.product import Product
from app.models.stock import StockItem
from app.models.user import User
from app.models.wallet import Wallet, WalletMovement
from app.utils.reference_generator import generate_reference
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/admin/transactions", tags=["Admin - Transações"])


@router.get("")
async def get_all_transactions(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        status: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = select(Transaction).order_by(Transaction.created_at.desc())

    if status:
        query = query.where(Transaction.payment_status == status)

    if search:
        query = query.where(Transaction.reference.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    transactions = result.scalars().all()

    items_list = []
    for tx in transactions:
        items_result = await db.execute(
            select(TransactionItem).where(TransactionItem.transaction_id == tx.id)
        )
        items = items_result.scalars().all()
        items_data = []
        for item in items:
            product_result = await db.execute(select(Product).where(Product.id == item.product_id))
            product = product_result.scalar_one_or_none()
            items_data.append({
                "product_id": str(item.product_id),
                "product_name": product.name if product else "Produto",
                "quantity": item.quantity,
                "unit_credit_price": float(item.unit_credit_price),
                "code_delivered": item.code_delivered if tx.delivery_status == "delivered" else None,
            })
        items_list.append({
            "id": str(tx.id),
            "reference": tx.reference,
            "user_id": str(tx.user_id),
            "total_credit": float(tx.total_credit),
            "total_mzn": float(tx.total_mzn) if tx.total_mzn else None,
            "payment_status": tx.payment_status,
            "delivery_status": tx.delivery_status,
            "payment_method": tx.payment_method,
            "items": items_data,
            "created_at": tx.created_at.isoformat(),
        })

    return {
        "items": items_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


class CreatePendingTransaction(BaseModel):
    user_phone: str
    product_id: str
    quantity: int = 1


@router.post("/create-pending")
async def create_pending_transaction(
        data: CreatePendingTransaction,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(User).where(User.phone_number == data.user_phone))
    user = result.scalar_one_or_none()
    if not user:
        return {"error": "Utilizador não encontrado"}, 404

    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        return {"error": "Produto não encontrado"}, 404

    reference = generate_reference("MP")

    transaction = Transaction(
        user_id=user.id,
        reference=reference,
        total_credit=product.credit_price * data.quantity,
        total_mzn=product.credit_price * 10,
        payment_status="pending",
        delivery_status="pending",
        payment_method="mpesa",
    )
    db.add(transaction)
    await db.flush()

    transaction_item = TransactionItem(
        transaction_id=transaction.id,
        product_id=product.id,
        quantity=data.quantity,
        unit_credit_price=product.credit_price,
    )
    db.add(transaction_item)
    await db.flush()
    await db.commit()

    return {
        "id": str(transaction.id),
        "reference": reference,
        "user": user.phone_number,
        "product": product.name,
        "total": float(transaction.total_credit),
        "status": "pending",
    }


class ConfirmTransactionRequest(BaseModel):
    transaction_id: str


@router.post("/confirm-pending")
async def confirm_pending_transaction(
        data: ConfirmTransactionRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(Transaction).where(Transaction.id == data.transaction_id))
    tx = result.scalar_one_or_none()
    if not tx:
        return {"error": "Transação não encontrada"}, 404

    if tx.payment_status != "pending":
        return {"error": "Transação não está pendente"}, 400

    items_result = await db.execute(
        select(TransactionItem).where(TransactionItem.transaction_id == tx.id)
    )
    items = items_result.scalars().all()

    for item in items:
        stock_result = await db.execute(
            select(StockItem).where(
                StockItem.product_id == item.product_id,
                StockItem.status == "available",
                ).limit(item.quantity)
        )
        stock_items = stock_result.scalars().all()

        for stock_item in stock_items:
            stock_item.status = "sold"
            stock_item.sold_to_user_id = tx.user_id
            stock_item.sold_at = datetime.utcnow()
            stock_item.transaction_id = tx.id
            item.stock_item_id = stock_item.id
            item.code_delivered = stock_item.code

    tx.payment_status = "confirmed"
    tx.delivery_status = "delivered"
    tx.payment_confirmed_at = datetime.utcnow()
    tx.delivered_at = datetime.utcnow()
    tx.completed_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    return {
        "reference": tx.reference,
        "status": "confirmed",
        "delivery": "delivered",
        "codes": [item.code_delivered for item in items],
    }


class CancelTransactionRequest(BaseModel):
    transaction_id: str
    refund_credits: bool = True
    release_stock: bool = True


@router.post("/cancel")
async def cancel_transaction(
        data: CancelTransactionRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(Transaction).where(Transaction.id == data.transaction_id))
    tx = result.scalar_one_or_none()
    if not tx:
        return {"error": "Transação não encontrada"}, 404

    if tx.payment_status == "cancelled":
        return {"error": "Transação já cancelada"}, 400

    original_status = tx.payment_status
    was_delivered = tx.delivery_status == "delivered"

    if data.release_stock and was_delivered:
        items_result = await db.execute(
            select(TransactionItem).where(TransactionItem.transaction_id == tx.id)
        )
        items = items_result.scalars().all()
        for item in items:
            if item.stock_item_id:
                stock_result = await db.execute(
                    select(StockItem).where(StockItem.id == item.stock_item_id)
                )
                stock = stock_result.scalar_one_or_none()
                if stock:
                    stock.status = "available"
                    stock.sold_to_user_id = None
                    stock.sold_at = None
                    stock.transaction_id = None
                    item.code_delivered = None

    refunded = False
    refund_amount = 0
    if data.refund_credits and tx.payment_method == "credit" and original_status == "confirmed":
        wallet_result = await db.execute(select(Wallet).where(Wallet.user_id == tx.user_id))
        wallet = wallet_result.scalar_one_or_none()
        if wallet:
            balance_before = wallet.balance_credit
            wallet.balance_credit += tx.total_credit
            wallet.total_spent_credit -= tx.total_credit

            movement = WalletMovement(
                user_id=tx.user_id,
                amount=tx.total_credit,
                movement_type="refund",
                reference=tx.reference,
                balance_before=balance_before,
                balance_after=wallet.balance_credit,
                description=f"Reembolso da transação {tx.reference}",
            )
            db.add(movement)
            refunded = True
            refund_amount = float(tx.total_credit)

    tx.payment_status = "cancelled"
    tx.delivery_status = "cancelled"
    tx.cancelled_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    return {
        "reference": tx.reference,
        "status": "cancelled",
        "refunded": refunded,
        "refund_amount": refund_amount,
        "stock_liberado": data.release_stock and was_delivered,
    }