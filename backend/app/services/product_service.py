"""Product service layer with search, filter, pagination."""
import math
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from slugify import slugify
from app.models.models import Product, ProductImage, Category
from app.schemas.schemas import ProductCreate, ProductUpdate

class ProductService:
    @staticmethod
    async def get_by_id(db: AsyncSession, product_id: UUID) -> Optional[Product]:
        result = await db.execute(
            select(Product).options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> Optional[Product]:
        result = await db.execute(
            select(Product).options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.slug == slug, Product.is_active == True)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_products(db: AsyncSession, page=1, page_size=20, category_id=None,
                            brand=None, min_price=None, max_price=None, search=None,
                            sort_by="created_at", sort_order="desc", featured_only=False):
        q = select(Product).options(selectinload(Product.images), selectinload(Product.category))
        q = q.where(Product.is_active == True)

        if category_id:
            q = q.where(Product.category_id == category_id)
        if brand:
            q = q.where(Product.brand.ilike(f"%{brand}%"))
        if min_price is not None:
            q = q.where(Product.price >= min_price)
        if max_price is not None:
            q = q.where(Product.price <= max_price)
        if search:
            q = q.where(or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.brand.ilike(f"%{search}%"),
            ))
        if featured_only:
            q = q.where(Product.is_featured == True)

        col = getattr(Product, sort_by, Product.created_at)
        q = q.order_by(col.desc() if sort_order == "desc" else col.asc())

        total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
        items = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()

        return {
            "items": items, "total": total, "page": page,
            "page_size": page_size, "pages": math.ceil(total / page_size)
        }

    @staticmethod
    async def create(db: AsyncSession, payload: ProductCreate) -> Product:
        data = payload.model_dump()
        product = Product(**data, slug=slugify(payload.name))
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def update(db: AsyncSession, product: Product, payload: ProductUpdate) -> Product:
        for k, v in payload.model_dump(exclude_none=True).items():
            setattr(product, k, v)
        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def delete(db: AsyncSession, product: Product):
        product.is_active = False
        await db.commit()
