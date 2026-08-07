from sqlalchemy import Column, String, Boolean, Numeric, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import uuid


class ProductCategory(BaseModel):
    __tablename__ = "product_categories"

    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    icon = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<ProductCategory {self.name}>"


class Product(BaseModel):
    __tablename__ = "products"

    name = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.id"), nullable=True)
    image_url = Column(String(500), nullable=True)
    credit_price = Column(Numeric(10, 2), nullable=False)
    cost_price_usd = Column(Numeric(10, 4), nullable=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True)
    supplier_product_id = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    min_stock_alert = Column(Integer, default=5)
    display_order = Column(Integer, default=0)

    def __repr__(self):
        return f"<Product {self.name}>"