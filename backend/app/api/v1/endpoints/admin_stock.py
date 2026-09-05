from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.stock import StockItem
from app.models.product import Product
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import hashlib

router = APIRouter(prefix="/admin/stock", tags=["Admin - Stock"])


def generate_code_hash(code: str) -> str:
    """Gerar hash SHA256 do código"""
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


class BulkStockCreate(BaseModel):
    product_id: str
    codes: List[str]
    expiry_date: Optional[str] = None


@router.get("/items")
async def get_stock_items(
        product_id: Optional[str] = Query(None),
        status: Optional[str] = Query(None),
        page: int = Query(1, ge=1),
        page_size: int = Query(50, ge=1, le=200),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = select(StockItem)

    if product_id:
        query = query.where(StockItem.product_id == product_id)
    if status:
        query = query.where(StockItem.status == status)

    query = query.order_by(StockItem.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "code": item.code,
                "status": item.status,
                "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
                "sold_at": item.sold_at.isoformat() if item.sold_at else None,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/bulk-add")
async def bulk_add_stock(
        data: BulkStockCreate,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    # Verificar se produto existe
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        return {"error": "Produto não encontrado"}, 404

    expiry = None
    if data.expiry_date:
        try:
            expiry = datetime.fromisoformat(data.expiry_date)
        except:
            return {"error": "Data de expiração inválida. Use formato YYYY-MM-DD"}, 400

    items_created = []
    for code in data.codes:
        code = code.strip()
        if not code:
            continue

        # Verificar se código já existe
        code_hash = generate_code_hash(code)
        existing = await db.execute(
            select(StockItem).where(StockItem.code_hash == code_hash)
        )
        if existing.scalar_one_or_none():
            continue  # Pular códigos duplicados

        stock_item = StockItem(
            product_id=data.product_id,
            code=code,
            code_hash=code_hash,
            status="available",
            expiry_date=expiry,
        )
        db.add(stock_item)
        items_created.append(code)

    await db.flush()
    await db.commit()

    return {
        "message": f"{len(items_created)} códigos adicionados",
        "count": len(items_created),
        "codes": items_created,
    }


@router.delete("/items/{item_id}")
async def delete_stock_item(
        item_id: str,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(StockItem).where(StockItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return {"error": "Item não encontrado"}, 404

    if item.status == "sold":
        return {"error": "Não é possível eliminar item vendido"}, 400

    await db.delete(item)
    await db.commit()

    return {"message": "Item eliminado"}