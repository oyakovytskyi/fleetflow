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
