from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta

from ..db.database import get_db
from ..db.models import User, UserSettings
from ..schemas.auth import LoginResponse, LogoutResponse
from ..schemas.user import (
    User as UserSchema,
    UserCreate,
    UserSettings as UserSettingsSchema,
)
from ..services.github import github_service
from ..auth.crypto import create_access_token, encrypt_token
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/login")
async def github_login():
    """Redirect to GitHub OAuth."""
    oauth_url = github_service.get_oauth_url()
    return RedirectResponse(url=oauth_url)


@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    # Exchange code for token
    token_data = await github_service.exchange_code_for_token(code)
    if not token_data or "access_token" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange code for token",
        )

    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")

    # Get user info from GitHub
    github_user = await github_service.get_user_info(access_token)
    if not github_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user information from GitHub",
        )

    # Check if user exists
    user = db.query(User).filter(User.github_id == github_user.id).first()

    if user:
        # Update existing user
        user.username = github_user.login
        user.email = github_user.email
        user.name = github_user.name
        user.avatar_url = github_user.avatar_url
        user.bio = github_user.bio
        user.location = github_user.location
        user.company = github_user.company
        user.blog = github_user.blog
        user.twitter_username = github_user.twitter_username
        user.public_repos = github_user.public_repos
        user.public_gists = github_user.public_gists
        user.followers = github_user.followers
        user.following = github_user.following
        user.access_token = encrypt_token(access_token)
        if refresh_token:
            user.refresh_token = encrypt_token(refresh_token)
        user.is_active = True
    else:
        # Create new user
        user = User(
            github_id=github_user.id,
            username=github_user.login,
            email=github_user.email,
            name=github_user.name,
            avatar_url=github_user.avatar_url,
            bio=github_user.bio,
            location=github_user.location,
            company=github_user.company,
            blog=github_user.blog,
            twitter_username=github_user.twitter_username,
            public_repos=github_user.public_repos,
            public_gists=github_user.public_gists,
            followers=github_user.followers,
            following=github_user.following,
            github_created_at=github_user.created_at,
            access_token=encrypt_token(access_token),
            refresh_token=encrypt_token(refresh_token) if refresh_token else None,
            is_active=True,
        )
        db.add(user)
        db.flush()  # Get the user ID

        # Create default user settings
        settings = UserSettings(user_id=user.id)
        db.add(settings)

    db.commit()
    db.refresh(user)

    # Create JWT token
    access_token_expires = timedelta(minutes=30 * 24 * 60)  # 30 days
    jwt_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return LoginResponse(
        user=UserSchema.from_orm(user),
        access_token=jwt_token,
        message="Login successful",
    )


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserSchema.from_orm(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user."""
    # In a more sophisticated implementation, you might want to blacklist the token
    return LogoutResponse(message="Logout successful")
