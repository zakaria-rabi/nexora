"""Interaction tracking service for ML recommendation data."""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import UserInteraction, InteractionType

class InteractionService:
    @staticmethod
    async def record(db: AsyncSession, user_id: UUID, product_id: UUID,
                     interaction_type: InteractionType, weight: float):
        interaction = UserInteraction(
            user_id=user_id, product_id=product_id,
            interaction_type=interaction_type, weight=weight
        )
        db.add(interaction)
        await db.commit()
