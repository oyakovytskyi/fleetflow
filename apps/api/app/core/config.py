from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_JWT_SECRET = "dev-only-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FleetFlow API"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://fleetflow:fleetflow@postgres:5432/fleetflow"
    redis_url: str = "redis://redis:6379/0"

    jwt_secret: str = DEV_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 30

    cors_origins: list[str] = ["*"]

    @model_validator(mode="after")
    def reject_dev_secret_outside_debug(self) -> "Settings":
        if not self.debug and self.jwt_secret == DEV_JWT_SECRET:
            raise ValueError("JWT_SECRET must be set when DEBUG is false.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
