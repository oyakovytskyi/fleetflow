import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import (
    DeliveryAlreadyAssigned,
    DeliveryNotFound,
    DriverNotFound,
    ForbiddenDeliveryAccess,
    IllegalStatusTransition,
)
from app.models.delivery import Delivery
from app.models.enums import DeliveryStatus, UserRole
from app.models.user import User
from app.repositories.delivery_repository import DeliveryRepository
from app.repositories.user_repository import UserRepository

# Legal edges of the delivery status machine.
ALLOWED_TRANSITIONS: dict[DeliveryStatus, set[DeliveryStatus]] = {
    DeliveryStatus.PENDING: {DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED},
    DeliveryStatus.ASSIGNED: {
        DeliveryStatus.IN_PROGRESS,
        DeliveryStatus.CANCELLED,
        DeliveryStatus.PENDING,  # unassign
    },
    DeliveryStatus.IN_PROGRESS: {DeliveryStatus.COMPLETED, DeliveryStatus.CANCELLED},
    DeliveryStatus.COMPLETED: set(),
    DeliveryStatus.CANCELLED: set(),
}


class DeliveryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._deliveries = DeliveryRepository(session)
        self._users = UserRepository(session)

    async def list_visible(self, actor: User) -> list[Delivery]:
        if actor.role == UserRole.ADMIN:
            return await self._deliveries.list_all()
        return await self._deliveries.list_for_driver(actor.id)

    async def get(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._require_delivery(delivery_id)
        self._assert_can_view(actor, delivery)
        return delivery

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
        delivery = await self._deliveries.create(
            title=title,
            description=description,
            pickup_latitude=pickup_latitude,
            pickup_longitude=pickup_longitude,
            destination_latitude=destination_latitude,
            destination_longitude=destination_longitude,
        )
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def assign(self, delivery_id: uuid.UUID, driver_id: uuid.UUID) -> Delivery:
        delivery = await self._require_delivery(delivery_id)
        driver = await self._users.get_by_id(driver_id)
        if driver is None or driver.role != UserRole.DRIVER:
            raise DriverNotFound

        if delivery.status not in {DeliveryStatus.PENDING, DeliveryStatus.ASSIGNED}:
            raise IllegalStatusTransition

        if (
            delivery.driver_id is not None
            and delivery.driver_id != driver_id
            and delivery.status == DeliveryStatus.ASSIGNED
        ):
            raise DeliveryAlreadyAssigned

        delivery.driver_id = driver_id
        self._apply_status(delivery, DeliveryStatus.ASSIGNED)
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def claim(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        """Driver self-assigns a PENDING job."""
        if actor.role != UserRole.DRIVER:
            raise ForbiddenDeliveryAccess

        delivery = await self._require_delivery(delivery_id)
        if delivery.status != DeliveryStatus.PENDING or delivery.driver_id is not None:
            raise DeliveryAlreadyAssigned

        delivery.driver_id = actor.id
        self._apply_status(delivery, DeliveryStatus.ASSIGNED)
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def start(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._require_owned(actor, delivery_id)
        if delivery.status != DeliveryStatus.ASSIGNED:
            raise IllegalStatusTransition
        self._apply_status(delivery, DeliveryStatus.IN_PROGRESS)
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def complete(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._require_owned(actor, delivery_id)
        if delivery.status != DeliveryStatus.IN_PROGRESS:
            raise IllegalStatusTransition
        self._apply_status(delivery, DeliveryStatus.COMPLETED)
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def cancel(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._require_delivery(delivery_id)
        if actor.role != UserRole.ADMIN:
            self._assert_can_view(actor, delivery)
            if delivery.driver_id != actor.id:
                raise ForbiddenDeliveryAccess

        if DeliveryStatus.CANCELLED not in ALLOWED_TRANSITIONS.get(delivery.status, set()):
            raise IllegalStatusTransition

        self._apply_status(delivery, DeliveryStatus.CANCELLED)
        await self._session.commit()
        await self._session.refresh(delivery)
        return delivery

    async def _require_delivery(self, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._deliveries.get_by_id(delivery_id)
        if delivery is None:
            raise DeliveryNotFound
        return delivery

    async def _require_owned(self, actor: User, delivery_id: uuid.UUID) -> Delivery:
        delivery = await self._require_delivery(delivery_id)
        if actor.role == UserRole.ADMIN:
            return delivery
        if delivery.driver_id != actor.id:
            raise ForbiddenDeliveryAccess
        return delivery

    @staticmethod
    def _assert_can_view(actor: User, delivery: Delivery) -> None:
        if actor.role == UserRole.ADMIN:
            return
        if delivery.driver_id == actor.id:
            return
        if delivery.status == DeliveryStatus.PENDING and delivery.driver_id is None:
            return
        raise ForbiddenDeliveryAccess

    @staticmethod
    def _apply_status(delivery: Delivery, new_status: DeliveryStatus) -> None:
        allowed = ALLOWED_TRANSITIONS.get(delivery.status, set())
        if new_status not in allowed:
            raise IllegalStatusTransition
        delivery.status = new_status
        delivery.updated_at = datetime.now(UTC)
