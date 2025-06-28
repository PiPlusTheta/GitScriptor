from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None
    scope: Optional[str] = None


class GitHubUser(BaseModel):
    id: int
    login: str
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: str
    bio: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    created_at: datetime


class LoginResponse(BaseModel):
    user: "User"  # Forward reference
    access_token: str
    token_type: str = "bearer"
    message: str = "Login successful"


class LogoutResponse(BaseModel):
    message: str = "Logout successful"


# Import User after defining other models to avoid circular import
from .user import User

LoginResponse.model_rebuild()
