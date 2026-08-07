from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.credit import CreditPackage
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin/credits", tags=["Admin - Créditos"])


class CreditPackageCreate(BaseModel):
    name: str
    credit_amount: float
    price_mzn: float
    bonus_credit: float = 0
    is_active: bool = True
    display_order: int = 0


class CreditPackageUpdate(BaseModel):
    name: Optional[str] = None
    credit_amount: Optional[float] = None
    price_mzn: Optional[float] = None
    bonus_credit: Optional[float] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


@router.post("/packages")
async def create_package(data: CreditPackageCreate, db: AsyncSession = Depends(get_db)):
    pkg = CreditPackage(**data.model_dump())
    db.add(pkg)
    await db.flush()
    await db.commit()
    return {"id": str(pkg.id), "name": pkg.name}


@router.put("/packages/{package_id}")
async def update_package(package_id: str, data: CreditPackageUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditPackage).where(CreditPackage.id == package_id))
    pkg = result.scalar_one_or_none()
    if not pkg:
        return {"error": "Pacote não encontrado"}, 404
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(pkg, k, v)
    await db.flush()
    await db.commit()
    return {"id": str(pkg.id), "name": pkg.name}


@router.delete("/packages/{package_id}")
async def delete_package(package_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditPackage).where(CreditPackage.id == package_id))
    pkg = result.scalar_one_or_none()
    if not pkg:
        return {"error": "Pacote não encontrado"}, 404
    pkg.is_active = False
    await db.flush()
    await db.commit()
    return {"message": "Pacote desativado"}