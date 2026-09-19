import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import InvalidToken, decode_token
from app.db.session import get_session
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


async def get_current_user(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = decode_token(credentials.credentials, "access")
        user_id = uuid.UUID(str(payload["sub"]))
    except (InvalidToken, KeyError, ValueError) as exc:
        raise unauthorized from exc

    user = await UserRepository(session).get_by_id(user_id)
    if user is None:
        raise unauthorized

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
