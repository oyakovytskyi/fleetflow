import json
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import DeliveryNotFound, ForbiddenDeliveryAccess, IllegalStatusTransition
from app.db.redis import get_redis
from app.models.enums import DeliveryStatus, UserRole
from app.models.user import User
from app.repositories.delivery_repository import DeliveryRepository
from app.schemas.tracking import (
    DriverLocationSnapshot,
    LocationTrailPoint,
    LocationTrailResponse,
    PostLocationRequest,
)
from app.services.realtime_events import publish_location_event

TRAIL_MAX = 120


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

        key = f"driver:{actor.id}:location"
        trail_key = f"driver:{actor.id}:trail"
        await self._redis.set(key, json.dumps(sample), ex=60 * 60 * 6)
        await self._redis.lpush(trail_key, json.dumps(sample))
        await self._redis.ltrim(trail_key, 0, TRAIL_MAX - 1)
        await self._redis.expire(trail_key, 60 * 60 * 6)
        await publish_location_event(
            {
                "driverId": str(actor.id),
                "deliveryId": str(payload.delivery_id),
                "lat": payload.lat,
                "lng": payload.lng,
                "timestamp": payload.timestamp,
            }
        )

    async def list_last_locations(self) -> list[DriverLocationSnapshot]:
        from app.services.live_hub import live_hub

        raw = await live_hub.snapshot_locations()
        return [DriverLocationSnapshot.model_validate(item) for item in raw]

    async def get_trail(self, driver_id: uuid.UUID) -> LocationTrailResponse:
        trail_key = f"driver:{driver_id}:trail"
        raw_items = await self._redis.lrange(trail_key, 0, TRAIL_MAX - 1)
        points: list[LocationTrailPoint] = []
        for raw in reversed(raw_items):
            try:
                sample = json.loads(raw)
            except json.JSONDecodeError:
                continue
            points.append(
                LocationTrailPoint(
                    lat=sample["lat"],
                    lng=sample["lng"],
                    timestamp=sample["timestamp"],
                )
            )
        return LocationTrailResponse(driver_id=str(driver_id), points=points)
