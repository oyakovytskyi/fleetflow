import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import bcrypt
import jwt

from app.core.config import get_settings

TokenType = Literal["access", "refresh"]

# bcrypt hashes at most 72 bytes and silently ignores the rest.
MAX_PASSWORD_BYTES = 72


class InvalidToken(Exception):
    """Token is malformed, expired, or not of the expected type."""


def hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(_password_bytes(raw_password), bcrypt.gensalt()).decode()


def verify_password(raw_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_password_bytes(raw_password), hashed_password.encode())
    except ValueError:
        return False


def _password_bytes(raw_password: str) -> bytes:
    encoded = raw_password.encode()
    if len(encoded) > MAX_PASSWORD_BYTES:
        raise ValueError("Password exceeds the 72-byte bcrypt limit.")
    return encoded


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.access_token_ttl_minutes)
    return _encode({"sub": str(user_id), "role": role, "type": "access"}, expires_at)


def create_refresh_token(user_id: uuid.UUID, jti: uuid.UUID) -> tuple[str, datetime]:
    """Returns the token plus its expiry so the caller can persist the jti."""
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_ttl_days)
    token = _encode({"sub": str(user_id), "jti": str(jti), "type": "refresh"}, expires_at)
    return token, expires_at


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError as exc:
        raise InvalidToken(str(exc)) from exc

    if payload.get("type") != expected_type:
        raise InvalidToken(f"Expected a {expected_type} token.")

    return payload


def _encode(claims: dict[str, Any], expires_at: datetime) -> str:
    settings = get_settings()
    payload = {**claims, "exp": expires_at, "iat": datetime.now(UTC)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
