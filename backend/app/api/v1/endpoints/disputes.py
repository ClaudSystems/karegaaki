from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.dispute import Dispute
from app.utils.reference_generator import generate_reference
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/disputes", tags=["Disputas"])


class CreateDisputeRequest(BaseModel):
    transaction_id: Optional[str] = None
    dispute_type: str
    description: str


class ResolveDisputeRequest(BaseModel):
    action: str  # refund, resend_code, reject, request_info
    response: str
    refund_amount: Optional[float] = None


# ========== CLIENTE ==========

@router.post("")
async def create_dispute(
        data: CreateDisputeRequest,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    dispute = Dispute(
        user_id=current_user.id,
        transaction_id=data.transaction_id,
        reference=generate_reference("DIS"),
        dispute_type=data.dispute_type,
        description=data.description,
    )
    db.add(dispute)
    await db.flush()
    await db.commit()

    return {
        "reference": dispute.reference,
        "status": "open",
        "message": "Reclamacao registada com sucesso. Analisaremos em breve.",
    }


@router.get("/my")
async def get_my_disputes(
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute)
        .where(Dispute.user_id == current_user.id)
        .order_by(Dispute.created_at.desc())
    )
    disputes = result.scalars().all()

    return {
        "items": [
            {
                "id": str(d.id),
                "reference": d.reference,
                "dispute_type": d.dispute_type,
                "status": d.status,
                "description": d.description,
                "admin_response": d.admin_response,
                "created_at": d.created_at.isoformat(),
                "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
            }
            for d in disputes
        ]
    }


# ========== ADMIN ==========

@router.get("/admin/all")
async def get_all_disputes(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        status: Optional[str] = Query(None),
        dispute_type: Optional[str] = Query(None),
        db: AsyncSession = Depends(get_db),
):
    query = select(Dispute).order_by(
        Dispute.priority.desc(),
        Dispute.created_at.desc(),
    )

    if status:
        query = query.where(Dispute.status == status)
    if dispute_type:
        query = query.where(Dispute.dispute_type == dispute_type)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    disputes = result.scalars().all()

    return {
        "items": [
            {
                "id": str(d.id),
                "reference": d.reference,
                "user_id": str(d.user_id),
                "transaction_id": str(d.transaction_id) if d.transaction_id else None,
                "dispute_type": d.dispute_type,
                "status": d.status,
                "description": d.description,
                "admin_response": d.admin_response,
                "priority": d.priority,
                "created_at": d.created_at.isoformat(),
                "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
            }
            for d in disputes
        ],
        "total": total,
    }


@router.post("/admin/{dispute_id}/resolve")
async def resolve_dispute(
        dispute_id: str,
        data: ResolveDisputeRequest,
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = result.scalar_one_or_none()

    if not dispute:
        return {"error": "Reclamacao nao encontrada"}, 404

    if dispute.status in ("resolved_refunded", "resolved_resent", "resolved_rejected"):
        return {"error": "Reclamacao ja resolvida"}, 400

    status_map = {
        "refund": "resolved_refunded",
        "resend_code": "resolved_resent",
        "reject": "resolved_rejected",
        "request_info": "under_review",
    }

    dispute.status = status_map.get(data.action, "under_review")
    dispute.admin_response = data.response
    dispute.resolved_at = datetime.utcnow()

    # Reembolso
    if data.action == "refund" and data.refund_amount:
        from app.models.wallet import Wallet, WalletMovement

        wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == dispute.user_id)
        )
        wallet = wallet_result.scalar_one_or_none()
        if wallet:
            balance_before = wallet.balance_credit
            wallet.balance_credit += data.refund_amount

            movement = WalletMovement(
                user_id=dispute.user_id,
                amount=data.refund_amount,
                movement_type="refund",
                reference=dispute.reference,
                balance_before=balance_before,
                balance_after=wallet.balance_credit,
                description=f"Reembolso por disputa {dispute.reference}",
            )
            db.add(movement)

    await db.flush()
    await db.commit()

    return {"message": "Reclamacao resolvida", "status": dispute.status}