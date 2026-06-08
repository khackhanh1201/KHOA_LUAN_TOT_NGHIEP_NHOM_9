"""FastAPI dependencies for request validation and authentication."""

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader

from app.config import API_SECRET_KEY

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: str | None = Depends(_api_key_header),
) -> str:
    """Validate the API key from the request header.

    Args:
        api_key: Value of the X-API-Key header (injected by FastAPI).

    Returns:
        The validated API key string.

    Raises:
        HTTPException 401: If the key is missing or invalid.
    """
    if not API_SECRET_KEY:
        # If no secret key is configured, skip authentication (dev mode)
        return ""

    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thiếu API Key. Vui lòng thêm header 'X-API-Key'.",
        )

    if api_key != API_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key không hợp lệ.",
        )

    return api_key
