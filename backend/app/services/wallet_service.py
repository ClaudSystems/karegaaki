from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.wallet import Wallet, WalletMovement
from app.schemas.wallet import WalletBalanceResponse, WalletMovementResponse


class WalletService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_balance(self, user_id: str) -> WalletBalanceResponse:
        result = await self.db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = result.scalar_one_or_none()

        if not wallet:
            raise ValueError("Carteira não encontrada")

        return WalletBalanceResponse(
            user_id=str(wallet.user_id),
            balance_credit=wallet.balance_credit,
            total_purchased_credit=wallet.total_purchased_credit,
            total_spent_credit=wallet.total_spent_credit,
        )

    async def get_history(self, user_id: str, page: int = 1, page_size: int = 20) -> tuple[List[WalletMovementResponse], int]:
        from sqlalchemy import func

        query = select(WalletMovement).where(WalletMovement.user_id == user_id).order_by(WalletMovement.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        movements = result.scalars().all()

        return [WalletMovementResponse.model_validate(m) for m in movements], total