from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None


class UserCreate(UserBase):
    github_id: int
    avatar_url: Optional[str] = None
    access_token: str
    refresh_token: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    twitter_username: Optional[str] = None


class User(UserBase):
    id: int
    github_id: int
    avatar_url: Optional[str] = None
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    github_created_at: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfile(User):
    """Extended user profile with additional stats"""

    total_repositories: int = 0
    total_readmes_generated: int = 0
    total_drafts: int = 0


class UserSettingsBase(BaseModel):
    default_style: str = "classic"
    auto_save_drafts: bool = True
    email_notifications: bool = True
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"


class UserSettingsCreate(UserSettingsBase):
    user_id: int


class UserSettingsUpdate(BaseModel):
    default_style: Optional[str] = None
    auto_save_drafts: Optional[bool] = None
    email_notifications: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None


class UserSettings(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
