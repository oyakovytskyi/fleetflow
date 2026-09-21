from fastapi import APIRouter

from app.api.routes import auth, deliveries, health, tracking

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(deliveries.router)
api_router.include_router(tracking.router)

__all__ = ["api_router"]
