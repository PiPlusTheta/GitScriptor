from fastapi import FastAPI, Request
import time
import logging
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""

    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Start timer
        start_time = time.time()

        # Log request
        logger.info(
            f"Request started - {request.method} {request.url.path} "
            f"(ID: {request_id}) - Client: {request.client.host if request.client else 'Unknown'}"
        )

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            logger.info(
                f"Request completed - {request.method} {request.url.path} "
                f"(ID: {request_id}) - Status: {response.status_code} - Duration: {duration:.3f}s"
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as exc:
            # Calculate duration
            duration = time.time() - start_time

            # Log error
            logger.error(
                f"Request failed - {request.method} {request.url.path} "
                f"(ID: {request_id}) - Error: {str(exc)} - Duration: {duration:.3f}s"
            )

            raise exc


def add_request_logging(app: FastAPI):
    """Add request logging middleware to the FastAPI app."""
    app.add_middleware(RequestLoggingMiddleware)
