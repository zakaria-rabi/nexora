"""Categories Routes"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryResponse, CategoryCreate
from app.core.security import get_current_admin

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True).order_by(Category.sort_order))
    return result.scalars().all()

@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    from python_slugify import slugify
    cat = Category(name=payload.name, slug=slugify(payload.name), **payload.model_dump(exclude={"name"}))
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat
