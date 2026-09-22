"""Redis pub/sub → WebSocket fan-out for live map + delivery lifecycle."""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect, WebSocketState

from app.db.redis import get_redis
from app.models.enums import UserRole

logger = logging.getLogger(__name__)

LOCATION_CHANNEL = "driver.location.updated"
DELIVERY_CHANNEL = "fleet.delivery"
LOCATION_KEY_PATTERN = "driver:*:location"

CHANNELS = (LOCATION_CHANNEL, DELIVERY_CHANNEL)


@dataclass(slots=True, eq=False)
class LiveClient:
    websocket: WebSocket
    user_id: str
    role: UserRole


class LiveHub:
    """Shared Redis subscriber; role/user-filtered fan-out to connected sockets."""

    def __init__(self) -> None:
        self._clients: dict[int, LiveClient] = {}
        self._lock = asyncio.Lock()
        self._listener: asyncio.Task[None] | None = None

    async def start(self) -> None:
        if self._listener is None or self._listener.done():
            self._listener = asyncio.create_task(self._run_listener(), name="live-hub-redis")

    async def stop(self) -> None:
        if self._listener is not None:
            self._listener.cancel()
            try:
                await self._listener
            except asyncio.CancelledError:
                pass
            self._listener = None

        async with self._lock:
            clients = list(self._clients.values())
            self._clients.clear()

        for client in clients:
            if client.websocket.client_state == WebSocketState.CONNECTED:
                await client.websocket.close()

    async def connect(self, websocket: WebSocket, *, user_id: str, role: UserRole) -> LiveClient:
        await self.start()
        client = LiveClient(websocket=websocket, user_id=user_id, role=role)
        async with self._lock:
            self._clients[id(websocket)] = client
        return client

    async def disconnect(self, client: LiveClient) -> None:
        async with self._lock:
            self._clients.pop(id(client.websocket), None)

    async def send_json(self, websocket: WebSocket, payload: dict[str, Any]) -> None:
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_json(payload)

    async def broadcast_event(self, event: dict[str, Any]) -> None:
        raw = json.dumps(event)
        async with self._lock:
            clients = list(self._clients.values())

        stale: list[LiveClient] = []
        for client in clients:
            if not self._client_may_receive(client, event):
                continue
            try:
                if client.websocket.client_state == WebSocketState.CONNECTED:
                    await client.websocket.send_text(raw)
                else:
                    stale.append(client)
            except (WebSocketDisconnect, RuntimeError):
                stale.append(client)

        if stale:
            async with self._lock:
                for client in stale:
                    self._clients.pop(id(client.websocket), None)

    async def snapshot_locations(self) -> list[dict[str, Any]]:
        redis = get_redis()
        locations: list[dict[str, Any]] = []
        async for key in redis.scan_iter(match=LOCATION_KEY_PATTERN, count=100):
            raw = await redis.get(key)
            if not raw:
                continue
            try:
                sample = json.loads(raw)
            except json.JSONDecodeError:
                continue
            locations.append(
                {
                    "driverId": sample.get("driverId"),
                    "driverName": sample.get("driverName"),
                    "deliveryId": sample.get("deliveryId"),
                    "lat": sample.get("lat"),
                    "lng": sample.get("lng"),
                    "timestamp": sample.get("timestamp"),
                }
            )
        return [item for item in locations if item.get("driverId") and item.get("lat") is not None]

    @staticmethod
    def _client_may_receive(client: LiveClient, event: dict[str, Any]) -> bool:
        event_type = event.get("type")
        if event_type in {"driver.location.updated", "tracking.snapshot"}:
            return client.role == UserRole.ADMIN

        audience = event.get("audience") or {}
        roles = audience.get("roles") or []
        user_ids = audience.get("userIds") or []

        if client.role.value in roles:
            return True
        if client.user_id in user_ids:
            return True
        # Default: admins see everything delivery-related.
        if client.role == UserRole.ADMIN and str(event_type).startswith("delivery."):
            return True
        return False

    async def _run_listener(self) -> None:
        redis = get_redis()
        pubsub = redis.pubsub()
        await pubsub.subscribe(*CHANNELS)
        logger.info("LiveHub subscribed to %s", ", ".join(CHANNELS))
        try:
            async for message in pubsub.listen():
                if message is None or message.get("type") != "message":
                    continue
                data = message.get("data")
                if isinstance(data, bytes):
                    data = data.decode()
                if not isinstance(data, str):
                    continue
                try:
                    event = json.loads(data)
                except json.JSONDecodeError:
                    continue
                if isinstance(event, dict):
                    await self.broadcast_event(event)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("LiveHub Redis listener crashed")
        finally:
            try:
                await pubsub.unsubscribe(*CHANNELS)
                await pubsub.close()
            except Exception:
                logger.debug("PubSub cleanup failed", exc_info=True)


live_hub = LiveHub()
