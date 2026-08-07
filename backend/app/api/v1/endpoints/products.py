from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Produtos"])


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    service = ProductService(db)
    return await service.get_categories()


@router.get("")
async def get_products(
        category_id: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        sort_by: str = Query("name"),
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = ProductService(db)
    products, total = await service.get_products(
        category_id=category_id,
        search=search,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )
    return {
        "items": [p.model_dump(mode="json") for p in products],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{product_id}")
async def get_product_detail(
        product_id: str,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    service = ProductService(db)
    product = await service.get_product_detail(product_id)
    if not product:
        return {"error": "Produto não encontrado"}, 404
    return product.model_dump(mode="json")