"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict


# ── Base ────────────────────────────────────────────────────

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Auth Schemas ────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

    @validator("password")
    def validate_password(cls, v):
        import re
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── User Schemas ────────────────────────────────────────────

class UserResponse(BaseSchema):
    id: UUID
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool
    created_at: datetime


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    avatar_url: Optional[str] = None


# ── Category Schemas ────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(BaseSchema):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    parent_id: Optional[UUID]
    sort_order: int
    product_count: Optional[int] = 0


# ── Product Schemas ─────────────────────────────────────────

class ProductImageResponse(BaseSchema):
    id: UUID
    url: str
    alt_text: Optional[str]
    is_primary: bool
    sort_order: int


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    compare_price: Optional[Decimal] = Field(None, gt=0)
    sku: Optional[str] = None
    stock_quantity: int = Field(0, ge=0)
    category_id: Optional[UUID] = None
    brand: Optional[str] = None
    tags: List[str] = []
    attributes: Dict[str, Any] = {}
    is_featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    compare_price: Optional[Decimal] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[UUID] = None
    brand: Optional[str] = None
    tags: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductListResponse(BaseSchema):
    id: UUID
    name: str
    slug: str
    short_description: Optional[str]
    price: Decimal
    compare_price: Optional[Decimal]
    brand: Optional[str]
    avg_rating: Decimal
    review_count: int
    stock_quantity: int
    is_featured: bool
    primary_image: Optional[str] = None
    category: Optional[CategoryResponse] = None


class ProductDetailResponse(ProductListResponse):
    description: Optional[str]
    sku: Optional[str]
    tags: List[str]
    attributes: Dict[str, Any]
    images: List[ProductImageResponse] = []
    created_at: datetime


# ── Cart Schemas ────────────────────────────────────────────

class CartItemAdd(BaseModel):
    product_id: UUID
    quantity: int = Field(1, ge=1, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0, le=100)


class CartItemResponse(BaseSchema):
    id: UUID
    product_id: UUID
    quantity: int
    product: ProductListResponse
    subtotal: Decimal


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    subtotal: Decimal
    estimated_tax: Decimal
    total: Decimal


# ── Order Schemas ───────────────────────────────────────────

class ShippingAddress(BaseModel):
    full_name: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"
    phone: Optional[str] = None


class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "card"
    notes: Optional[str] = None


class OrderItemResponse(BaseSchema):
    id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderResponse(BaseSchema):
    id: UUID
    order_number: str
    status: str
    total_amount: Decimal
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    currency: str
    shipping_address: Optional[Dict]
    payment_method: Optional[str]
    payment_status: str
    items: List[OrderItemResponse] = []
    created_at: datetime


# ── Review Schemas ──────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=500)
    body: Optional[str] = None


class ReviewResponse(BaseSchema):
    id: UUID
    user_id: UUID
    product_id: UUID
    rating: int
    title: Optional[str]
    body: Optional[str]
    is_verified: bool
    helpful_votes: int
    created_at: datetime
    user: Optional[UserResponse] = None


# ── Recommendation Schemas ──────────────────────────────────

class RecommendationResponse(BaseSchema):
    product: ProductListResponse
    score: float
    reason_type: str


# ── Pagination ──────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int


# ── Admin / Analytics Schemas ────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: Decimal
    orders_today: int
    revenue_today: Decimal
    new_users_today: int
    low_stock_products: int


class RevenueDataPoint(BaseModel):
    date: str
    revenue: Decimal
    orders: int


class TopProduct(BaseModel):
    product_id: UUID
    product_name: str
    total_sold: int
    revenue: Decimal
