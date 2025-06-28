from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class GenerationHistoryBase(BaseModel):
    repo_url: str
    markdown_content: str
    style: str = "classic"
    generation_time_ms: Optional[int] = None
    model_used: Optional[str] = None


class GenerationHistoryCreate(GenerationHistoryBase):
    user_id: int
    repository_id: Optional[int] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    status: str = "completed"
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class GenerationHistory(GenerationHistoryBase):
    id: int
    user_id: int
    repository_id: Optional[int] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    status: str = "completed"
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    generated_at: datetime

    class Config:
        from_attributes = True


class GenerationHistoryWithRepository(GenerationHistory):
    repository: Optional[Dict[str, Any]] = None


class GenerationHistoryRequest(BaseModel):
    page: Optional[int] = 1
    per_page: Optional[int] = 25
    status: Optional[str] = None  # completed, failed, pending
    style: Optional[str] = None


class PaginatedGenerationHistory(BaseModel):
    history: List[GenerationHistoryWithRepository]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


class GenerationStats(BaseModel):
    total_generations: int
    successful_generations: int
    failed_generations: int
    average_generation_time: float
    total_tokens_used: int
    most_used_style: str
    generations_by_month: Dict[str, int]
    popular_languages: Dict[str, int]
