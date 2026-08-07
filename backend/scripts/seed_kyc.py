import asyncio
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import async_session
from app.models.kyc import KycLevelConfig

async def seed():
    async with async_session() as db:
        levels = [
            KycLevelConfig(level="basic", name="Básico", max_credit_limit=500, require_document=False, daily_transaction_limit=5),
            KycLevelConfig(level="verified", name="Verificado", max_credit_limit=5000, require_document=True, daily_transaction_limit=20),
            KycLevelConfig(level="premium", name="Premium", max_credit_limit=50000, require_document=True, daily_transaction_limit=100),
        ]
        for l in levels:
            db.add(l)
        await db.commit()
        print("✅ KYC Levels criados!")

asyncio.run(seed())