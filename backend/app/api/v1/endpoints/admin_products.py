from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
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


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    credit_price: Optional[float] = None
    is_active: Optional[bool] = None


@router.post("")
async def create_product(
        data: ProductCreate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    product = Product(
        name=data.name,
        slug=data.slug,
        description=data.description,
        category_id=data.category_id,
        credit_price=data.credit_price,
        is_active=data.is_active,
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
        current_user=Depends(get_current_user),
):
    from sqlalchemy import select
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
        current_user=Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        return {"error": "Produto não encontrado"}, 404

    # Soft delete - apenas desativa
    product.is_active = False
    await db.flush()
    await db.commit()
    return {"message": "Produto desativado"}