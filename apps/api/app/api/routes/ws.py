import asyncio
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from starlette.websockets import WebSocketState

from app.core.security import InvalidToken, decode_token
from app.db.session import SessionFactory
from app.models.enums import UserRole
from app.repositories.user_repository import UserRepository
from app.services.live_hub import live_hub

router = APIRouter(tags=["realtime"])


@router.websocket("/ws/live")
async def live_tracking_socket(
    websocket: WebSocket,
    token: str | None = Query(default=None),
) -> None:
    """
    Authenticated live socket (DRIVER or ADMIN).
    Auth via `?token=` access JWT. Location frames are admin-only; delivery.*
    events are role/user filtered by LiveHub.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_token(token, "access")
        user_id = uuid.UUID(str(payload["sub"]))
    except (InvalidToken, KeyError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    async with SessionFactory() as session:
        user = await UserRepository(session).get_by_id(user_id)

    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    client = await live_hub.connect(websocket, user_id=str(user.id), role=user.role)

    try:
        if user.role == UserRole.ADMIN:
            snapshot = await live_hub.snapshot_locations()
            await live_hub.send_json(
                websocket,
                {"type": "tracking.snapshot", "payload": {"locations": snapshot}},
            )

        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
            except TimeoutError:
                if websocket.client_state != WebSocketState.CONNECTED:
                    break
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        await live_hub.disconnect(client)
