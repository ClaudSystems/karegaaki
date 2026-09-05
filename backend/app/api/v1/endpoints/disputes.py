from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.dispute import Dispute, DisputeMessage
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


class SendMessageRequest(BaseModel):
    message: str


class ReopenDisputeRequest(BaseModel):
    reason: str


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
                "reopen_count": d.reopen_count,
                "reopened_at": d.reopened_at.isoformat() if d.reopened_at else None,
            }
            for d in disputes
        ]
    }


@router.get("/{dispute_id}/messages")
async def get_dispute_messages(
        dispute_id: str,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.user_id == current_user.id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        return {"error": "Disputa não encontrada"}, 404

    result = await db.execute(
        select(DisputeMessage)
        .where(DisputeMessage.dispute_id == dispute_id)
        .order_by(DisputeMessage.created_at.asc())
    )
    messages = result.scalars().all()

    return {
        "items": [
            {
                "id": str(m.id),
                "sender_type": m.sender_type,
                "sender_id": str(m.sender_id) if m.sender_id else None,
                "message": m.message,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }


@router.post("/{dispute_id}/messages")
async def send_dispute_message(
        dispute_id: str,
        data: SendMessageRequest,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.user_id == current_user.id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        return {"error": "Disputa não encontrada"}, 404

    message = DisputeMessage(
        dispute_id=dispute_id,
        sender_type="client",
        sender_id=current_user.id,
        message=data.message,
    )
    db.add(message)
    await db.flush()
    await db.commit()

    return {"id": str(message.id), "message": "Mensagem enviada"}


@router.post("/{dispute_id}/reopen")
async def reopen_dispute(
        dispute_id: str,
        data: ReopenDisputeRequest,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dispute).where(Dispute.id == dispute_id, Dispute.user_id == current_user.id)
    )
    dispute = result.scalar_one_or_none()
    if not dispute:
        return {"error": "Disputa não encontrada"}, 404

    if dispute.status not in ["resolved_refunded", "resolved_resent", "resolved_rejected", "closed"]:
        return {"error": "Disputa não pode ser reaberta no estado atual"}, 400

    dispute.status = "reopened"
    dispute.reopen_count += 1
    dispute.reopened_at = datetime.utcnow()
    dispute.reopen_reason = data.reason
    dispute.admin_response = None
    dispute.resolved_at = None

    await db.flush()
    await db.commit()

    return {
        "message": "Disputa reaberta com sucesso",
        "status": "reopened",
        "reopen_count": dispute.reopen_count,
    }


# ========== ADMIN ==========

@router.get("/admin/all")
async def get_all_disputes(
        status: Optional[str] = Query(None),
        priority: Optional[str] = Query(None),
        dispute_type: Optional[str] = Query(None),
        start_date: Optional[str] = Query(None),
        end_date: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = select(Dispute)

    # Filtro por status
    if status:
        query = query.where(Dispute.status == status)

    # Filtro por prioridade
    if priority:
        query = query.where(Dispute.priority == priority)

    # Filtro por tipo
    if dispute_type:
        query = query.where(Dispute.dispute_type == dispute_type)

    # Filtro por data inicial
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.where(Dispute.created_at >= start)
        except:
            pass

    # Filtro por data final
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.where(Dispute.created_at <= end)
        except:
            pass

    # Busca por referência ou descrição
    if search:
        query = query.where(
            (Dispute.reference.ilike(f"%{search}%")) |
            (Dispute.description.ilike(f"%{search}%"))
        )

    query = query.order_by(Dispute.created_at.desc())

    # Contagem total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Paginação
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
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
                "reopen_count": d.reopen_count,
                "reopened_at": d.reopened_at.isoformat() if d.reopened_at else None,
                "reopen_reason": d.reopen_reason,
            }
            for d in disputes
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.get("/admin/{dispute_id}/messages")
async def get_dispute_messages_admin(
        dispute_id: str,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(DisputeMessage)
        .where(DisputeMessage.dispute_id == dispute_id)
        .order_by(DisputeMessage.created_at.asc())
    )
    messages = result.scalars().all()

    return {
        "items": [
            {
                "id": str(m.id),
                "sender_type": m.sender_type,
                "sender_id": str(m.sender_id) if m.sender_id else None,
                "message": m.message,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }


@router.post("/admin/{dispute_id}/messages")
async def send_dispute_message_admin(
        dispute_id: str,
        data: SendMessageRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    message = DisputeMessage(
        dispute_id=dispute_id,
        sender_type="admin",
        sender_id=current_admin.id,
        message=data.message,
    )
    db.add(message)
    await db.flush()
    await db.commit()

    return {"id": str(message.id), "message": "Mensagem enviada"}


@router.post("/admin/{dispute_id}/resolve")
async def resolve_dispute(
        dispute_id: str,
        data: ResolveDisputeRequest,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
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