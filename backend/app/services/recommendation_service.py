"""Recommendation service - bridges ML engine with database."""
import pandas as pd
from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.models.models import (
    UserInteraction, Recommendation, Product, ProductImage,
    InteractionType
)
from app.ml.engine import recommendation_engine
import logging

logger = logging.getLogger(__name__)


class RecommendationService:

    @staticmethod
    async def get_for_user(db: AsyncSession, user_id: UUID, limit: int = 10) -> List[dict]:
        """Get personalized recommendations, using cached DB results if fresh."""
        # Check cached recommendations (valid for 6 hours)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=6)
        cached = await db.execute(
            select(Recommendation)
            .options(selectinload(Recommendation.product).selectinload(Product.images))
            .where(
                Recommendation.user_id == user_id,
                Recommendation.generated_at >= cutoff,
            )
            .order_by(Recommendation.score.desc())
            .limit(limit)
        )
        recs = cached.scalars().all()
        if recs:
            return [{"product": r.product, "score": r.score, "reason_type": r.reason_type} for r in recs]

        # Generate fresh recommendations
        return await RecommendationService._generate_for_user(db, user_id, limit)

    @staticmethod
    async def _generate_for_user(db: AsyncSession, user_id: UUID, limit: int) -> List[dict]:
        """Run ML engine and persist results."""
        # Get user interaction count
        count_result = await db.execute(
            select(func.count(UserInteraction.id))
            .where(UserInteraction.user_id == user_id)
        )
        interaction_count = count_result.scalar() or 0

        # Get recently viewed products
        recent_result = await db.execute(
            select(UserInteraction.product_id)
            .where(
                UserInteraction.user_id == user_id,
                UserInteraction.interaction_type == InteractionType.view
            )
            .order_by(UserInteraction.created_at.desc())
            .limit(10)
        )
        recently_viewed = [str(r[0]) for r in recent_result.all()]

        # Get purchased product IDs (exclude from recs)
        purchased_result = await db.execute(
            select(UserInteraction.product_id)
            .where(
                UserInteraction.user_id == user_id,
                UserInteraction.interaction_type == InteractionType.purchase
            )
        )
        purchased = [str(r[0]) for r in purchased_result.all()]

        # Run ML engine
        raw_recs = recommendation_engine.recommend_for_user(
            user_id=str(user_id),
            user_interaction_count=interaction_count,
            recently_viewed=recently_viewed,
            purchased_products=purchased,
            top_n=limit,
        )

        if not raw_recs:
            # Fallback: return trending
            return await RecommendationService.get_trending(db, limit)

        # Fetch product objects
        product_ids = [UUID(r["product_id"]) for r in raw_recs]
        products_result = await db.execute(
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.id.in_(product_ids), Product.is_active == True)
        )
        products_map = {str(p.id): p for p in products_result.scalars().all()}

        # Persist to cache
        expires = datetime.now(timezone.utc) + timedelta(hours=6)
        result = []
        for rec in raw_recs:
            product = products_map.get(rec["product_id"])
            if not product:
                continue
            # Upsert recommendation
            db_rec = Recommendation(
                user_id=user_id,
                product_id=product.id,
                score=rec["score"],
                reason_type=rec["reason_type"],
                expires_at=expires,
            )
            db.add(db_rec)
            result.append({"product": product, "score": rec["score"], "reason_type": rec["reason_type"]})

        try:
            await db.commit()
        except Exception:
            await db.rollback()

        return result

    @staticmethod
    async def get_similar(db: AsyncSession, product_id: UUID, limit: int) -> List[dict]:
        """Content-based similar products."""
        raw = recommendation_engine.get_similar_products(str(product_id), top_n=limit)
        if not raw:
            return await RecommendationService.get_trending(db, limit)

        product_ids = [UUID(r["product_id"]) for r in raw]
        result = await db.execute(
            select(Product).options(selectinload(Product.images))
            .where(Product.id.in_(product_ids), Product.is_active == True)
        )
        products_map = {str(p.id): p for p in result.scalars().all()}
        return [
            {"product": products_map[r["product_id"]], "score": r["score"], "reason_type": r["reason_type"]}
            for r in raw if r["product_id"] in products_map
        ]

    @staticmethod
    async def get_trending(db: AsyncSession, limit: int) -> List[dict]:
        """Trending products fallback."""
        raw = recommendation_engine.get_trending(top_n=limit)
        if raw:
            product_ids = [UUID(r["product_id"]) for r in raw]
            result = await db.execute(
                select(Product).options(selectinload(Product.images))
                .where(Product.id.in_(product_ids), Product.is_active == True)
            )
            products_map = {str(p.id): p for p in result.scalars().all()}
            return [
                {"product": products_map[r["product_id"]], "score": r["score"], "reason_type": "trending"}
                for r in raw if r["product_id"] in products_map
            ]

        # Ultimate fallback: newest products
        result = await db.execute(
            select(Product).options(selectinload(Product.images))
            .where(Product.is_active == True)
            .order_by(Product.created_at.desc())
            .limit(limit)
        )
        products = result.scalars().all()
        return [{"product": p, "score": 1.0, "reason_type": "new"} for p in products]

    @staticmethod
    async def retrain(db: AsyncSession):
        """Retrain ML models using latest interaction data."""
        logger.info("Starting ML model retraining...")
        try:
            # Load interactions
            inter_result = await db.execute(
                select(
                    UserInteraction.user_id,
                    UserInteraction.product_id,
                    UserInteraction.weight,
                    UserInteraction.created_at,
                )
            )
            interactions_df = pd.DataFrame(inter_result.all(),
                                           columns=["user_id", "product_id", "weight", "created_at"])
            interactions_df["user_id"] = interactions_df["user_id"].astype(str)
            interactions_df["product_id"] = interactions_df["product_id"].astype(str)

            # Load products
            prod_result = await db.execute(
                select(Product).options(selectinload(Product.category))
                .where(Product.is_active == True)
            )
            products = prod_result.scalars().all()
            products_df = pd.DataFrame([{
                "id": str(p.id), "name": p.name, "description": p.description,
                "brand": p.brand, "tags": p.tags, "attributes": p.attributes,
                "category_name": p.category.name if p.category else "",
            } for p in products])

            recommendation_engine.train(interactions_df, products_df)
            logger.info("✅ ML retraining complete")
        except Exception as e:
            logger.error(f"ML retraining failed: {e}")
