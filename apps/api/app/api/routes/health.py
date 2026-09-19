from typing import Literal

import redis.asyncio as redis
from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SessionDep
from app.core.config import get_settings
from app.schemas.base import CamelModel

router = APIRouter(tags=["health"])

Dependency = Literal["up", "down"]


class HealthResponse(CamelModel):
    status: Literal["ok", "degraded"]
    database: Dependency
    redis: Dependency


@router.get("/health", response_model=HealthResponse)
async def health(session: SessionDep) -> HealthResponse:
    database: Dependency = "up"
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        database = "down"

    cache: Dependency = "up"
    client = redis.from_url(get_settings().redis_url)
    try:
        await client.ping()
    except Exception:
        cache = "down"
    finally:
        await client.aclose()

    healthy = database == "up" and cache == "up"
    return HealthResponse(status="ok" if healthy else "degraded", database=database, redis=cache)
