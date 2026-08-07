from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.wallet import Wallet
from typing import Optional

router = APIRouter(prefix="/admin/wallets", tags=["Admin - Carteiras"])


@router.get("")
async def get_wallets(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None),
        db: AsyncSession = Depends(get_db),
):
    query = select(Wallet)

    if search:
        query = query.join(Wallet.user).where(
            Wallet.user.has(phone_number=search)
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Wallet.balance_credit.desc())

    result = await db.execute(query)
    wallets = result.scalars().all()

    return {
        "items": [
            {
                "user_id": str(w.user_id),
                "balance_credit": float(w.balance_credit),
                "total_purchased_credit": float(w.total_purchased_credit),
                "total_spent_credit": float(w.total_spent_credit),
            }
            for w in wallets
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }