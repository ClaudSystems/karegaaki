from pydantic import BaseModel, Field, ConfigDict
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