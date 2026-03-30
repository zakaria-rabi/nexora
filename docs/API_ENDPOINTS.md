# API Endpoints — NEXORA E-Commerce Platform

Base URL: `http://localhost:8000/api`
Interactive Docs: `http://localhost:8000/docs`

## Authentication
All protected routes require: `Authorization: Bearer <access_token>`

---

## 🔐 Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns JWT tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| GET | `/auth/me` | ✅ | Get current user |

**Register Body:**
```json
{"email":"user@example.com","username":"johndoe","password":"Secret123!","full_name":"John Doe"}
```
**Login Response:**
```json
{"access_token":"eyJ...","refresh_token":"eyJ...","token_type":"bearer","expires_in":86400}
```

---

## 👤 Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get profile |
| PATCH | `/users/me` | ✅ | Update profile |

---

## 📦 Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ❌ | List with filters/pagination |
| GET | `/products/{slug}` | ❌* | Product detail |
| POST | `/products` | 🔑 Admin | Create product |
| PATCH | `/products/{id}` | 🔑 Admin | Update product |
| DELETE | `/products/{id}` | 🔑 Admin | Soft-delete |

**Query Params (GET /products):**
- `page`, `page_size` — pagination
- `category_id` — filter by category UUID
- `brand` — filter by brand name
- `min_price`, `max_price` — price range
- `search` — full-text search
- `sort_by` — `price|name|avg_rating|created_at`
- `sort_order` — `asc|desc`
- `featured_only` — boolean

---

## 🗂 Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ❌ | List all categories |
| POST | `/categories` | 🔑 Admin | Create category |

---

## 🛒 Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | ✅ | Get user's cart |
| POST | `/cart/items` | ✅ | Add item |
| PATCH | `/cart/items/{product_id}` | ✅ | Update quantity |
| DELETE | `/cart/items/{product_id}` | ✅ | Remove item |
| DELETE | `/cart` | ✅ | Clear cart |

---

## 📋 Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/checkout` | ✅ | Place order from cart |
| GET | `/orders` | ✅ | Order history |
| GET | `/orders/{id}` | ✅ | Order detail |

**Checkout Body:**
```json
{
  "shipping_address": {"full_name":"John Doe","street":"123 Main St","city":"SF","state":"CA","zip_code":"94102","country":"US"},
  "payment_method": "card",
  "notes": "Leave at door"
}
```

---

## ⭐ Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/product/{product_id}` | ❌ | Product reviews |
| POST | `/reviews/product/{product_id}` | ✅ | Submit review |

---

## 🤖 Recommendations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/recommendations/for-you` | ✅ | Personalized recs (hybrid model) |
| GET | `/recommendations/similar/{product_id}` | ❌ | Similar products |
| GET | `/recommendations/trending` | ❌ | Trending products |
| POST | `/recommendations/retrain` | 🔑 Admin | Trigger ML retraining |

**Response:**
```json
[
  {"product": {...}, "score": 0.94, "reason_type": "hybrid"},
  {"product": {...}, "score": 0.87, "reason_type": "collaborative"}
]
```

---

## 🔑 Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | 🔑 Admin | Dashboard statistics |
| GET | `/admin/revenue?days=30` | 🔑 Admin | Revenue time series |
| GET | `/admin/top-products` | 🔑 Admin | Best sellers |
| GET | `/admin/users` | 🔑 Admin | User list |
| PATCH | `/admin/users/{id}/toggle-active` | 🔑 Admin | Activate/deactivate |
| GET | `/admin/orders` | 🔑 Admin | All orders |

---

## Error Responses
```json
{"detail": "Error message here"}
```
Status codes: `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `422` Validation Error · `500` Server Error
