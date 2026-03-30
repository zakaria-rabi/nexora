"""
Admin Routes: Dashboard analytics, user/order management
"""
from datetime import datetime, timedelta, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.core.security import get_current_admin
from app.models.models import User, Product, Order, OrderItem, OrderStatus
from app.schemas.schemas import AdminStats, RevenueDataPoint, TopProduct, UserResponse

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Get high-level dashboard statistics."""
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Total counts
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_products = (await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True)
    )).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()

    # Revenue
    total_revenue_row = await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status != OrderStatus.cancelled)
    )
    total_revenue = total_revenue_row.scalar() or 0

    # Today's metrics
    orders_today = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= today)
    )).scalar()

    revenue_today_row = await db.execute(
        select(func.sum(Order.total_amount)).where(
            and_(Order.created_at >= today, Order.status != OrderStatus.cancelled)
        )
    )
    revenue_today = revenue_today_row.scalar() or 0

    new_users_today = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= today)
    )).scalar()

    low_stock = (await db.execute(
        select(func.count(Product.id)).where(
            and_(Product.is_active == True, Product.stock_quantity < 10)
        )
    )).scalar()

    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        orders_today=orders_today,
        revenue_today=revenue_today,
        new_users_today=new_users_today,
        low_stock_products=low_stock,
    )


@router.get("/revenue", response_model=List[RevenueDataPoint])
async def get_revenue_chart(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Get daily revenue data for the past N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Order.created_at).label("date"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .where(
            and_(Order.created_at >= cutoff, Order.status != OrderStatus.cancelled)
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    rows = result.all()

    return [
        RevenueDataPoint(date=str(r.date), revenue=r.revenue or 0, orders=r.orders)
        for r in rows
    ]


@router.get("/top-products", response_model=List[TopProduct])
async def get_top_products(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Get top-selling products by revenue."""
    result = await db.execute(
        select(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .group_by(OrderItem.product_id, OrderItem.product_name)
        .order_by(func.sum(OrderItem.subtotal).desc())
        .limit(limit)
    )
    rows = result.all()
    return [
        TopProduct(
            product_id=r.product_id,
            product_name=r.product_name,
            total_sold=r.total_sold,
            revenue=r.revenue or 0,
        )
        for r in rows
    ]


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """List all users with optional search."""
    query = select(User)
    if search:
        query = query.where(
            User.email.ilike(f"%{search}%") | User.username.ilike(f"%{search}%")
        )
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Activate or deactivate a user account."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"user_id": str(user_id), "is_active": user.is_active}


@router.get("/orders")
async def list_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20),
    status: str = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    """List all orders with filtering by status."""
    from app.services.order_service import OrderService
    return await OrderService.list_all(db, page=page, page_size=page_size, status=status)
