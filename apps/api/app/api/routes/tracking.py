from fastapi import APIRouter, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.tracking import LocationAcceptedResponse, PostLocationRequest
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
