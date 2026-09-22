"""Lightweight API smoke tests (no live Postgres/Redis required)."""

from __future__ import annotations

from app.core.errors import (
    DeliveryNotFound,
    DomainError,
    EmailAlreadyRegistered,
    IllegalStatusTransition,
    InvalidCredentials,
)
from app.models.enums import DeliveryStatus


def test_domain_error_defaults() -> None:
    err = DomainError()
    assert err.status_code == 400
    assert "processed" in err.detail.lower()


def test_auth_error_codes() -> None:
    assert EmailAlreadyRegistered().status_code == 409
    assert InvalidCredentials().status_code == 401


def test_delivery_error_codes() -> None:
    assert DeliveryNotFound().status_code == 404
    assert IllegalStatusTransition().status_code == 409


def test_delivery_status_enum_values() -> None:
    assert DeliveryStatus.PENDING.value == "PENDING"
    assert DeliveryStatus.IN_PROGRESS.value == "IN_PROGRESS"
    assert DeliveryStatus.COMPLETED.value == "COMPLETED"
