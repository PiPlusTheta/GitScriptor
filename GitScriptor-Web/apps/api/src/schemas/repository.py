from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
import re


class RepositoryBase(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    url: str
    clone_url: str
    ssh_url: Optional[str] = None
    homepage: Optional[str] = None
    language: Optional[str] = None
    default_branch: str = "main"
    is_private: bool = False
    is_fork: bool = False
    is_archived: bool = False


class RepositoryCreate(RepositoryBase):
    github_id: int
    owner_id: int
    languages: Optional[Dict[str, int]] = None
    topics: Optional[List[str]] = None
    stars_count: int = 0
    forks_count: int = 0
    watchers_count: int = 0
    open_issues_count: int = 0
    size: int = 0
    has_issues: bool = True
    has_projects: bool = True
    has_wiki: bool = True
    has_downloads: bool = True
    license_name: Optional[str] = None
    license_key: Optional[str] = None
    github_created_at: Optional[datetime] = None
    github_updated_at: Optional[datetime] = None
    github_pushed_at: Optional[datetime] = None


class RepositoryUpdate(BaseModel):
    description: Optional[str] = None
    homepage: Optional[str] = None
    topics: Optional[List[str]] = None
    stars_count: Optional[int] = None
    forks_count: Optional[int] = None
    watchers_count: Optional[int] = None
    open_issues_count: Optional[int] = None
    is_archived: Optional[bool] = None
    github_updated_at: Optional[datetime] = None
    github_pushed_at: Optional[datetime] = None


class Repository(RepositoryBase):
    id: int
    github_id: int
    owner_id: int
    languages: Optional[Dict[str, int]] = None
    topics: Optional[List[str]] = None
    stars_count: int = 0
    forks_count: int = 0
    watchers_count: int = 0
    open_issues_count: int = 0
    size: int = 0
    has_issues: bool = True
    has_projects: bool = True
    has_wiki: bool = True
    has_downloads: bool = True
    license_name: Optional[str] = None
    license_key: Optional[str] = None
    github_created_at: Optional[datetime] = None
    github_updated_at: Optional[datetime] = None
    github_pushed_at: Optional[datetime] = None
    last_synced_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RepositoryWithStats(Repository):
    """Repository with additional statistics"""

    readme_count: int = 0
    last_readme_generated: Optional[datetime] = None
    total_generations: int = 0


class RepositoryAnalytics(BaseModel):
    repository_id: int
    language_breakdown: Dict[str, float]  # Language percentages
    complexity_score: float
    documentation_score: float
    activity_score: float
    last_commit: Optional[datetime] = None
    commit_frequency: Dict[str, int]  # Monthly commit counts
    contributor_count: int = 0
    issue_resolution_rate: float = 0.0
    code_quality_metrics: Dict[str, Any] = {}


class RepositorySearchRequest(BaseModel):
    q: str
    sort: Optional[str] = "stars"  # stars, updated, created
    per_page: Optional[int] = 10

    @validator("per_page")
    def validate_per_page(cls, v):
        if v and (v < 1 or v > 100):
            raise ValueError("per_page must be between 1 and 100")
        return v


class RepositoryListRequest(BaseModel):
    sort: Optional[str] = "updated"  # stars, updated, created, name
    direction: Optional[str] = "desc"  # asc, desc
    language: Optional[str] = None
    type: Optional[str] = "all"  # all, public, private
    page: Optional[int] = 1
    per_page: Optional[int] = 25

    @validator("sort")
    def validate_sort(cls, v):
        allowed_sorts = ["stars", "updated", "created", "name"]
        if v and v not in allowed_sorts:
            raise ValueError(f"sort must be one of: {', '.join(allowed_sorts)}")
        return v

    @validator("direction")
    def validate_direction(cls, v):
        if v and v not in ["asc", "desc"]:
            raise ValueError("direction must be 'asc' or 'desc'")
        return v

    @validator("type")
    def validate_type(cls, v):
        allowed_types = ["all", "public", "private"]
        if v and v not in allowed_types:
            raise ValueError(f"type must be one of: {', '.join(allowed_types)}")
        return v

    @validator("page")
    def validate_page(cls, v):
        if v and v < 1:
            raise ValueError("page must be at least 1")
        return v

    @validator("per_page")
    def validate_per_page(cls, v):
        if v and (v < 1 or v > 100):
            raise ValueError("per_page must be between 1 and 100")
        return v


class PaginatedRepositories(BaseModel):
    repositories: List[RepositoryWithStats]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool
