from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, Dict, Any
import re


class ReadmeGenerateRequest(BaseModel):
    repo_url: str
    style: Optional[str] = "classic"
    include_sections: Optional[Dict[str, bool]] = None
    template_id: Optional[str] = None
    custom_sections: Optional[list[str]] = None
    ai_model: Optional[str] = "default"  # default, advanced, premium

    @validator("repo_url")
    def validate_repo_url(cls, v):
        pattern = r"^https://github\.com/[\w\-\.]+/[\w\-\.]+(?:\.git)?/?$"
        if not re.match(pattern, v):
            raise ValueError("Invalid GitHub URL format")
        return v

    @validator("style")
    def validate_style(cls, v):
        allowed_styles = ["classic", "modern", "minimal", "comprehensive"]
        if v and v not in allowed_styles:
            raise ValueError(f"style must be one of: {', '.join(allowed_styles)}")
        return v


class ReadmeGenerateResponse(BaseModel):
    success: bool = True
    markdown: str
    elapsed_ms: int
    style: str = "classic"
    template_used: Optional[str] = None
    sections_generated: list[str] = []
    word_count: Optional[int] = None
    repository: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    generation_id: Optional[str] = None  # For tracking


class ReadmeDraftBase(BaseModel):
    title: str
    content: str
    style: str = "classic"
    metadata: Optional[Dict[str, Any]] = None


class ReadmeDraftCreate(ReadmeDraftBase):
    repository_id: int


class ReadmeDraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    style: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ReadmeDraft(ReadmeDraftBase):
    id: int
    user_id: int
    repository_id: int
    is_published: bool = False
    version: int = 1
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReadmeDraftWithRepository(ReadmeDraft):
    repository: Optional[Dict[str, Any]] = None


class ReadmeCommitRequest(BaseModel):
    repository_id: int
    content: str
    commit_message: Optional[str] = "Update README.md"
    branch: Optional[str] = None  # If None, uses default branch


class ReadmeCommitResponse(BaseModel):
    success: bool
    commit_sha: Optional[str] = None
    commit_url: Optional[str] = None
    message: str


class PaginatedReadmeDrafts(BaseModel):
    drafts: list[ReadmeDraftWithRepository]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool
