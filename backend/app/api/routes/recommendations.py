"""
Recommendation Routes: Personalized, similar products, trending
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.models import User, UserInteraction, Recommendation, Product
from app.schemas.schemas import RecommendationResponse
from app.ml.engine import recommendation_engine
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/for-you", response_model=List[RecommendationResponse])
async def get_personalized_recommendations(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get personalized product recommendations for the current user.
    
    Uses a hybrid collaborative + content-based model.
    Falls back to trending products for new users (cold start).
    """
    return await RecommendationService.get_for_user(db, current_user.id, limit)


@router.get("/similar/{product_id}", response_model=List[RecommendationResponse])
async def get_similar_products(
    product_id: UUID,
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """
    Get products similar to the given product.
    Shown on the product detail page.
    """
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return await RecommendationService.get_similar(db, product_id, limit)


@router.get("/trending", response_model=List[RecommendationResponse])
async def get_trending_products(
    limit: int = Query(10, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    """
    Get trending products based on recent interactions.
    Shown on homepage for all visitors.
    """
    return await RecommendationService.get_trending(db, limit)


@router.post("/retrain", status_code=202)
async def trigger_retrain(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """
    Trigger ML model retraining (Admin only).
    Runs in background — returns immediately.
    """
    background_tasks.add_task(RecommendationService.retrain, db)
    return {"message": "Model retraining started in background"}
