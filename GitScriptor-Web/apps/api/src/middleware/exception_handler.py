from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
import traceback
import logging

logger = logging.getLogger(__name__)


def add_exception_handlers(app: FastAPI):
    """Add global exception handlers to the FastAPI app."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions with consistent error format."""
        error_code = "HTTP_ERROR"

        # Map specific status codes to error codes
        if exc.status_code == 401:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == 403:
            error_code = "FORBIDDEN"
        elif exc.status_code == 404:
            error_code = "NOT_FOUND"
        elif exc.status_code == 408:
            error_code = "TIMEOUT"
        elif exc.status_code == 429:
            error_code = "RATE_LIMITED"
        elif exc.status_code >= 500:
            error_code = "INTERNAL_ERROR"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": error_code,
                "detail": exc.detail,
                "code": error_code,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.error(f"Unexpected error: {exc}", exc_info=True)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path),
            },
        )
