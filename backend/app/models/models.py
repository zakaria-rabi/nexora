"""
SQLAlchemy ORM Models for NEXORA E-Commerce Platform.
All models use UUIDs as primary keys.
"""
import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, ARRAY, Index, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, DECIMAL
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func

from app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc)


# ── Enums ────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    refunded = "refunded"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class InteractionType(str, enum.Enum):
    view = "view"
    click = "click"
    add_to_cart = "add_to_cart"
    purchase = "purchase"
    review = "review"
    wishlist = "wishlist"

INTERACTION_WEIGHTS = {
    InteractionType.view: 1.0,
    InteractionType.click: 2.0,
    InteractionType.add_to_cart: 3.0,
    InteractionType.wishlist: 3.5,
    InteractionType.review: 4.0,
    InteractionType.purchase: 5.0,
}


# ── User Model ───────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(Text)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user", lazy="dynamic")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")
    interactions = relationship("UserInteraction", back_populates="user", lazy="dynamic")
    recommendations = relationship("Recommendation", back_populates="user")


# ── Category Model ───────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(Text)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Self-referential relationship
    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")


# ── Product Model ────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    price = Column(DECIMAL(10, 2), nullable=False)
    compare_price = Column(DECIMAL(10, 2))   # Original/crossed-out price
    sku = Column(String(100), unique=True)
    stock_quantity = Column(Integer, default=0)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    brand = Column(String(255))
    tags = Column(ARRAY(String), default=[])
    attributes = Column(JSONB, default={})   # {"color": "black", "size": "XL"}
    avg_rating = Column(DECIMAL(3, 2), default=0.0)
    review_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan",
                          order_by="ProductImage.sort_order")
    reviews = relationship("Review", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    interactions = relationship("UserInteraction", back_populates="product", lazy="dynamic")
    recommendations = relationship("Recommendation", back_populates="product")

    # Indexes
    __table_args__ = (
        Index("idx_products_category", "category_id"),
        Index("idx_products_is_active", "is_active"),
        Index("idx_products_brand", "brand"),
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    alt_text = Column(String(500))
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")


# ── Cart Model ───────────────────────────────────────────────

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_cart_user_product"),
    )


# ── Order Models ─────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(50), unique=True, nullable=False)  # e.g. NXR-2024-001234
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    tax_amount = Column(DECIMAL(10, 2), default=0)
    shipping_amount = Column(DECIMAL(10, 2), default=0)
    currency = Column(String(3), default="USD")
    shipping_address = Column(JSONB)  # {name, street, city, state, zip, country}
    payment_method = Column(String(50))
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_orders_user_id", "user_id"),
        Index("idx_orders_status", "status"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(500), nullable=False)   # Snapshot at purchase time
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ── Review Model ─────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    rating = Column(Integer, nullable=False)    # 1–5
    title = Column(String(500))
    body = Column(Text)
    is_verified = Column(Boolean, default=False)  # Verified purchase
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
    )


# ── AI / Recommendation Models ───────────────────────────────

class UserInteraction(Base):
    """
    Tracks all user-product interactions for ML training data.
    Interaction weights: view=1, click=2, cart=3, review=4, purchase=5
    """
    __tablename__ = "user_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    interaction_type = Column(Enum(InteractionType), nullable=False)
    weight = Column(Float, nullable=False)
    session_id = Column(String(100))  # For anonymous/session tracking
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")

    __table_args__ = (
        Index("idx_interactions_user_id", "user_id"),
        Index("idx_interactions_product_id", "product_id"),
        Index("idx_interactions_type", "interaction_type"),
    )


class Recommendation(Base):
    """
    Pre-computed recommendations stored for fast retrieval.
    Refreshed periodically by the ML pipeline.
    """
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)   # Higher = more recommended
    reason_type = Column(String(50))        # 'collaborative', 'content', 'hybrid', 'trending'
    generated_at = Column(DateTime(timezone=True), default=utcnow)
    expires_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="recommendations")
    product = relationship("Product", back_populates="recommendations")

    __table_args__ = (
        Index("idx_recommendations_user", "user_id", "expires_at"),
        UniqueConstraint("user_id", "product_id", name="uq_rec_user_product"),
    )
