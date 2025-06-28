from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func, extract
from typing import Optional, Dict
import math
from datetime import datetime, timedelta

from ..db.database import get_db
from ..db.models import User, Repository, GenerationHistory
from ..schemas.job import (
    GenerationHistory as GenerationHistorySchema,
    GenerationHistoryWithRepository,
    PaginatedGenerationHistory,
    GenerationStats,
)
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/history", tags=["Generation History"])


@router.get("/", response_model=PaginatedGenerationHistory)
async def get_generation_history(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(
        None, description="Filter by status: completed, failed, pending"
    ),
    style: Optional[str] = Query(None, description="Filter by style"),
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's generation history with pagination and filtering."""
    query = db.query(GenerationHistory).filter(
        GenerationHistory.user_id == current_user.id
    )

    # Apply filters
    if status:
        query = query.filter(GenerationHistory.status == status)

    if style:
        query = query.filter(GenerationHistory.style == style)

    if repository_id:
        query = query.filter(GenerationHistory.repository_id == repository_id)

    query = query.order_by(desc(GenerationHistory.generated_at))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * per_page
    history_items = query.offset(offset).limit(per_page).all()

    # Add repository information
    history_with_repo = []
    for item in history_items:
        repository = None
        if item.repository_id:
            repo = (
                db.query(Repository).filter(Repository.id == item.repository_id).first()
            )
            if repo:
                repository = {
                    "id": repo.id,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "url": repo.url,
                    "language": repo.language,
                }

        item_dict = item.__dict__.copy()
        item_dict["repository"] = repository
        history_with_repo.append(GenerationHistoryWithRepository(**item_dict))

    # Calculate pagination info
    total_pages = math.ceil(total / per_page)
    has_next = page < total_pages
    has_prev = page > 1

    return PaginatedGenerationHistory(
        history=history_with_repo,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
    )


@router.get("/stats", response_model=GenerationStats)
async def get_generation_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's generation statistics."""
    base_query = db.query(GenerationHistory).filter(
        GenerationHistory.user_id == current_user.id
    )

    # Basic counts
    total_generations = base_query.count()
    successful_generations = base_query.filter(
        GenerationHistory.status == "completed"
    ).count()
    failed_generations = base_query.filter(GenerationHistory.status == "failed").count()

    # Average generation time
    avg_time_result = (
        base_query.filter(
            and_(
                GenerationHistory.status == "completed",
                GenerationHistory.generation_time_ms.isnot(None),
            )
        )
        .with_entities(func.avg(GenerationHistory.generation_time_ms))
        .scalar()
    )

    average_generation_time = float(avg_time_result) if avg_time_result else 0.0

    # Total tokens used
    total_tokens_result = base_query.with_entities(
        func.sum(GenerationHistory.prompt_tokens + GenerationHistory.completion_tokens)
    ).scalar()

    total_tokens_used = int(total_tokens_result) if total_tokens_result else 0

    # Most used style
    style_counts = (
        db.query(
            GenerationHistory.style, func.count(GenerationHistory.style).label("count")
        )
        .filter(GenerationHistory.user_id == current_user.id)
        .group_by(GenerationHistory.style)
        .order_by(desc("count"))
        .first()
    )

    most_used_style = style_counts[0] if style_counts else "classic"

    # Generations by month (last 12 months)
    twelve_months_ago = datetime.now() - timedelta(days=365)
    monthly_generations = (
        db.query(
            func.date_trunc("month", GenerationHistory.generated_at).label("month"),
            func.count(GenerationHistory.id).label("count"),
        )
        .filter(
            and_(
                GenerationHistory.user_id == current_user.id,
                GenerationHistory.generated_at >= twelve_months_ago,
            )
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    generations_by_month = {}
    for month, count in monthly_generations:
        month_key = month.strftime("%Y-%m")
        generations_by_month[month_key] = count

    # Popular languages (from repositories)
    language_counts = (
        db.query(Repository.language, func.count(GenerationHistory.id).label("count"))
        .join(GenerationHistory, Repository.id == GenerationHistory.repository_id)
        .filter(
            and_(
                GenerationHistory.user_id == current_user.id,
                Repository.language.isnot(None),
            )
        )
        .group_by(Repository.language)
        .order_by(desc("count"))
        .limit(10)
        .all()
    )

    popular_languages = {lang: count for lang, count in language_counts}

    return GenerationStats(
        total_generations=total_generations,
        successful_generations=successful_generations,
        failed_generations=failed_generations,
        average_generation_time=average_generation_time,
        total_tokens_used=total_tokens_used,
        most_used_style=most_used_style,
        generations_by_month=generations_by_month,
        popular_languages=popular_languages,
    )


@router.get("/{history_id}", response_model=GenerationHistorySchema)
async def get_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific history item."""
    history_item = (
        db.query(GenerationHistory)
        .filter(
            and_(
                GenerationHistory.id == history_id,
                GenerationHistory.user_id == current_user.id,
            )
        )
        .first()
    )

    if not history_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="History item not found"
        )

    return GenerationHistorySchema.from_orm(history_item)


@router.delete("/{history_id}")
async def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a history item."""
    history_item = (
        db.query(GenerationHistory)
        .filter(
            and_(
                GenerationHistory.id == history_id,
                GenerationHistory.user_id == current_user.id,
            )
        )
        .first()
    )

    if not history_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="History item not found"
        )

    db.delete(history_item)
    db.commit()

    return {"message": "History item deleted successfully"}
