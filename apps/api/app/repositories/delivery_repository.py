import uuid

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.delivery import Delivery
from app.models.enums import DeliveryStatus


class DeliveryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, delivery_id: uuid.UUID) -> Delivery | None:
        return await self._session.get(Delivery, delivery_id)

    async def list_for_driver(self, driver_id: uuid.UUID) -> list[Delivery]:
        """Assigned to this driver, plus unassigned PENDING jobs they can claim."""
        result = await self._session.execute(
            select(Delivery)
            .where(
                or_(
                    Delivery.driver_id == driver_id,
                    Delivery.status == DeliveryStatus.PENDING,
                )
            )
            .order_by(Delivery.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_all(self) -> list[Delivery]:
        result = await self._session.execute(
            select(Delivery).order_by(Delivery.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(
        self,
        *,
        title: str,
        description: str,
        pickup_latitude: float,
        pickup_longitude: float,
        destination_latitude: float,
        destination_longitude: float,
    ) -> Delivery:
        delivery = Delivery(
            title=title,
            description=description,
            pickup_latitude=pickup_latitude,
            pickup_longitude=pickup_longitude,
            destination_latitude=destination_latitude,
            destination_longitude=destination_longitude,
            status=DeliveryStatus.PENDING,
        )
        self._session.add(delivery)
        await self._session.flush()
        return delivery
