import uuid

from fastapi import APIRouter, status

from app.api.deps import AdminUser, CurrentUser, DeliveryServiceDep
from app.schemas.delivery import (
    AssignDeliveryRequest,
    CreateDeliveryRequest,
    DeliveryResponse,
)

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


@router.get("", response_model=list[DeliveryResponse])
async def list_deliveries(
    current_user: CurrentUser, deliveries: DeliveryServiceDep
) -> list[DeliveryResponse]:
    items = await deliveries.list_visible(current_user)
    return [DeliveryResponse.model_validate(item) for item in items]


@router.post("", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    payload: CreateDeliveryRequest,
    _: AdminUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.create(
        title=payload.title,
        description=payload.description,
        pickup_latitude=payload.pickup_latitude,
        pickup_longitude=payload.pickup_longitude,
        destination_latitude=payload.destination_latitude,
        destination_longitude=payload.destination_longitude,
    )
    return DeliveryResponse.model_validate(item)


@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: uuid.UUID,
    current_user: CurrentUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.get(current_user, delivery_id)
    return DeliveryResponse.model_validate(item)


@router.post("/{delivery_id}/assign", response_model=DeliveryResponse)
async def assign_delivery(
    delivery_id: uuid.UUID,
    payload: AssignDeliveryRequest,
    _: AdminUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.assign(delivery_id, payload.driver_id)
    return DeliveryResponse.model_validate(item)


@router.post("/{delivery_id}/claim", response_model=DeliveryResponse)
async def claim_delivery(
    delivery_id: uuid.UUID,
    current_user: CurrentUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.claim(current_user, delivery_id)
    return DeliveryResponse.model_validate(item)


@router.post("/{delivery_id}/start", response_model=DeliveryResponse)
async def start_delivery(
    delivery_id: uuid.UUID,
    current_user: CurrentUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.start(current_user, delivery_id)
    return DeliveryResponse.model_validate(item)


@router.post("/{delivery_id}/complete", response_model=DeliveryResponse)
async def complete_delivery(
    delivery_id: uuid.UUID,
    current_user: CurrentUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.complete(current_user, delivery_id)
    return DeliveryResponse.model_validate(item)


@router.post("/{delivery_id}/cancel", response_model=DeliveryResponse)
async def cancel_delivery(
    delivery_id: uuid.UUID,
    current_user: CurrentUser,
    deliveries: DeliveryServiceDep,
) -> DeliveryResponse:
    item = await deliveries.cancel(current_user, delivery_id)
    return DeliveryResponse.model_validate(item)
