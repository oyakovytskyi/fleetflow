from enum import StrEnum


class UserRole(StrEnum):
    """Mirrors `UserRole` in @fleetflow/shared-types."""

    DRIVER = "DRIVER"
    ADMIN = "ADMIN"


class DeliveryStatus(StrEnum):
    """Mirrors `DeliveryStatus` in @fleetflow/shared-types."""

    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
