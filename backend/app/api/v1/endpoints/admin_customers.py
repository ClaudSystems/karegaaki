from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.models.wallet import Wallet, WalletMovement
from app.models.kyc import CustomerProfile, KycLevelConfig
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin/customers", tags=["Admin - Clientes"])


@router.get("")
async def get_customers(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None),
        kyc_level: Optional[str] = Query(None),
        is_blocked: Optional[bool] = Query(None),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = (
        select(
            User.id,
            User.phone_number,
            User.full_name,
            User.is_active,
            User.created_at,
            Wallet.balance_credit,
            CustomerProfile.kyc_level,
            CustomerProfile.credit_score,
            CustomerProfile.total_spent_mzn,
            CustomerProfile.total_transactions,
            CustomerProfile.is_blocked,
            CustomerProfile.blocked_reason,
            CustomerProfile.max_credit_limit,
        )
        .join(Wallet, Wallet.user_id == User.id)
        .outerjoin(CustomerProfile, CustomerProfile.user_id == User.id)
        .where(User.user_type == "customer")
        .order_by(User.created_at.desc())
    )

    if search:
        query = query.where(
            (User.phone_number.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    if kyc_level:
        query = query.where(CustomerProfile.kyc_level == kyc_level)
    if is_blocked is not None:
        query = query.where(CustomerProfile.is_blocked == is_blocked)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    return {
        "items": [
            {
                "id": str(r[0]),
                "phone_number": r[1],
                "full_name": r[2],
                "is_active": r[3],
                "created_at": r[4].isoformat() if r[4] else None,
                "balance_credit": float(r[5]) if r[5] else 0,
                "kyc_level": r[6] or "basic",
                "credit_score": float(r[7]) if r[7] else 0,
                "total_spent_mzn": float(r[8]) if r[8] else 0,
                "total_transactions": int(r[9]) if r[9] else 0,
                "is_blocked": r[10] or False,
                "blocked_reason": r[11],
                "max_credit_limit": float(r[12]) if r[12] else 500,
            }
            for r in rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


class UpdateCustomerRequest(BaseModel):
    kyc_level: Optional[str] = None
    credit_score: Optional[float] = None
    max_credit_limit: Optional[float] = None
    is_blocked: Optional[bool] = None
    blocked_reason: Optional[str] = None
    notes: Optional[str] = None
    adjust_credits: Optional[float] = None


@router.put("/{user_id}")
async def update_customer(
        user_id: str,
        data: UpdateCustomerRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(CustomerProfile).where(CustomerProfile.user_id == user_id))
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CustomerProfile(user_id=user_id)
        db.add(profile)
        await db.flush()

    if data.kyc_level is not None:
        profile.kyc_level = data.kyc_level
    if data.credit_score is not None:
        profile.credit_score = data.credit_score
    if data.max_credit_limit is not None:
        profile.max_credit_limit = data.max_credit_limit
    if data.is_blocked is not None:
        profile.is_blocked = data.is_blocked
    if data.blocked_reason is not None:
        profile.blocked_reason = data.blocked_reason
    if data.notes is not None:
        profile.notes = data.notes

    if data.adjust_credits is not None and data.adjust_credits != 0:
        wallet_result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
        wallet = wallet_result.scalar_one_or_none()
        if wallet:
            balance_before = wallet.balance_credit
            wallet.balance_credit += data.adjust_credits
            if data.adjust_credits > 0:
                wallet.total_purchased_credit += data.adjust_credits
            movement = WalletMovement(
                user_id=user_id,
                amount=data.adjust_credits,
                movement_type="manual_adjustment",
                description=f"Ajuste manual de {data.adjust_credits} créditos",
                balance_before=balance_before,
                balance_after=wallet.balance_credit,
            )
            db.add(movement)

    await db.flush()
    await db.commit()

    return {"message": "Perfil atualizado", "kyc_level": profile.kyc_level}


@router.get("/kyc-levels")
async def get_kyc_levels(
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(KycLevelConfig).order_by(KycLevelConfig.max_credit_limit))
    levels = result.scalars().all()
    return [
        {
            "level": l.level,
            "name": l.name,
            "max_credit_limit": float(l.max_credit_limit),
            "require_document": l.require_document,
            "daily_transaction_limit": int(l.daily_transaction_limit),
        }
        for l in levels
    ]