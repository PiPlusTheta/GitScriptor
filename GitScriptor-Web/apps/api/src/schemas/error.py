from pydantic import BaseModel
from typing import Optional, Any, Dict


class ErrorResponse(BaseModel):
    error: str
    detail: str
    code: str
    timestamp: str
    path: Optional[str] = None
    request_id: Optional[str] = None


class ValidationErrorResponse(BaseModel):
    error: str = "VALIDATION_ERROR"
    detail: str
    code: str = "VALIDATION_ERROR"
    errors: list[Dict[str, Any]]
    timestamp: str


class RateLimitErrorResponse(BaseModel):
    error: str = "RATE_LIMITED"
    detail: str = "Too many requests"
    code: str = "RATE_LIMITED"
    retry_after: int
    timestamp: str


class GitHubErrorResponse(BaseModel):
    error: str = "GITHUB_ERROR"
    detail: str
    code: str = "GITHUB_ERROR"
    github_status: Optional[int] = None
    timestamp: str


class GeminiErrorResponse(BaseModel):
    error: str = "GEMINI_ERROR"
    detail: str
    code: str = "GEMINI_ERROR"
    timestamp: str
