from fastapi import APIRouter

from app.api.deps import AdminUser, SessionDep
from app.models.enums import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/drivers", response_model=list[UserResponse])
async def list_drivers(_: AdminUser, session: SessionDep) -> list[UserResponse]:
    users = await UserRepository(session).list_by_role(UserRole.DRIVER)
    return [UserResponse.model_validate(user) for user in users]
