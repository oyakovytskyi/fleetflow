import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import UserRole
from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self._session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def create(self, *, email: str, name: str, hashed_password: str, role: UserRole) -> User:
        user = User(
            email=email.lower(),
            name=name,
            hashed_password=hashed_password,
            role=role,
        )
        self._session.add(user)
        await self._session.flush()
        return user
