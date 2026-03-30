"""Order service - handles checkout and order management."""
import math
import random
import string
from decimal import Decimal
from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.models import Order, OrderItem, CartItem, Product, User, InteractionType, INTERACTION_WEIGHTS
from app.schemas.schemas import CheckoutRequest

TAX_RATE = Decimal("0.08")
SHIPPING_RATE = Decimal("9.99")

def generate_order_number():
    suffix = "".join(random.choices(string.digits, k=6))
    return f"NXR-{suffix}"

class OrderService:
    @staticmethod
    async def checkout(db: AsyncSession, user: User, payload: CheckoutRequest) -> Order:
        # Get cart items
        result = await db.execute(
            select(CartItem).options(selectinload(CartItem.product))
            .where(CartItem.user_id == user.id)
        )
        cart_items = result.scalars().all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        subtotal = sum(Decimal(str(item.product.price)) * item.quantity for item in cart_items)
        tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
        total = subtotal + tax + SHIPPING_RATE

        order = Order(
            order_number=generate_order_number(),
            user_id=user.id,
            subtotal=subtotal,
            tax_amount=tax,
            shipping_amount=SHIPPING_RATE,
            total_amount=total,
            shipping_address=payload.shipping_address.model_dump(),
            payment_method=payload.payment_method,
            notes=payload.notes,
        )
        db.add(order)
        await db.flush()

        for item in cart_items:
            oi = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.price,
                subtotal=Decimal(str(item.product.price)) * item.quantity,
            )
            db.add(oi)
            # Reduce stock
            item.product.stock_quantity = max(0, item.product.stock_quantity - item.quantity)

        # Clear cart
        for item in cart_items:
            await db.delete(item)

        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def get_user_orders(db: AsyncSession, user_id: UUID) -> List[Order]:
        result = await db.execute(
            select(Order).options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, order_id: UUID) -> Optional[Order]:
        result = await db.execute(
            select(Order).options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_all(db: AsyncSession, page=1, page_size=20, status=None):
        q = select(Order).options(selectinload(Order.items), selectinload(Order.user))
        if status:
            q = q.where(Order.status == status)
        q = q.order_by(Order.created_at.desc())
        total_result = await db.execute(select(math.ceil).select_from(q.subquery()))
        items = (await db.execute(q.offset((page-1)*page_size).limit(page_size))).scalars().all()
        return {"items": items, "page": page, "page_size": page_size}
