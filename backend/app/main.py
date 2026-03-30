"""
NEXORA E-Commerce API
FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import engine, Base
from app.api.routes import (
    auth, users, products, categories,
    cart, orders, reviews, recommendations, admin
)

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("🚀 NEXORA API starting up...")
    # Create tables (use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables ready")
    yield
    logger.info("🛑 NEXORA API shutting down...")
    await engine.dispose()


app = FastAPI(
    title="NEXORA E-Commerce API",
    description="""
    ## AI-Powered E-Commerce Platform
    
    ### Features
    - 🛒 Full e-commerce functionality
    - 🤖 AI-powered recommendation engine
    - 🔐 JWT authentication
    - 📊 Admin analytics dashboard
    
    ### Authentication
    Use Bearer token from `/api/auth/login` endpoint.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)


@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Add X-Process-Time header to all responses."""
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{(time.perf_counter() - start) * 1000:.2f}ms"
    return response


# ── Routes ──────────────────────────────────────────────────
PREFIX = "/api"

app.include_router(auth.router,            prefix=f"{PREFIX}/auth",            tags=["Authentication"])
app.include_router(users.router,           prefix=f"{PREFIX}/users",           tags=["Users"])
app.include_router(products.router,        prefix=f"{PREFIX}/products",        tags=["Products"])
app.include_router(categories.router,      prefix=f"{PREFIX}/categories",      tags=["Categories"])
app.include_router(cart.router,            prefix=f"{PREFIX}/cart",            tags=["Cart"])
app.include_router(orders.router,          prefix=f"{PREFIX}/orders",          tags=["Orders"])
app.include_router(reviews.router,         prefix=f"{PREFIX}/reviews",         tags=["Reviews"])
app.include_router(recommendations.router, prefix=f"{PREFIX}/recommendations", tags=["Recommendations"])
app.include_router(admin.router,           prefix=f"{PREFIX}/admin",           tags=["Admin"])


# ── Health Check ────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "nexora-api"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to NEXORA API",
        "docs": "/docs",
        "health": "/health",
    }
