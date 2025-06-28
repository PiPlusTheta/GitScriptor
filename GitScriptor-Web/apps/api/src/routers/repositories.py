from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import Optional, List
import math

from ..db.database import get_db
from ..db.models import User, Repository, GenerationHistory
from ..schemas.repository import (
    Repository as RepositorySchema,
    RepositoryWithStats,
    RepositoryListRequest,
    PaginatedRepositories,
    RepositoryAnalytics,
    RepositorySearchRequest,
)
from ..services.github import github_service
from ..auth.dependencies import get_current_user
from ..auth.crypto import decrypt_token

router = APIRouter(prefix="/repositories", tags=["Repositories"])


@router.get("/", response_model=PaginatedRepositories)
async def get_user_repositories(
    sort: str = Query("updated", description="Sort by: stars, updated, created, name"),
    direction: str = Query("desc", description="Sort direction: asc, desc"),
    language: Optional[str] = Query(None, description="Filter by language"),
    type: str = Query("all", description="Repository type: all, public, private"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's repositories with pagination and filtering."""

    # Build query
    query = db.query(Repository).filter(Repository.owner_id == current_user.id)

    # Filter by language
    if language:
        query = query.filter(Repository.language == language)

    # Filter by type
    if type == "public":
        query = query.filter(Repository.is_private == False)
    elif type == "private":
        query = query.filter(Repository.is_private == True)

    # Apply sorting
    if sort == "stars":
        order_col = Repository.stars_count
    elif sort == "created":
        order_col = Repository.github_created_at
    elif sort == "name":
        order_col = Repository.name
    else:  # default to updated
        order_col = Repository.github_updated_at

    if direction == "asc":
        query = query.order_by(asc(order_col))
    else:
        query = query.order_by(desc(order_col))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * per_page
    repositories = query.offset(offset).limit(per_page).all()

    # Convert to response format with stats
    repo_stats = []
    for repo in repositories:
        # Get README generation stats
        readme_count = (
            db.query(GenerationHistory)
            .filter(GenerationHistory.repository_id == repo.id)
            .count()
        )

        last_generation = (
            db.query(GenerationHistory)
            .filter(GenerationHistory.repository_id == repo.id)
            .order_by(desc(GenerationHistory.generated_at))
            .first()
        )

        repo_with_stats = RepositoryWithStats(
            **repo.__dict__,
            readme_count=readme_count,
            last_readme_generated=(
                last_generation.generated_at if last_generation else None
            ),
            total_generations=readme_count,
        )
        repo_stats.append(repo_with_stats)

    # Calculate pagination info
    total_pages = math.ceil(total / per_page)
    has_next = page < total_pages
    has_prev = page > 1

    return PaginatedRepositories(
        repositories=repo_stats,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
    )


@router.get("/sync")
async def sync_repositories(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Sync repositories from GitHub."""
    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub access token not found",
        )

    access_token = decrypt_token(current_user.access_token)

    # Get repositories from GitHub
    github_repos = await github_service.get_user_repositories(
        access_token=access_token, per_page=100  # Get all repositories
    )

    synced_count = 0
    for github_repo in github_repos:
        # Check if repository already exists
        existing_repo = (
            db.query(Repository)
            .filter(
                and_(
                    Repository.github_id == github_repo["id"],
                    Repository.owner_id == current_user.id,
                )
            )
            .first()
        )

        # Get language breakdown
        languages = await github_service.get_repository_languages(
            access_token=access_token,
            owner=github_repo["owner"]["login"],
            repo=github_repo["name"],
        )

        repo_data = {
            "github_id": github_repo["id"],
            "owner_id": current_user.id,
            "name": github_repo["name"],
            "full_name": github_repo["full_name"],
            "description": github_repo.get("description"),
            "url": github_repo["html_url"],
            "clone_url": github_repo["clone_url"],
            "ssh_url": github_repo["ssh_url"],
            "homepage": github_repo.get("homepage"),
            "language": github_repo.get("language"),
            "languages": languages,
            "topics": github_repo.get("topics", []),
            "stars_count": github_repo["stargazers_count"],
            "forks_count": github_repo["forks_count"],
            "watchers_count": github_repo["watchers_count"],
            "open_issues_count": github_repo["open_issues_count"],
            "size": github_repo["size"],
            "default_branch": github_repo["default_branch"],
            "is_private": github_repo["private"],
            "is_fork": github_repo["fork"],
            "is_archived": github_repo["archived"],
            "is_disabled": github_repo["disabled"],
            "has_issues": github_repo["has_issues"],
            "has_projects": github_repo["has_projects"],
            "has_wiki": github_repo["has_wiki"],
            "has_downloads": github_repo["has_downloads"],
            "license_name": (
                github_repo["license"]["name"] if github_repo.get("license") else None
            ),
            "license_key": (
                github_repo["license"]["key"] if github_repo.get("license") else None
            ),
            "github_created_at": github_repo["created_at"],
            "github_updated_at": github_repo["updated_at"],
            "github_pushed_at": github_repo["pushed_at"],
        }

        if existing_repo:
            # Update existing repository
            for key, value in repo_data.items():
                if key not in ["github_id", "owner_id"]:  # Don't update these fields
                    setattr(existing_repo, key, value)
        else:
            # Create new repository
            new_repo = Repository(**repo_data)
            db.add(new_repo)
            synced_count += 1

    db.commit()

    return {
        "message": f"Successfully synced {synced_count} new repositories",
        "total_repositories": len(github_repos),
    }


@router.get("/search", response_model=List[dict])
async def search_repositories(
    q: str = Query(..., description="Search query"),
    sort: str = Query("stars", description="Sort by: stars, updated, created"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
):
    """Search repositories on GitHub."""
    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub access token not found",
        )

    access_token = decrypt_token(current_user.access_token)

    search_results = await github_service.search_repositories(
        access_token=access_token, query=q, sort=sort, per_page=per_page
    )

    return search_results.get("items", [])


@router.get("/{repository_id}", response_model=RepositorySchema)
async def get_repository(
    repository_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get repository details."""
    repository = (
        db.query(Repository)
        .filter(
            and_(Repository.id == repository_id, Repository.owner_id == current_user.id)
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found"
        )

    return RepositorySchema.from_orm(repository)


@router.get("/{repository_id}/analytics", response_model=RepositoryAnalytics)
async def get_repository_analytics(
    repository_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get repository analytics."""
    repository = (
        db.query(Repository)
        .filter(
            and_(Repository.id == repository_id, Repository.owner_id == current_user.id)
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found"
        )

    # Calculate language breakdown percentages
    languages = repository.languages or {}
    total_bytes = sum(languages.values()) if languages else 0
    language_breakdown = {}

    if total_bytes > 0:
        for lang, bytes_count in languages.items():
            language_breakdown[lang] = round((bytes_count / total_bytes) * 100, 2)

    # Mock analytics data (in a real implementation, you'd calculate these from GitHub API)
    analytics = RepositoryAnalytics(
        repository_id=repository.id,
        language_breakdown=language_breakdown,
        complexity_score=75.5,  # Mock score
        documentation_score=60.0,  # Mock score
        activity_score=85.2,  # Mock score
        last_commit=repository.github_pushed_at,
        commit_frequency={},  # Mock data
        contributor_count=1,  # Mock data
        issue_resolution_rate=0.8,  # Mock data
        code_quality_metrics={},  # Mock data
    )

    return analytics
