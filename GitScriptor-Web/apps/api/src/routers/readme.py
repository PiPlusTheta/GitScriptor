from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import Optional, List
import math

from ..db.database import get_db
from ..db.models import User, Repository, ReadmeDraft
from ..schemas.readme import (
    ReadmeGenerateRequest,
    ReadmeGenerateResponse,
    ReadmeDraft as ReadmeDraftSchema,
    ReadmeDraftCreate,
    ReadmeDraftUpdate,
    ReadmeDraftWithRepository,
    PaginatedReadmeDrafts,
    ReadmeCommitRequest,
    ReadmeCommitResponse,
)
from ..services.github import github_service
from ..auth.dependencies import get_current_user
from ..auth.crypto import decrypt_token

router = APIRouter(prefix="/readme", tags=["README Management"])


@router.post("/drafts", response_model=ReadmeDraftSchema)
async def save_readme_draft(
    draft_data: ReadmeDraftCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a README draft."""
    # Verify repository ownership
    repository = (
        db.query(Repository)
        .filter(
            and_(
                Repository.id == draft_data.repository_id,
                Repository.owner_id == current_user.id,
            )
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found"
        )

    # Check if draft already exists
    existing_draft = (
        db.query(ReadmeDraft)
        .filter(
            and_(
                ReadmeDraft.user_id == current_user.id,
                ReadmeDraft.repository_id == draft_data.repository_id,
                ReadmeDraft.title == draft_data.title,
            )
        )
        .first()
    )

    if existing_draft:
        # Update existing draft
        existing_draft.content = draft_data.content
        existing_draft.style = draft_data.style
        existing_draft.metadata = draft_data.metadata
        existing_draft.version += 1
        db.commit()
        db.refresh(existing_draft)
        return ReadmeDraftSchema.from_orm(existing_draft)
    else:
        # Create new draft
        draft = ReadmeDraft(
            user_id=current_user.id,
            repository_id=draft_data.repository_id,
            title=draft_data.title,
            content=draft_data.content,
            style=draft_data.style,
            metadata=draft_data.metadata,
        )
        db.add(draft)
        db.commit()
        db.refresh(draft)
        return ReadmeDraftSchema.from_orm(draft)


@router.get("/drafts", response_model=PaginatedReadmeDrafts)
async def get_readme_drafts(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's README drafts."""
    query = db.query(ReadmeDraft).filter(ReadmeDraft.user_id == current_user.id)

    if repository_id:
        query = query.filter(ReadmeDraft.repository_id == repository_id)

    query = query.order_by(desc(ReadmeDraft.updated_at))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * per_page
    drafts = query.offset(offset).limit(per_page).all()

    # Add repository information
    drafts_with_repo = []
    for draft in drafts:
        repository = (
            db.query(Repository).filter(Repository.id == draft.repository_id).first()
        )
        draft_dict = draft.__dict__.copy()
        draft_dict["repository"] = (
            {
                "id": repository.id,
                "name": repository.name,
                "full_name": repository.full_name,
                "url": repository.url,
            }
            if repository
            else None
        )

        drafts_with_repo.append(ReadmeDraftWithRepository(**draft_dict))

    # Calculate pagination info
    total_pages = math.ceil(total / per_page)
    has_next = page < total_pages
    has_prev = page > 1

    return PaginatedReadmeDrafts(
        drafts=drafts_with_repo,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev,
    )


@router.get("/drafts/{draft_id}", response_model=ReadmeDraftSchema)
async def get_readme_draft(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific README draft."""
    draft = (
        db.query(ReadmeDraft)
        .filter(
            and_(ReadmeDraft.id == draft_id, ReadmeDraft.user_id == current_user.id)
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found"
        )

    return ReadmeDraftSchema.from_orm(draft)


@router.put("/drafts/{draft_id}", response_model=ReadmeDraftSchema)
async def update_readme_draft(
    draft_id: int,
    draft_update: ReadmeDraftUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a README draft."""
    draft = (
        db.query(ReadmeDraft)
        .filter(
            and_(ReadmeDraft.id == draft_id, ReadmeDraft.user_id == current_user.id)
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found"
        )

    # Update fields
    update_data = draft_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(draft, field, value)

    draft.version += 1
    db.commit()
    db.refresh(draft)

    return ReadmeDraftSchema.from_orm(draft)


@router.delete("/drafts/{draft_id}")
async def delete_readme_draft(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a README draft."""
    draft = (
        db.query(ReadmeDraft)
        .filter(
            and_(ReadmeDraft.id == draft_id, ReadmeDraft.user_id == current_user.id)
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found"
        )

    db.delete(draft)
    db.commit()

    return {"message": "Draft deleted successfully"}


@router.post("/commit", response_model=ReadmeCommitResponse)
async def commit_readme_to_github(
    commit_request: ReadmeCommitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Commit README to GitHub repository."""
    if not current_user.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub access token not found",
        )

    # Verify repository ownership
    repository = (
        db.query(Repository)
        .filter(
            and_(
                Repository.id == commit_request.repository_id,
                Repository.owner_id == current_user.id,
            )
        )
        .first()
    )

    if not repository:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found"
        )

    access_token = decrypt_token(current_user.access_token)

    # Extract owner and repo name from full_name
    owner, repo_name = repository.full_name.split("/", 1)

    # Commit to GitHub
    commit_result = await github_service.commit_file(
        access_token=access_token,
        owner=owner,
        repo=repo_name,
        path="README.md",
        content=commit_request.content,
        message=commit_request.commit_message,
        branch=commit_request.branch,
    )

    if commit_result:
        return ReadmeCommitResponse(
            success=True,
            commit_sha=commit_result["commit"]["sha"],
            commit_url=commit_result["commit"]["html_url"],
            message="README committed successfully",
        )
    else:
        return ReadmeCommitResponse(
            success=False, message="Failed to commit README to GitHub"
        )
