from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.product import Product, ProductCategory
from app.models.stock import StockItem
from app.schemas.product import ProductResponse, ProductDetailResponse, ProductCategoryResponse


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_categories(self) -> List[ProductCategoryResponse]:
        result = await self.db.execute(
            select(ProductCategory).where(ProductCategory.is_active == True).order_by(ProductCategory.display_order)
        )
        categories = result.scalars().all()
        return [ProductCategoryResponse.model_validate(c) for c in categories]

    async def get_products(
            self,
            category_id: Optional[str] = None,
            search: Optional[str] = None,
            sort_by: str = "name",
            page: int = 1,
            page_size: int = 20,
    ) -> tuple[List[ProductResponse], int]:
        query = select(Product).where(Product.is_active == True)

        if category_id:
            query = query.where(Product.category_id == category_id)

        if search:
            query = query.where(Product.name.ilike(f"%{search}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        if sort_by == "price_asc":
            query = query.order_by(Product.credit_price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.credit_price.desc())
        else:
            query = query.order_by(Product.name.asc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        products = result.scalars().all()

        product_responses = []
        for p in products:
            stock_count = await self.db.execute(
                select(func.count()).select_from(StockItem).where(
                    StockItem.product_id == p.id,
                    StockItem.status == "available",
                    )
            )
            available = stock_count.scalar_one()
            resp = ProductResponse.model_validate(p)
            resp.stock_available = available
            product_responses.append(resp)

        return product_responses, total

    async def get_product_detail(self, product_id: str) -> Optional[ProductDetailResponse]:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            return None

        stock_count = await self.db.execute(
            select(func.count()).select_from(StockItem).where(
                StockItem.product_id == product.id,
                StockItem.status == "available",
                )
        )
        available = stock_count.scalar_one()

        resp = ProductDetailResponse.model_validate(product)
        resp.stock_available = available

        if product.category_id:
            cat_result = await self.db.execute(
                select(ProductCategory).where(ProductCategory.id == product.category_id)
            )
            category = cat_result.scalar_one_or_none()
            if category:
                resp.category_name = category.name

        return resp