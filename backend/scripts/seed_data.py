"""
Seed script: populates the database with sample categories, products, users, and interactions.
Run: python scripts/seed_data.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models.models import Base, User, UserRole, Category, Product, ProductImage, UserInteraction, InteractionType, INTERACTION_WEIGHTS
from slugify import slugify
import random
import uuid

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

CATEGORIES = [
    {"name": "Electronics", "description": "Cutting-edge tech gadgets", "icon": "💻"},
    {"name": "Audio", "description": "Premium sound equipment", "icon": "🎧"},
    {"name": "Wearables", "description": "Smart wearable technology", "icon": "⌚"},
    {"name": "Gaming", "description": "Gaming peripherals & consoles", "icon": "🎮"},
    {"name": "Photography", "description": "Cameras & accessories", "icon": "📷"},
    {"name": "Smart Home", "description": "Home automation devices", "icon": "🏠"},
]

PRODUCTS = [
    # Electronics
    {"name": "NexoBook Pro 16", "category": "Electronics", "price": 2499.99, "compare_price": 2799.99,
     "brand": "NexoTech", "description": "Ultra-thin laptop with M3 Pro chip, 16\" Liquid Retina display, 18hr battery.",
     "tags": ["laptop", "portable", "pro"], "attributes": {"RAM": "32GB", "Storage": "1TB SSD", "Display": "16 inch"},
     "stock": 45, "featured": True,
     "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"},
    {"name": "QuantumTab Ultra", "category": "Electronics", "price": 1099.99, "compare_price": 1299.99,
     "brand": "NexoTech", "description": "12.9\" OLED tablet with Apple Pencil support and 5G connectivity.",
     "tags": ["tablet", "oled", "5g"], "attributes": {"RAM": "16GB", "Storage": "512GB", "Display": "12.9 inch"},
     "stock": 62, "featured": True,
     "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"},
    {"name": "NexoPhone X1", "category": "Electronics", "price": 999.99,
     "brand": "NexoTech", "description": "Flagship smartphone with 200MP camera and 6.7\" Dynamic AMOLED.",
     "tags": ["phone", "flagship", "camera"], "attributes": {"RAM": "12GB", "Storage": "256GB", "Battery": "5000mAh"},
     "stock": 128, "featured": True,
     "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"},

    # Audio
    {"name": "SoundOrb ANC Pro", "category": "Audio", "price": 379.99, "compare_price": 449.99,
     "brand": "SoundOrb", "description": "Industry-leading Active Noise Cancellation headphones with 30hr playback.",
     "tags": ["headphones", "anc", "wireless"], "attributes": {"Type": "Over-ear", "Battery": "30hr", "Color": "Midnight Black"},
     "stock": 89, "featured": True,
     "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"},
    {"name": "BassCore Earbuds X", "category": "Audio", "price": 249.99,
     "brand": "SoundOrb", "description": "True wireless earbuds with spatial audio and 36hr total battery.",
     "tags": ["earbuds", "tws", "spatial-audio"], "attributes": {"Battery": "8hr + 28hr case", "IPX": "IPX5", "Driver": "11mm"},
     "stock": 203, "featured": False,
     "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"},
    {"name": "StudioBar 900", "category": "Audio", "price": 599.99,
     "brand": "SoundOrb", "description": "Premium soundbar with Dolby Atmos and wireless subwoofer.",
     "tags": ["soundbar", "dolby-atmos", "home-cinema"],
     "attributes": {"Channels": "3.1.2", "Power": "420W", "Connectivity": "HDMI eARC"},
     "stock": 34,
     "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"},

    # Wearables
    {"name": "NexoWatch Ultra 2", "category": "Wearables", "price": 799.99, "compare_price": 899.99,
     "brand": "NexoTech", "description": "Titanium smartwatch with ECG, blood glucose monitoring and 60hr battery.",
     "tags": ["smartwatch", "health", "titanium"], "attributes": {"Case": "49mm Titanium", "Battery": "60hr", "Display": "Always-On OLED"},
     "stock": 56, "featured": True,
     "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"},
    {"name": "FitBand Pro X", "category": "Wearables", "price": 199.99,
     "brand": "FitTech", "description": "Advanced fitness band with GPS, SpO2 and 14-day battery.",
     "tags": ["fitness", "band", "gps"], "attributes": {"Battery": "14 days", "Water": "5ATM", "Sensors": "GPS, SpO2, HR"},
     "stock": 167,
     "image": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600"},

    # Gaming
    {"name": "HyperX Nexus Controller", "category": "Gaming", "price": 149.99,
     "brand": "HyperX", "description": "Pro gaming controller with haptic feedback and 40hr battery.",
     "tags": ["controller", "gaming", "wireless"], "attributes": {"Compatibility": "PC/PS5/Xbox", "Battery": "40hr", "Features": "Haptic Feedback"},
     "stock": 298, "featured": True,
     "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600"},
    {"name": "QuantumMouse Pro", "category": "Gaming", "price": 89.99,
     "brand": "HyperX", "description": "Ultra-light gaming mouse with 25K DPI sensor and RGB.",
     "tags": ["mouse", "gaming", "rgb"], "attributes": {"DPI": "25,600", "Weight": "61g", "Polling Rate": "8000Hz"},
     "stock": 412,
     "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600"},
    {"name": "NexoKeyboard TKL", "category": "Gaming", "price": 179.99, "compare_price": 219.99,
     "brand": "HyperX", "description": "Tenkeyless mechanical keyboard with hot-swap switches and RGB.",
     "tags": ["keyboard", "mechanical", "tkl"], "attributes": {"Switch": "Red Linear", "Layout": "TKL", "Backlight": "Per-key RGB"},
     "stock": 85,
     "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600"},

    # Photography
    {"name": "LensMax A7V", "category": "Photography", "price": 3299.99,
     "brand": "LensMax", "description": "Full-frame mirrorless camera with 61MP sensor and 8-stop IBIS.",
     "tags": ["camera", "mirrorless", "fullframe"], "attributes": {"Sensor": "61MP Full-Frame", "ISO": "50-204800", "Video": "4K 120fps"},
     "stock": 23, "featured": True,
     "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"},
    {"name": "DroneVision X4 Pro", "category": "Photography", "price": 1299.99,
     "brand": "AirView", "description": "Professional drone with 4K/60fps camera, 46min flight time.",
     "tags": ["drone", "aerial", "4k"], "attributes": {"Camera": "4K 60fps", "Flight Time": "46 min", "Range": "12km"},
     "stock": 41,
     "image": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600"},

    # Smart Home
    {"name": "NexoHub Smart Center", "category": "Smart Home", "price": 249.99,
     "brand": "NexoHome", "description": "Central smart home hub supporting 200+ protocols and AI routines.",
     "tags": ["smarthome", "hub", "ai"], "attributes": {"Protocols": "Zigbee, Z-Wave, Thread", "Devices": "200+", "Voice": "Alexa, Google"},
     "stock": 74, "featured": True,
     "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"},
    {"name": "AirPure Pro 5000", "category": "Smart Home", "price": 449.99,
     "brand": "NexoHome", "description": "AI-powered air purifier covering 500sqft with HEPA-H13 filter.",
     "tags": ["airpurifier", "hepa", "smart"], "attributes": {"Coverage": "500 sqft", "Filter": "HEPA-H13", "CADR": "500 m³/h"},
     "stock": 58,
     "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        print("🌱 Seeding database...")

        # Create categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat = Category(
                name=cat_data["name"],
                slug=slugify(cat_data["name"]),
                description=cat_data["description"],
            )
            db.add(cat)
            await db.flush()
            cat_map[cat_data["name"]] = cat
        await db.commit()
        print(f"✅ Created {len(CATEGORIES)} categories")

        # Create products
        products = []
        for p_data in PRODUCTS:
            cat = cat_map[p_data["category"]]
            product = Product(
                name=p_data["name"],
                slug=slugify(p_data["name"]),
                description=p_data["description"],
                short_description=p_data["description"][:150],
                price=p_data["price"],
                compare_price=p_data.get("compare_price"),
                brand=p_data["brand"],
                tags=p_data.get("tags", []),
                attributes=p_data.get("attributes", {}),
                stock_quantity=p_data.get("stock", 50),
                category_id=cat.id,
                is_featured=p_data.get("featured", False),
                avg_rating=round(random.uniform(3.8, 5.0), 1),
                review_count=random.randint(12, 450),
            )
            db.add(product)
            await db.flush()

            img = ProductImage(product_id=product.id, url=p_data["image"], is_primary=True, alt_text=p_data["name"])
            db.add(img)
            products.append(product)

        await db.commit()
        print(f"✅ Created {len(PRODUCTS)} products")

        # Create admin user
        admin = User(
            email="admin@nexora.com",
            username="admin",
            password_hash=hash_password("Admin123!"),
            full_name="Nexora Admin",
            role=UserRole.admin,
        )
        db.add(admin)

        # Create demo user
        demo = User(
            email="demo@nexora.com",
            username="demo_user",
            password_hash=hash_password("Demo123!"),
            full_name="Alex Johnson",
        )
        db.add(demo)
        await db.commit()
        print("✅ Created admin and demo users")

        # Create sample interactions for ML training
        interaction_types = [
            (InteractionType.view, 1.0),
            (InteractionType.click, 2.0),
            (InteractionType.add_to_cart, 3.0),
            (InteractionType.purchase, 5.0),
        ]
        for _ in range(200):
            itype, weight = random.choice(interaction_types)
            interaction = UserInteraction(
                user_id=demo.id,
                product_id=random.choice(products).id,
                interaction_type=itype,
                weight=weight,
            )
            db.add(interaction)
        await db.commit()
        print("✅ Created 200 sample interactions for ML")

        print("\n🎉 Database seeded successfully!")
        print("   Admin: admin@nexora.com / Admin123!")
        print("   Demo:  demo@nexora.com  / Demo123!")


if __name__ == "__main__":
    asyncio.run(seed())
