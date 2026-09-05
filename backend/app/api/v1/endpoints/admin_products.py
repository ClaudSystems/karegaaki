from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.product import Product
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin/products", tags=["Admin - Produtos"])


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    credit_price: float
    is_active: bool = True
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    credit_price: Optional[float] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None


@router.get("")
async def get_products(
        search: Optional[str] = Query(None),
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    query = select(Product)

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    query = query.order_by(Product.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "items": [
            {
                "id": str(p.id),
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "category_id": str(p.category_id) if p.category_id else None,
                "credit_price": str(p.credit_price),
                "is_active": p.is_active,
                "display_order": p.display_order,
                "image_url": p.image_url,  # ← ADICIONADO
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("")
async def create_product(
        data: ProductCreate,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    product = Product(
        name=data.name,
        slug=data.slug,
        description=data.description,
        category_id=data.category_id,
        credit_price=data.credit_price,
        is_active=data.is_active,
        image_url=data.image_url,  # ← ADICIONADO
    )
    db.add(product)
    await db.flush()
    await db.commit()
    return {"id": str(product.id), "name": product.name, "slug": product.slug}


@router.put("/{product_id}")
async def update_product(
        product_id: str,
        data: ProductUpdate,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        return {"error": "Produto não encontrado"}, 404

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    await db.flush()
    await db.commit()
    return {"id": str(product.id), "name": product.name, "slug": product.slug}


@router.delete("/{product_id}")
async def delete_product(
        product_id: str,
        db: AsyncSession = Depends(get_db),
        current_admin=Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        return {"error": "Produto não encontrado"}, 404

    product.is_active = False
    await db.flush()
    await db.commit()
    return {"message": "Produto desativado"}