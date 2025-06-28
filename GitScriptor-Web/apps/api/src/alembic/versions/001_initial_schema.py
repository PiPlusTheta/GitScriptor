"""Initial database schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-06-28 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("github_id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("company", sa.String(), nullable=True),
        sa.Column("blog", sa.String(), nullable=True),
        sa.Column("twitter_username", sa.String(), nullable=True),
        sa.Column("public_repos", sa.Integer(), nullable=True, default=0),
        sa.Column("public_gists", sa.Integer(), nullable=True, default=0),
        sa.Column("followers", sa.Integer(), nullable=True, default=0),
        sa.Column("following", sa.Integer(), nullable=True, default=0),
        sa.Column("github_created_at", sa.DateTime(), nullable=True),
        sa.Column("access_token", sa.String(), nullable=True),
        sa.Column("refresh_token", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_github_id"), "users", ["github_id"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Create user_settings table
    op.create_table(
        "user_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("default_style", sa.String(), nullable=True, default="classic"),
        sa.Column("auto_save_drafts", sa.Boolean(), nullable=True, default=True),
        sa.Column("email_notifications", sa.Boolean(), nullable=True, default=True),
        sa.Column("theme", sa.String(), nullable=True, default="light"),
        sa.Column("language", sa.String(), nullable=True, default="en"),
        sa.Column("timezone", sa.String(), nullable=True, default="UTC"),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_settings_id"), "user_settings", ["id"], unique=False)
    op.create_index(
        op.f("ix_user_settings_user_id"), "user_settings", ["user_id"], unique=True
    )

    # Create repositories table
    op.create_table(
        "repositories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("github_id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("clone_url", sa.String(), nullable=False),
        sa.Column("ssh_url", sa.String(), nullable=True),
        sa.Column("homepage", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=True),
        sa.Column("languages", sa.JSON(), nullable=True),
        sa.Column("topics", sa.JSON(), nullable=True),
        sa.Column("stars_count", sa.Integer(), nullable=True, default=0),
        sa.Column("forks_count", sa.Integer(), nullable=True, default=0),
        sa.Column("watchers_count", sa.Integer(), nullable=True, default=0),
        sa.Column("open_issues_count", sa.Integer(), nullable=True, default=0),
        sa.Column("size", sa.Integer(), nullable=True, default=0),
        sa.Column("default_branch", sa.String(), nullable=True, default="main"),
        sa.Column("is_private", sa.Boolean(), nullable=True, default=False),
        sa.Column("is_fork", sa.Boolean(), nullable=True, default=False),
        sa.Column("is_archived", sa.Boolean(), nullable=True, default=False),
        sa.Column("is_disabled", sa.Boolean(), nullable=True, default=False),
        sa.Column("has_issues", sa.Boolean(), nullable=True, default=True),
        sa.Column("has_projects", sa.Boolean(), nullable=True, default=True),
        sa.Column("has_wiki", sa.Boolean(), nullable=True, default=True),
        sa.Column("has_downloads", sa.Boolean(), nullable=True, default=True),
        sa.Column("license_name", sa.String(), nullable=True),
        sa.Column("license_key", sa.String(), nullable=True),
        sa.Column("github_created_at", sa.DateTime(), nullable=True),
        sa.Column("github_updated_at", sa.DateTime(), nullable=True),
        sa.Column("github_pushed_at", sa.DateTime(), nullable=True),
        sa.Column(
            "last_synced_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_repositories_id"), "repositories", ["id"], unique=False)
    op.create_index(
        op.f("ix_repositories_github_id"), "repositories", ["github_id"], unique=True
    )

    # Create readme_drafts table
    op.create_table(
        "readme_drafts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("repository_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("style", sa.String(), nullable=True, default="classic"),
        sa.Column("is_published", sa.Boolean(), nullable=True, default=False),
        sa.Column("version", sa.Integer(), nullable=True, default=1),
        sa.Column("draft_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["repository_id"],
            ["repositories.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_readme_drafts_id"), "readme_drafts", ["id"], unique=False)

    # Create generation_history table
    op.create_table(
        "generation_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("repository_id", sa.Integer(), nullable=True),
        sa.Column("repo_url", sa.String(), nullable=False),
        sa.Column("markdown_content", sa.Text(), nullable=False),
        sa.Column("style", sa.String(), nullable=True, default="classic"),
        sa.Column("generation_time_ms", sa.Integer(), nullable=True),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("model_used", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True, default="completed"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("generation_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "generated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["repository_id"],
            ["repositories.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_generation_history_id"), "generation_history", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_generation_history_repo_url"),
        "generation_history",
        ["repo_url"],
        unique=False,
    )

    # Create generated_readmes table (for backward compatibility)
    op.create_table(
        "generated_readmes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("repo_url", sa.String(), nullable=False),
        sa.Column("markdown_content", sa.Text(), nullable=False),
        sa.Column(
            "generated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("style", sa.String(), nullable=True, default="classic"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_generated_readmes_id"), "generated_readmes", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_generated_readmes_repo_url"),
        "generated_readmes",
        ["repo_url"],
        unique=False,
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("generated_readmes")
    op.drop_table("generation_history")
    op.drop_table("readme_drafts")
    op.drop_table("repositories")
    op.drop_table("user_settings")
    op.drop_table("users")
