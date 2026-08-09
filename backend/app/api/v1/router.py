from fastapi import APIRouter
from app.api.v1.endpoints import admin_customers
from app.api.v1.endpoints import admin_users
from app.api.v1.endpoints import disputes
from app.api.v1.endpoints import payments
from app.api.v1.endpoints import kyc
from app.api.v1.endpoints import (
    auth, products, credits, wallet, transactions,
    admin_products, admin_credits, admin_wallets, admin_transactions, admin_dashboard,
)


router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(products.router)
router.include_router(credits.router)
router.include_router(wallet.router)
router.include_router(transactions.router)
router.include_router(admin_products.router)
router.include_router(admin_credits.router)
router.include_router(admin_wallets.router)
router.include_router(admin_transactions.router)
router.include_router(admin_dashboard.router)
router.include_router(admin_users.router)
router.include_router(admin_customers.router)
router.include_router(disputes.router)
router.include_router(payments.router)
router.include_router(kyc.router)
