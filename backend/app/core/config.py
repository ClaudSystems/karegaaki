from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "KaregaAki"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Gateway
    GATEWAY_API_KEY: str

    # Firebase
    FCM_SERVICE_ACCOUNT: Optional[str] = None
    FCM_PROJECT_ID: str = "karegaaki"

    # Suppliers
    CODES_WHOLESALE_API_KEY: Optional[str] = None
    PREPAID_FORGE_API_KEY: Optional[str] = None
    ENEBA_API_KEY: Optional[str] = None

    # System
    CREDIT_EXPIRY_DAYS: int = 30
    MIN_STOCK_ALERT: int = 5
    CRITICAL_STOCK_ALERT: int = 2
    SUPPLIER_MIN_CREDIT: float = 50.0
    SUPPLIER_CRITICAL_CREDIT: float = 10.0
    PAYMENT_TIMEOUT_MINUTES: int = 15

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()