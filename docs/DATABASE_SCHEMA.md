# Database Schema — NEXORA E-Commerce Platform

## Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users     │────<│   user_sessions  │     │  categories  │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │     │ id               │     │ id (PK)      │
│ email        │     │ user_id (FK)     │     │ name         │
│ username     │     │ token_hash       │     │ slug         │
│ password_hash│     │ expires_at       │     │ description  │
│ full_name    │     └──────────────────┘     │ image_url    │
│ avatar_url   │                              │ parent_id(FK)│
│ role         │     ┌──────────────────┐     └──────┬───────┘
│ is_active    │     │    products      │            │
│ created_at   │     ├──────────────────┤            │
│ updated_at   │     │ id (PK)          │◄───────────┘
└──────┬───────┘     │ name             │ category_id
       │             │ slug             │
       │             │ description      │
       │   ┌─────────│ price            │
       │   │         │ compare_price    │
       │   │         │ sku              │
       │   │         │ stock_quantity   │
       │   │         │ category_id (FK) │
       │   │         │ brand            │
       │   │         │ tags (ARRAY)     │
       │   │         │ attributes(JSONB)│
       │   │         │ avg_rating       │
       │   │         │ review_count     │
       │   │         │ is_active        │
       │   │         │ created_at       │
       │   │         └──────┬───────────┘
       │   │                │
       │   │  ┌─────────────┘
       │   │  │
       │   │  │ ┌──────────────────┐
       │   │  │ │  product_images  │
       │   │  │ ├──────────────────┤
       │   │  └►│ product_id (FK)  │
       │   │    │ url              │
       │   │    │ alt_text         │
       │   │    │ is_primary       │
       │   │    │ sort_order       │
       │   │    └──────────────────┘
       │   │
       │   │    ┌──────────────────┐     ┌──────────────┐
       │   └───►│   order_items    │◄────│    orders    │
       │        ├──────────────────┤     ├──────────────┤
       │        │ id (PK)          │     │ id (PK)      │
       │        │ order_id (FK)    │     │ user_id (FK) │◄──┐
       │        │ product_id (FK)  │     │ status       │   │
       │        │ quantity         │     │ total_amount │   │
       │        │ unit_price       │     │ currency     │   │
       │        │ subtotal         │     │ shipping_addr│   │
       │        └──────────────────┘     │ payment_meth │   │
       │                                 │ payment_stat │   │
       └─────────────────────────────────│ created_at   │   │
                                         └──────────────┘   │
                                                             │
       ┌─────────────────────────────────────────────────────┘
       │
       │   ┌──────────────────┐
       │   │   cart_items     │
       │   ├──────────────────┤
       └──►│ user_id (FK)     │
           │ product_id (FK)  │
           │ quantity         │
           │ added_at         │
           └──────────────────┘

       ┌──────────────────┐     ┌──────────────────────┐
       │    reviews       │     │   user_interactions  │
       ├──────────────────┤     ├──────────────────────┤
       │ id (PK)          │     │ id (PK)              │
       │ user_id (FK)     │     │ user_id (FK)         │
       │ product_id (FK)  │     │ product_id (FK)      │
       │ rating (1-5)     │     │ interaction_type     │
       │ title            │     │   (view/click/       │
       │ body             │     │    cart/purchase)    │
       │ is_verified      │     │ weight (float)       │
       │ helpful_votes    │     │ created_at           │
       │ created_at       │     └──────────────────────┘
       └──────────────────┘
                                ┌──────────────────────┐
                                │   recommendations    │
                                ├──────────────────────┤
                                │ id (PK)              │
                                │ user_id (FK)         │
                                │ product_id (FK)      │
                                │ score (float)        │
                                │ reason_type          │
                                │ generated_at         │
                                │ expires_at           │
                                └──────────────────────┘
```

## Table Definitions

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | |
| avatar_url | TEXT | |
| role | ENUM('user','admin') | DEFAULT 'user' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | |

### products
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| description | TEXT | |
| price | DECIMAL(10,2) | NOT NULL |
| compare_price | DECIMAL(10,2) | |
| sku | VARCHAR(100) | UNIQUE |
| stock_quantity | INTEGER | DEFAULT 0 |
| category_id | UUID | FK → categories.id |
| brand | VARCHAR(255) | |
| tags | TEXT[] | |
| attributes | JSONB | |
| avg_rating | DECIMAL(3,2) | DEFAULT 0 |
| review_count | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### interaction_types (Enum)
- `view` — weight: 1.0
- `click` — weight: 2.0
- `add_to_cart` — weight: 3.0
- `purchase` — weight: 5.0
- `review` — weight: 4.0

## Indexes
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_product ON user_interactions(product_id);
CREATE INDEX idx_recommendations_user ON recommendations(user_id, expires_at);
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_products_attributes ON products USING gin(attributes);
```
