from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.models.stock import StockItem
from app.models.wallet import Wallet

router = APIRouter(prefix="/admin/dashboard", tags=["Admin - Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today.replace(day=1)

    # Vendas hoje
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.total_credit), 0))
        .where(Transaction.created_at >= today, Transaction.payment_status == "confirmed")
    )
    sales_today_credits = float(result.scalar_one())

    # Vendas mês
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.total_credit), 0))
        .where(Transaction.created_at >= month_start, Transaction.payment_status == "confirmed")
    )
    sales_month_credits = float(result.scalar_one())

    # Clientes ativos
    result = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_clients = result.scalar_one()

    # Stock disponível
    result = await db.execute(
        select(func.count(StockItem.id)).where(StockItem.status == "available")
    )
    available_stock = result.scalar_one()

    # Total créditos em circulação
    result = await db.execute(select(func.coalesce(func.sum(Wallet.balance_credit), 0)))
    total_credits = float(result.scalar_one())

    return {
        "sales_today_credits": sales_today_credits,
        "sales_month_credits": sales_month_credits,
        "active_clients": active_clients,
        "available_stock": available_stock,
        "total_credits_in_wallets": total_credits,
    }