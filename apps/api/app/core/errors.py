class DomainError(Exception):
    """Base for errors that map to a 4xx response."""

    status_code = 400
    detail = "Request could not be processed."


class EmailAlreadyRegistered(DomainError):
    status_code = 409
    detail = "That email is already registered."


class InvalidCredentials(DomainError):
    status_code = 401
    detail = "Incorrect email or password."


class InvalidRefreshToken(DomainError):
    status_code = 401
    detail = "Refresh token is invalid, expired, or already used."


class DeliveryNotFound(DomainError):
    status_code = 404
    detail = "Delivery not found."


class ForbiddenDeliveryAccess(DomainError):
    status_code = 403
    detail = "You do not have access to this delivery."


class IllegalStatusTransition(DomainError):
    status_code = 409
    detail = "That status change is not allowed."


class DeliveryAlreadyAssigned(DomainError):
    status_code = 409
    detail = "Delivery is already assigned to a driver."


class DriverNotFound(DomainError):
    status_code = 404
    detail = "Driver not found."
