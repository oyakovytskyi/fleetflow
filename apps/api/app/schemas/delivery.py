import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import DeliveryStatus
from app.schemas.base import CamelModel


class CreateDeliveryRequest(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    pickup_latitude: float = Field(ge=-90, le=90)
    pickup_longitude: float = Field(ge=-180, le=180)
    destination_latitude: float = Field(ge=-90, le=90)
    destination_longitude: float = Field(ge=-180, le=180)


class AssignDeliveryRequest(CamelModel):
    driver_id: uuid.UUID


class DeliveryResponse(CamelModel):
    id: uuid.UUID
    title: str
    description: str
    pickup_latitude: float
    pickup_longitude: float
    destination_latitude: float
    destination_longitude: float
    status: DeliveryStatus
    driver_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
