from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..db.models import User, UserSettings
from ..schemas.user import (
    User as UserSchema,
    UserProfile,
    UserUpdate,
    UserSettings as UserSettingsSchema,
    UserSettingsUpdate,
)
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/user", tags=["User Management"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user profile with extended statistics."""
    # Get basic user data
    user_data = UserSchema.from_orm(current_user)

    # Get additional statistics
    from ..db.models import Repository, GenerationHistory, ReadmeDraft

    total_repositories = (
        db.query(Repository).filter(Repository.owner_id == current_user.id).count()
    )
    total_readmes_generated = (
        db.query(GenerationHistory)
        .filter(GenerationHistory.user_id == current_user.id)
        .count()
    )
    total_drafts = (
        db.query(ReadmeDraft).filter(ReadmeDraft.user_id == current_user.id).count()
    )

    # Create extended profile
    profile_data = user_data.dict()
    profile_data.update(
        {
            "total_repositories": total_repositories,
            "total_readmes_generated": total_readmes_generated,
            "total_drafts": total_drafts,
        }
    )

    return UserProfile(**profile_data)


@router.put("/profile", response_model=UserSchema)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return UserSchema.from_orm(current_user)


@router.get("/settings", response_model=UserSettingsSchema)
async def get_user_settings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user settings."""
    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if not settings:
        # Create default settings if they don't exist
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return UserSettingsSchema.from_orm(settings)


@router.put("/settings", response_model=UserSettingsSchema)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user settings."""
    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if not settings:
        # Create settings if they don't exist
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.flush()

    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return UserSettingsSchema.from_orm(settings)


@router.delete("/account")
async def delete_user_account(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete user account and all associated data."""
    # In a production system, you might want to:
    # 1. Soft delete instead of hard delete
    # 2. Export user data before deletion
    # 3. Add additional confirmation steps

    # Delete associated data
    from ..db.models import Repository, GenerationHistory, ReadmeDraft, UserSettings

    # Delete user's repositories, drafts, and history
    db.query(GenerationHistory).filter(
        GenerationHistory.user_id == current_user.id
    ).delete()
    db.query(ReadmeDraft).filter(ReadmeDraft.user_id == current_user.id).delete()
    db.query(Repository).filter(Repository.owner_id == current_user.id).delete()
    db.query(UserSettings).filter(UserSettings.user_id == current_user.id).delete()

    # Delete user
    db.delete(current_user)
    db.commit()

    return {"message": "Account deleted successfully"}
