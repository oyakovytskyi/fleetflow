import uuid
from datetime import UTC, datetime

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self, *, jti: uuid.UUID, user_id: uuid.UUID, expires_at: datetime
    ) -> RefreshToken:
        token = RefreshToken(jti=jti, user_id=user_id, expires_at=expires_at)
        self._session.add(token)
        await self._session.flush()
        return token

    async def get(self, jti: uuid.UUID) -> RefreshToken | None:
        return await self._session.get(RefreshToken, jti)

    async def revoke(self, jti: uuid.UUID) -> bool:
        """Revokes only if still active, so a replayed token cannot pass twice."""
        result = await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.jti == jti, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
        return result.rowcount == 1

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
