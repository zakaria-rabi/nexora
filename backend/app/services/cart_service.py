"""Cart service."""
from decimal import Decimal
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.models import CartItem, Product

TAX_RATE = Decimal("0.08")

class CartService:
    @staticmethod
    async def get_cart(db: AsyncSession, user_id: UUID):
        result = await db.execute(
            select(CartItem).options(selectinload(CartItem.product).selectinload(Product.images))
            .where(CartItem.user_id == user_id)
        )
        items = result.scalars().all()
        subtotal = sum(Decimal(str(i.product.price)) * i.quantity for i in items)
        tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
        return {
            "items": items, "total_items": sum(i.quantity for i in items),
            "subtotal": subtotal, "estimated_tax": tax, "total": subtotal + tax
        }

    @staticmethod
    async def add_item(db: AsyncSession, user_id: UUID, product_id: UUID, quantity: int):
        product = await db.get(Product, product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.stock_quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        result = await db.execute(
            select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.quantity += quantity
        else:
            item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
            db.add(item)
        await db.commit()
        return await CartService.get_cart(db, user_id)

    @staticmethod
    async def update_item(db: AsyncSession, user_id: UUID, product_id: UUID, quantity: int):
        if quantity == 0:
            return await CartService.remove_item(db, user_id, product_id)
        result = await db.execute(
            select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.quantity = quantity
            await db.commit()
        return await CartService.get_cart(db, user_id)

    @staticmethod
    async def remove_item(db: AsyncSession, user_id: UUID, product_id: UUID):
        await db.execute(delete(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id))
        await db.commit()
        return await CartService.get_cart(db, user_id)

    @staticmethod
    async def clear_cart(db: AsyncSession, user_id: UUID):
        await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
        await db.commit()
