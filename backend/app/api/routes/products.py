"""
Product Routes: CRUD, search, filters, product detail
"""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.models import User, InteractionType, INTERACTION_WEIGHTS
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductDetailResponse,
    ProductListResponse, PaginatedResponse
)
from app.services.product_service import ProductService
from app.services.interaction_service import InteractionService

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(price|name|avg_rating|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    featured_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    List products with filtering, searching, and pagination.
    
    - **search**: Full-text search on name, description, brand
    - **sort_by**: price | name | avg_rating | created_at
    - **featured_only**: Return only featured products
    """
    result = await ProductService.list_products(
        db,
        page=page,
        page_size=page_size,
        category_id=category_id,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        featured_only=featured_only,
    )
    return result


@router.get("/{slug}", response_model=ProductDetailResponse)
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Get full product details by slug.
    Also records a 'view' interaction if user is authenticated.
    """
    product = await ProductService.get_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Record user interaction for ML
    if current_user:
        await InteractionService.record(
            db,
            user_id=current_user.id,
            product_id=product.id,
            interaction_type=InteractionType.view,
            weight=INTERACTION_WEIGHTS[InteractionType.view],
        )

    return product


# Admin-only routes
@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Create a new product (Admin only)."""
    return await ProductService.create(db, payload)


@router.patch("/{product_id}", response_model=ProductDetailResponse)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Update a product (Admin only)."""
    product = await ProductService.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await ProductService.update(db, product, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Soft-delete a product (Admin only)."""
    product = await ProductService.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await ProductService.delete(db, product)
