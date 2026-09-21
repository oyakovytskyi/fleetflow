import json
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DeliveryNotFound, ForbiddenDeliveryAccess, IllegalStatusTransition
from app.db.redis import get_redis
from app.models.enums import DeliveryStatus, UserRole
from app.models.user import User
from app.repositories.delivery_repository import DeliveryRepository
from app.schemas.tracking import PostLocationRequest


class TrackingService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._deliveries = DeliveryRepository(session)
        self._redis = get_redis()

    async def ingest_location(self, actor: User, payload: PostLocationRequest) -> None:
        delivery = await self._deliveries.get_by_id(payload.delivery_id)
        if delivery is None:
            raise DeliveryNotFound

        if actor.role != UserRole.ADMIN and delivery.driver_id != actor.id:
            raise ForbiddenDeliveryAccess

        if delivery.status != DeliveryStatus.IN_PROGRESS:
            raise IllegalStatusTransition

        sample = {
            "driverId": str(actor.id),
            "deliveryId": str(payload.delivery_id),
            "lat": payload.lat,
            "lng": payload.lng,
            "accuracy": payload.accuracy,
            "speed": payload.speed,
            "heading": payload.heading,
            "timestamp": payload.timestamp,
            "receivedAt": datetime.now(UTC).isoformat(),
        }

        # Hot last-known location for admin map (Sprint 6 will pub/sub this).
        key = f"driver:{actor.id}:location"
        await self._redis.set(key, json.dumps(sample), ex=60 * 60 * 6)
        await self._redis.publish(
            "driver.location.updated",
            json.dumps(
                {
                    "type": "driver.location.updated",
                    "payload": {
                        "driverId": str(actor.id),
                        "lat": payload.lat,
                        "lng": payload.lng,
                        "timestamp": payload.timestamp,
                    },
                }
            ),
        )
