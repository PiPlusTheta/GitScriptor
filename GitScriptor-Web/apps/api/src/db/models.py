from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    Boolean,
    ForeignKey,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    avatar_url = Column(String)
    bio = Column(Text)
    location = Column(String)
    company = Column(String)
    blog = Column(String)
    twitter_username = Column(String)
    public_repos = Column(Integer, default=0)
    public_gists = Column(Integer, default=0)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    github_created_at = Column(DateTime)
    access_token = Column(String)  # Encrypted GitHub access token
    refresh_token = Column(String)  # Encrypted GitHub refresh token
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    repositories = relationship("Repository", back_populates="owner")
    readme_drafts = relationship("ReadmeDraft", back_populates="user")
    generation_history = relationship("GenerationHistory", back_populates="user")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    default_style = Column(String, default="classic")
    auto_save_drafts = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    theme = Column(String, default="light")  # light, dark, auto
    language = Column(String, default="en")
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="settings")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    description = Column(Text)
    url = Column(String, nullable=False)
    clone_url = Column(String, nullable=False)
    ssh_url = Column(String)
    homepage = Column(String)
    language = Column(String)
    languages = Column(JSON)  # Language breakdown
    topics = Column(JSON)  # Repository topics/tags
    stars_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    watchers_count = Column(Integer, default=0)
    open_issues_count = Column(Integer, default=0)
    size = Column(Integer, default=0)  # Repository size in KB
    default_branch = Column(String, default="main")
    is_private = Column(Boolean, default=False)
    is_fork = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_disabled = Column(Boolean, default=False)
    has_issues = Column(Boolean, default=True)
    has_projects = Column(Boolean, default=True)
    has_wiki = Column(Boolean, default=True)
    has_downloads = Column(Boolean, default=True)
    license_name = Column(String)
    license_key = Column(String)
    github_created_at = Column(DateTime)
    github_updated_at = Column(DateTime)
    github_pushed_at = Column(DateTime)
    last_synced_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="repositories")
    readme_drafts = relationship("ReadmeDraft", back_populates="repository")
    generation_history = relationship("GenerationHistory", back_populates="repository")


class ReadmeDraft(Base):
    __tablename__ = "readme_drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    style = Column(String, default="classic")
    is_published = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    draft_metadata = Column(JSON)  # Additional metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="readme_drafts")
    repository = relationship("Repository", back_populates="readme_drafts")


class GenerationHistory(Base):
    __tablename__ = "generation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    repo_url = Column(String, nullable=False, index=True)
    markdown_content = Column(Text, nullable=False)
    style = Column(String, default="classic")
    generation_time_ms = Column(Integer)  # Time taken to generate
    prompt_tokens = Column(Integer)  # AI tokens used for prompt
    completion_tokens = Column(Integer)  # AI tokens used for completion
    model_used = Column(String)  # AI model used
    status = Column(String, default="completed")  # completed, failed, pending
    error_message = Column(Text)  # Error message if failed
    generation_metadata = Column(JSON)  # Additional generation metadata
    generated_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="generation_history")
    repository = relationship("Repository", back_populates="generation_history")


class GeneratedReadme(Base):
    __tablename__ = "generated_readmes"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String, nullable=False, index=True)
    markdown_content = Column(Text, nullable=False)
    generated_at = Column(DateTime, server_default=func.now())
    style = Column(String, default="classic")
    # Keep for backward compatibility with existing code
