import uuid

from pydantic import EmailStr, Field

from app.core.security import MAX_PASSWORD_BYTES
from app.models.enums import UserRole
from app.schemas.base import CamelModel

PasswordField = Field(min_length=8, max_length=MAX_PASSWORD_BYTES)


class RegisterRequest(CamelModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = PasswordField
    role: UserRole = UserRole.DRIVER


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = PasswordField


class RefreshRequest(CamelModel):
    refresh_token: str


class LogoutRequest(CamelModel):
    refresh_token: str


class TokenPairResponse(CamelModel):
    access_token: str
    refresh_token: str


class UserResponse(CamelModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    role: UserRole


class AuthResponse(CamelModel):
    user: UserResponse
    tokens: TokenPairResponse
