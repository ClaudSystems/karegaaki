from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.dispute import Dispute
from app.models.transaction import Transaction
from app.utils.reference_generator import generate_reference
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/disputes", tags=["Disputas"])


class CreateDisputeRequest(BaseModel):
    transaction_reference: Optional[str] = None
    dispute_type: str
    description: str


class ResolveDisputeRequest(BaseModel):
    action: str
    response: str
    refund_amount: Optional[float] = None


# ========== CLIENTE ==========

@router.post("")
async def create_dispute(
        data: CreateDisputeRequest,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    transaction_id = None

    if data.transaction_reference:
        result = await db.execute(
            select(Transaction).where(Transaction.reference == data.transaction_reference)
        )
        transaction = result.scalar_one_or_none()
        if transaction:
            transaction_id = str(transaction.id)

    dispute = Dispute(
        user_id=current_user.id,
        transaction_id=transaction_id,
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
                "description": d.description,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "admin_response": d.admin_response,
            }
            for d in disputes
        ]
    }


# ========== ADMIN ==========

@router.get("/admin/all")
async def get_all_disputes(
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),  # ← MUDOU
):
    result = await db.execute(
        select(Dispute).order_by(Dispute.created_at.desc())
    )
    disputes = result.scalars().all()

    return {
        "items": [
            {
                "id": str(d.id),
                "reference": d.reference,
                "user_id": str(d.user_id) if d.user_id else None,
                "transaction_id": str(d.transaction_id) if d.transaction_id else None,
                "dispute_type": d.dispute_type,
                "description": d.description,
                "status": d.status,
                "priority": d.priority,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "admin_response": d.admin_response,
            }
            for d in disputes
        ]
    }


@router.post("/admin/{dispute_id}/resolve")
async def resolve_dispute(
        dispute_id: str,
        data: ResolveDisputeRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),  # ← MUDOU
):
    result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = result.scalar_one_or_none()

    if not dispute:
        return {"error": "Disputa não encontrada"}, 404

    dispute.status = data.action
    dispute.admin_response = data.response
    dispute.resolved_by = current_admin.id
    dispute.resolved_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    return {"message": "Disputa atualizada", "status": dispute.status}