from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import asyncio

from ..db.database import get_db
from ..db.models import User, Repository
from ..services.github import github_service
from ..auth.dependencies import get_current_user, get_optional_current_user
from ..auth.crypto import decrypt_token

router = APIRouter(prefix="/search", tags=["Search & Autocomplete"])


@router.get("/repositories")
async def search_repositories_autocomplete(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results"),
    current_user: User = Depends(get_optional_current_user),
):
    """Search repositories with autocomplete suggestions."""

    # If user is authenticated, search their repositories first
    user_repos = []
    github_repos = []

    if current_user and current_user.access_token:
        # Search user's own repositories
        access_token = decrypt_token(current_user.access_token)

        try:
            # Search GitHub repositories
            github_results = await github_service.search_repositories(
                access_token=access_token,
                query=f"{q} user:{current_user.username}",
                sort="updated",
                per_page=min(limit, 20),
            )

            user_repos = [
                {
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description", ""),
                    "url": repo["html_url"],
                    "language": repo.get("language"),
                    "stars": repo["stargazers_count"],
                    "is_owner": True,
                    "updated_at": repo["updated_at"],
                }
                for repo in github_results.get("items", [])
            ]

            # Also search public repositories if we have room
            if len(user_repos) < limit:
                remaining = limit - len(user_repos)
                public_results = await github_service.search_repositories(
                    access_token=access_token, query=q, sort="stars", per_page=remaining
                )

                github_repos = [
                    {
                        "id": repo["id"],
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "description": repo.get("description", ""),
                        "url": repo["html_url"],
                        "language": repo.get("language"),
                        "stars": repo["stargazers_count"],
                        "is_owner": False,
                        "updated_at": repo["updated_at"],
                    }
                    for repo in public_results.get("items", [])
                    if repo["id"] not in [r["id"] for r in user_repos]
                ]
        except Exception:
            # Fall back to public search only
            pass

    # Combine results
    all_repos = user_repos + github_repos

    return {
        "query": q,
        "results": all_repos[:limit],
        "total": len(all_repos),
        "suggestions": [repo["full_name"] for repo in all_repos[:5]],
    }


@router.get("/languages")
async def search_languages(
    q: str = Query(..., min_length=1, description="Language search query"),
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Search and autocomplete programming languages."""

    # Common programming languages
    common_languages = [
        "JavaScript",
        "Python",
        "TypeScript",
        "Java",
        "C++",
        "C#",
        "PHP",
        "Ruby",
        "Go",
        "Rust",
        "Swift",
        "Kotlin",
        "Dart",
        "Scala",
        "R",
        "MATLAB",
        "Shell",
        "PowerShell",
        "HTML",
        "CSS",
        "SQL",
        "Dockerfile",
        "YAML",
        "JSON",
        "Markdown",
        "Vue",
        "React",
        "Angular",
        "Node.js",
    ]

    # Filter languages by query
    matching_languages = [
        lang for lang in common_languages if q.lower() in lang.lower()
    ]

    # If user is authenticated, also get languages from their repositories
    user_languages = []
    if current_user:
        user_repo_languages = (
            db.query(Repository.language)
            .filter(
                Repository.owner_id == current_user.id, Repository.language.isnot(None)
            )
            .distinct()
            .all()
        )

        user_languages = [
            lang[0]
            for lang in user_repo_languages
            if lang[0] and q.lower() in lang[0].lower()
        ]

    # Combine and deduplicate
    all_languages = list(set(user_languages + matching_languages))
    all_languages.sort()

    return {
        "query": q,
        "languages": all_languages[:20],
        "user_languages": user_languages,
        "suggestions": all_languages[:5],
    }


@router.get("/users")
async def search_users(
    q: str = Query(..., min_length=1, description="Username search query"),
    limit: int = Query(10, ge=1, le=20, description="Number of results"),
    current_user: User = Depends(get_optional_current_user),
):
    """Search GitHub users for collaboration."""

    if not current_user or not current_user.access_token:
        return {"query": q, "users": [], "message": "Authentication required"}

    access_token = decrypt_token(current_user.access_token)

    try:
        # Search GitHub users
        import httpx

        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/search/users",
                headers=headers,
                params={"q": q, "per_page": limit},
            )

            if response.status_code == 200:
                data = response.json()
                users = [
                    {
                        "id": user["id"],
                        "login": user["login"],
                        "avatar_url": user["avatar_url"],
                        "url": user["html_url"],
                        "type": user["type"],
                    }
                    for user in data.get("items", [])
                ]

                return {"query": q, "users": users, "total": data.get("total_count", 0)}
    except Exception:
        pass

    return {"query": q, "users": [], "error": "Search failed"}


@router.get("/suggestions")
async def get_search_suggestions(
    type: str = Query(
        "repository", description="Type of suggestions: repository, language, user"
    ),
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Get popular search suggestions."""

    if type == "repository":
        suggestions = [
            "tensorflow/tensorflow",
            "microsoft/vscode",
            "facebook/react",
            "vuejs/vue",
            "angular/angular",
            "nodejs/node",
            "python/cpython",
            "golang/go",
        ]

        # Add user's recent repositories if authenticated
        if current_user:
            recent_repos = (
                db.query(Repository)
                .filter(Repository.owner_id == current_user.id)
                .order_by(Repository.github_updated_at.desc())
                .limit(5)
                .all()
            )

            user_suggestions = [repo.full_name for repo in recent_repos]
            suggestions = user_suggestions + suggestions

    elif type == "language":
        suggestions = [
            "JavaScript",
            "Python",
            "TypeScript",
            "Java",
            "C++",
            "C#",
            "PHP",
            "Ruby",
            "Go",
            "Rust",
        ]

        # Add user's most used languages
        if current_user:
            user_languages = (
                db.query(Repository.language)
                .filter(
                    Repository.owner_id == current_user.id,
                    Repository.language.isnot(None),
                )
                .distinct()
                .limit(5)
                .all()
            )

            user_langs = [lang[0] for lang in user_languages if lang[0]]
            suggestions = user_langs + suggestions

    else:
        suggestions = []

    return {
        "type": type,
        "suggestions": list(dict.fromkeys(suggestions))[
            :10
        ],  # Remove duplicates, keep order
    }
