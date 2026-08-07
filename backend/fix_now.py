import os, re

DIR = r"W:\KaregaAki\backend\app\schemas"

files = {
    "credit.py": '''from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from uuid import UUID


class CreditPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    credit_amount: Decimal
    price_mzn: Decimal
    bonus_credit: Decimal
    is_active: bool
    display_order: int


class CreditPurchaseRequest(BaseModel):
    package_id: str


class CreditPurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    reference: str
    amount_mzn: Decimal
    credit_received: Decimal
    status: str
    payment_instructions: Optional[str] = None


class CreditPurchaseStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    reference: str
    status: str
    credit_received: Decimal
    confirmed_at: Optional[str] = None
''',
    "product.py": '''from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from uuid import UUID


class ProductCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    slug: str
    icon: Optional[str] = None
    display_order: int
    is_active: bool


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    image_url: Optional[str] = None
    credit_price: Decimal
    is_active: bool
    stock_available: int = 0


class ProductDetailResponse(ProductResponse):
    model_config = ConfigDict(from_attributes=True)
    cost_price_usd: Optional[Decimal] = None
    supplier_id: Optional[UUID] = None
    supplier_name: Optional[str] = None
    min_stock_alert: int
    created_at: str
    updated_at: str


class ProductListFilter(BaseModel):
    category_id: Optional[str] = None
    search: Optional[str] = None
    is_active: Optional[bool] = True
    sort_by: Optional[str] = "name"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
''',
}

for fname, content in files.items():
    path = os.path.join(DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ {fname}")

print("\\nFeito! Reinicia o servidor.")
