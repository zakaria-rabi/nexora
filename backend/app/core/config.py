"""
Application configuration using Pydantic Settings.
Loads from .env file automatically.
"""
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────
    APP_NAME: str = "NEXORA"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = secrets.token_urlsafe(32)
    API_VERSION: str = "1.0.0"

    # ── Database ───────────────────────────────────
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "nexora"
    POSTGRES_PASSWORD: str = "nexora_secret"
    POSTGRES_DB: str = "nexora_db"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SYNC_DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ── Redis ──────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    CACHE_TTL: int = 3600  # 1 hour default

    @property
    def REDIS_URL(self) -> str:
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # ── JWT ────────────────────────────────────────
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24       # 24h
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── CORS ───────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://nexora.yourdomain.com",
    ]
    ALLOWED_HOSTS: List[str] = ["*"]

    # ── File Upload ────────────────────────────────
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    # ── ML Recommendation System ───────────────────
    ML_MODEL_PATH: str = "app/ml/models"
    ML_RETRAIN_INTERVAL_HOURS: int = 24
    ML_MIN_INTERACTIONS: int = 5        # Min interactions before personalized recs
    ML_RECOMMENDATIONS_COUNT: int = 10
    ML_HYBRID_COLLAB_WEIGHT: float = 0.6
    ML_HYBRID_CONTENT_WEIGHT: float = 0.4

    # ── Pagination ─────────────────────────────────
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # ── Logging ────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/nexora.log"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
