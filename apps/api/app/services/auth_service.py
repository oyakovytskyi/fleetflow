import uuid
from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import EmailAlreadyRegistered, InvalidCredentials, InvalidRefreshToken
from app.core.security import (
    InvalidToken,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenPairResponse


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._users = UserRepository(session)
        self._refresh_tokens = RefreshTokenRepository(session)

    async def register(
        self, *, email: str, name: str, password: str, role: UserRole
    ) -> tuple[User, TokenPairResponse]:
        if await self._users.get_by_email(email) is not None:
            raise EmailAlreadyRegistered

        user = await self._users.create(
            email=email,
            name=name,
            hashed_password=hash_password(password),
            role=role,
        )

        try:
            tokens = await self._issue_tokens(user)
            await self._session.commit()
        except IntegrityError as exc:
            # Lost the race against a concurrent registration for the same email.
            await self._session.rollback()
            raise EmailAlreadyRegistered from exc

        return user, tokens

    async def login(self, *, email: str, password: str) -> tuple[User, TokenPairResponse]:
        user = await self._users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise InvalidCredentials

        tokens = await self._issue_tokens(user)
        await self._session.commit()
        return user, tokens

    async def refresh(self, *, refresh_token: str) -> TokenPairResponse:
        payload = self._decode_refresh(refresh_token)
        jti = self._parse_uuid(payload.get("jti"))
        user_id = self._parse_uuid(payload.get("sub"))

        stored = await self._refresh_tokens.get(jti)
        if stored is None or stored.user_id != user_id:
            raise InvalidRefreshToken

        if stored.revoked_at is not None:
            # Replay of an already-rotated token: treat the session as compromised.
            await self._refresh_tokens.revoke_all_for_user(user_id)
            await self._session.commit()
            raise InvalidRefreshToken

        if stored.expires_at <= datetime.now(UTC):
            raise InvalidRefreshToken

        if not await self._refresh_tokens.revoke(jti):
            raise InvalidRefreshToken

        user = await self._users.get_by_id(user_id)
        if user is None:
            raise InvalidRefreshToken

        tokens = await self._issue_tokens(user)
        await self._session.commit()
        return tokens

    async def logout(self, *, refresh_token: str) -> None:
        """Best effort: a token we cannot decode is already useless to the caller."""
        try:
            payload = self._decode_refresh(refresh_token)
            jti = self._parse_uuid(payload.get("jti"))
        except InvalidRefreshToken:
            return

        await self._refresh_tokens.revoke(jti)
        await self._session.commit()

    async def _issue_tokens(self, user: User) -> TokenPairResponse:
        jti = uuid.uuid4()
        refresh_token, expires_at = create_refresh_token(user.id, jti)
        await self._refresh_tokens.create(jti=jti, user_id=user.id, expires_at=expires_at)

        return TokenPairResponse(
            access_token=create_access_token(user.id, user.role.value),
            refresh_token=refresh_token,
        )

    @staticmethod
    def _decode_refresh(token: str) -> dict[str, object]:
        try:
            return decode_token(token, "refresh")
        except InvalidToken as exc:
            raise InvalidRefreshToken from exc

    @staticmethod
    def _parse_uuid(value: object) -> uuid.UUID:
        if not isinstance(value, str):
            raise InvalidRefreshToken
        try:
            return uuid.UUID(value)
        except ValueError as exc:
            raise InvalidRefreshToken from exc
