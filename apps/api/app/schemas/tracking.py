import uuid
from datetime import UTC, datetime

from pydantic import Field

from app.schemas.base import CamelModel


class PostLocationRequest(CamelModel):
    delivery_id: uuid.UUID
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    accuracy: float | None = Field(default=None, ge=0)
    speed: float | None = None
    heading: float | None = Field(default=None, ge=0, le=360)
    timestamp: int = Field(description="Unix epoch milliseconds from the device.")


class LocationAcceptedResponse(CamelModel):
    ok: bool = True
    received_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
