"""
Script para popular a base de dados com dados de teste.
Executar: python scripts/seed_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import async_session, engine, Base
from app.models import *
from sqlalchemy import select


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Verificar se já tem dados
        result = await db.execute(select(CreditPackage))
        if result.scalars().first():
            print("Base de dados já tem dados. A saltar seed.")
            return

        # Categorias
        categories = [
            ProductCategory(name="Jogos", slug="jogos", icon="gamepad", display_order=1),
            ProductCategory(name="Gift Cards", slug="gift-cards", icon="gift", display_order=2),
            ProductCategory(name="Software", slug="software", icon="laptop", display_order=3),
            ProductCategory(name="Streaming", slug="streaming", icon="tv", display_order=4),
            ProductCategory(name="Recargas", slug="recargas", icon="phone", display_order=5),
        ]
        db.add_all(categories)
        await db.flush()
        print(f"Categorias criadas: {len(categories)}")

        # Pacotes de Crédito
        packages = [
            CreditPackage(name="Básico", credit_amount=5, price_mzn=50, bonus_credit=0, display_order=1),
            CreditPackage(name="Popular", credit_amount=10, price_mzn=100, bonus_credit=1, display_order=2),
            CreditPackage(name="Económico", credit_amount=25, price_mzn=250, bonus_credit=3, display_order=3),
            CreditPackage(name="Premium", credit_amount=55, price_mzn=500, bonus_credit=5, display_order=4),
        ]
        db.add_all(packages)
        await db.flush()
        print(f"Pacotes de crédito criados: {len(packages)}")

        # Produtos
        products = [
            Product(
                name="Gift Card Google Play 10 USD",
                slug="gift-card-google-play-10",
                description="Cartão presente Google Play no valor de 10 USD.",
                category_id=categories[1].id,
                credit_price=12,
                cost_price_usd=9.50,
            ),
            Product(
                name="Gift Card Steam 20 USD",
                slug="gift-card-steam-20",
                description="Cartão presente Steam no valor de 20 USD.",
                category_id=categories[0].id,
                credit_price=22,
                cost_price_usd=18.00,
            ),
            Product(
                name="Netflix Gift Card 25 USD",
                slug="netflix-gift-card-25",
                description="Cartão presente Netflix 25 USD.",
                category_id=categories[3].id,
                credit_price=28,
                cost_price_usd=23.00,
            ),
            Product(
                name="Spotify Premium 3 Meses",
                slug="spotify-premium-3-meses",
                description="Assinatura Spotify Premium por 3 meses.",
                category_id=categories[3].id,
                credit_price=15,
                cost_price_usd=12.00,
            ),
            Product(
                name="Minecraft Java Edition",
                slug="minecraft-java-edition",
                description="Código digital para Minecraft Java Edition.",
                category_id=categories[0].id,
                credit_price=30,
                cost_price_usd=26.00,
            ),
            Product(
                name="Microsoft 365 Personal 1 Ano",
                slug="microsoft-365-personal-1-ano",
                description="Assinatura Microsoft 365 Personal por 1 ano.",
                category_id=categories[2].id,
                credit_price=65,
                cost_price_usd=55.00,
            ),
            Product(
                name="Gift Card Amazon 50 USD",
                slug="gift-card-amazon-50",
                description="Cartão presente Amazon no valor de 50 USD.",
                category_id=categories[1].id,
                credit_price=55,
                cost_price_usd=48.00,
            ),
            Product(
                name="Recarga M-Pesa 100 MZN",
                slug="recarga-mpesa-100",
                description="Recarga direta de 100 MZN no seu número M-Pesa.",
                category_id=categories[4].id,
                credit_price=10,
                cost_price_usd=0.90,
            ),
        ]
        db.add_all(products)
        await db.flush()
        print(f"Produtos criados: {len(products)}")

        # Stock
        import hashlib
        import uuid as uuid_module

        stock_items = []
        for product in products:
            for i in range(10):
                unique_id = str(uuid_module.uuid4())[:8]
                code = f"KAREGA-{product.slug[:4].upper()}-{unique_id}"
                code_hash = hashlib.sha256(code.encode()).hexdigest()
                stock_items.append(
                    StockItem(
                        product_id=product.id,
                        code=code,
                        code_hash=code_hash,
                        batch_id="SEED-BATCH-001",
                        status="available",
                    )
                )

        db.add_all(stock_items)
        await db.flush()
        print(f"Stock items criados: {len(stock_items)}")

        # COMMIT explícito
        await db.commit()
        print("\n✅ Seed concluído com sucesso!")
        print(f"  - Categorias: {len(categories)}")
        print(f"  - Pacotes de Crédito: {len(packages)}")
        print(f"  - Produtos: {len(products)}")
        print(f"  - Stock Items: {len(stock_items)}")


if __name__ == "__main__":
    asyncio.run(seed())