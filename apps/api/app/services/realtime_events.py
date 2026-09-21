"""Publish fleet realtime events onto Redis for LiveHub fan-out."""

from __future__ import annotations

import json
from typing import Any

from app.db.redis import get_redis
from app.models.delivery import Delivery
from app.models.enums import UserRole
from app.services.live_hub import DELIVERY_CHANNEL, LOCATION_CHANNEL


def delivery_to_wire(delivery: Delivery) -> dict[str, Any]:
    return {
        "id": str(delivery.id),
        "title": delivery.title,
        "description": delivery.description,
        "pickupLatitude": delivery.pickup_latitude,
        "pickupLongitude": delivery.pickup_longitude,
        "destinationLatitude": delivery.destination_latitude,
        "destinationLongitude": delivery.destination_longitude,
        "status": delivery.status.value,
        "driverId": str(delivery.driver_id) if delivery.driver_id else None,
        "createdAt": delivery.created_at.isoformat(),
        "updatedAt": delivery.updated_at.isoformat(),
    }


async def publish_delivery_event(event_type: str, delivery: Delivery) -> None:
    driver_id = str(delivery.driver_id) if delivery.driver_id else None

    if event_type == "delivery.created":
        audience: dict[str, Any] = {
            "roles": [UserRole.ADMIN.value, UserRole.DRIVER.value],
        }
    elif event_type == "delivery.assigned":
        # All drivers refresh open board; assignee gets a targeted notification client-side.
        audience = {
            "roles": [UserRole.ADMIN.value, UserRole.DRIVER.value],
            "userIds": [driver_id] if driver_id else [],
        }
    else:
        # started / completed / cancelled → admin + owning driver
        audience = {
            "roles": [UserRole.ADMIN.value],
            "userIds": [driver_id] if driver_id else [],
        }

    event = {
        "type": event_type,
        "payload": {"delivery": delivery_to_wire(delivery)},
        "audience": audience,
    }
    await get_redis().publish(DELIVERY_CHANNEL, json.dumps(event))


async def publish_location_event(payload: dict[str, Any]) -> None:
    event = {
        "type": "driver.location.updated",
        "payload": payload,
        "audience": {"roles": [UserRole.ADMIN.value]},
    }
    await get_redis().publish(LOCATION_CHANNEL, json.dumps(event))
