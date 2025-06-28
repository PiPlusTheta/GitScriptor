from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv
from datetime import datetime
import uuid

from .routers import (
    generate,
    health,
    auth,
    repositories,
    readme,
    history,
    user,
    status as status_router,
    templates,
    search,
)
from .middleware.exception_handler import add_exception_handlers
from .middleware.request_logger import add_request_logging

# Load environment variables
load_dotenv()

app = FastAPI(
    title="GitScriptor API",
    description="Comprehensive API for GitScriptor - AI-powered README generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://gitscriptor.com",  # Add production domains
        "https://app.gitscriptor.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
add_request_logging(app)
add_exception_handlers(app)

# Include routers
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(repositories.router)
app.include_router(readme.router)
app.include_router(history.router)
app.include_router(user.router)
app.include_router(templates.router)
app.include_router(search.router)
app.include_router(health.router)
app.include_router(status_router.router)


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Welcome to GitScriptor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "status": "/status",
    }


# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "detail": "Invalid input data",
            "code": "VALIDATION_ERROR",
            "errors": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )
