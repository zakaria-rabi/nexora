"""Reviews Routes"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.models import User, Review
from app.schemas.schemas import ReviewCreate, ReviewResponse

router = APIRouter()

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.product_id == product_id).order_by(Review.created_at.desc()))
    return result.scalars().all()

@router.post("/product/{product_id}", response_model=ReviewResponse, status_code=201)
async def create_review(
    product_id: UUID,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = Review(user_id=current_user.id, product_id=product_id, **payload.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review
