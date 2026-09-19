from fastapi import APIRouter, status

from app.api.deps import AuthServiceDep, CurrentUser
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPairResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, auth: AuthServiceDep) -> AuthResponse:
    user, tokens = await auth.register(
        email=payload.email,
        name=payload.name,
        password=payload.password,
        role=payload.role,
    )
    return AuthResponse(user=UserResponse.model_validate(user), tokens=tokens)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, auth: AuthServiceDep) -> AuthResponse:
    user, tokens = await auth.login(email=payload.email, password=payload.password)
    return AuthResponse(user=UserResponse.model_validate(user), tokens=tokens)


@router.post("/refresh", response_model=TokenPairResponse)
async def refresh(payload: RefreshRequest, auth: AuthServiceDep) -> TokenPairResponse:
    return await auth.refresh(refresh_token=payload.refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: LogoutRequest, auth: AuthServiceDep) -> None:
    await auth.logout(refresh_token=payload.refresh_token)
