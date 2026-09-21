from fastapi import APIRouter, status
import uuid

from app.api.deps import AdminUser, CurrentUser, SessionDep
from app.schemas.tracking import (
    LocationAcceptedResponse,
    LocationListResponse,
    LocationTrailResponse,
    PostLocationRequest,
)
from app.services.tracking_service import TrackingService

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.post(
    "/location",
    response_model=LocationAcceptedResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def post_location(
    payload: PostLocationRequest,
    current_user: CurrentUser,
    session: SessionDep,
) -> LocationAcceptedResponse:
    await TrackingService(session).ingest_location(current_user, payload)
    return LocationAcceptedResponse()


@router.get("/locations", response_model=LocationListResponse)
async def list_locations(
    _: AdminUser,
    session: SessionDep,
) -> LocationListResponse:
    locations = await TrackingService(session).list_last_locations()
    return LocationListResponse(locations=locations)


@router.get("/drivers/{driver_id}/trail", response_model=LocationTrailResponse)
async def get_driver_trail(
    driver_id: uuid.UUID,
    _: AdminUser,
    session: SessionDep,
) -> LocationTrailResponse:
    return await TrackingService(session).get_trail(driver_id)
