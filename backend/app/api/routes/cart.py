"""Cart Routes"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.models import User, InteractionType, INTERACTION_WEIGHTS
from app.schemas.schemas import CartItemAdd, CartItemUpdate, CartResponse
from app.services.cart_service import CartService
from app.services.interaction_service import InteractionService

router = APIRouter()


@router.get("", response_model=CartResponse)
async def get_cart(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get current user's cart."""
    return await CartService.get_cart(db, current_user.id)


@router.post("/items", response_model=CartResponse)
async def add_to_cart(
    payload: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a product to cart. Records add_to_cart interaction for ML."""
    cart = await CartService.add_item(db, current_user.id, payload.product_id, payload.quantity)

    # Record interaction for recommendation engine
    await InteractionService.record(
        db,
        user_id=current_user.id,
        product_id=payload.product_id,
        interaction_type=InteractionType.add_to_cart,
        weight=INTERACTION_WEIGHTS[InteractionType.add_to_cart],
    )
    return cart


@router.patch("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: UUID,
    payload: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update quantity (set to 0 to remove)."""
    return await CartService.update_item(db, current_user.id, product_id, payload.quantity)


@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a specific item from cart."""
    return await CartService.remove_item(db, current_user.id, product_id)


@router.delete("", status_code=204)
async def clear_cart(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Clear all items from cart."""
    await CartService.clear_cart(db, current_user.id)
