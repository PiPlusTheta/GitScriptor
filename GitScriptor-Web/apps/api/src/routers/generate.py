import re
import subprocess
import tempfile
import time
import uuid
import os
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from pydantic import BaseModel, validator  # type: ignore
from ..services.gitscriptor_core import generate_readme

from ..db.database import get_db
from ..db.models import User, Repository, GenerationHistory
from ..schemas.readme import ReadmeGenerateRequest, ReadmeGenerateResponse
from ..auth.dependencies import get_optional_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/generate")


@router.post("/", response_model=ReadmeGenerateResponse)
async def generate_readme_endpoint(
    request: ReadmeGenerateRequest,
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Generate README from repository URL."""
    start_time = time.time()

    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            # Clone repository
            result = subprocess.run(
                ["git", "clone", "--depth", "1", request.repo_url, tmp_dir],
                capture_output=True,
                text=True,
                timeout=60,
            )
            if result.returncode != 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to clone repository: {result.stderr}",
                )

            # Generate README
            markdown = generate_readme(tmp_dir)
            elapsed_ms = int((time.time() - start_time) * 1000)

            # Count words and identify sections
            word_count = len(markdown.split())
            sections_generated = []

            # Simple section detection
            section_markers = ["# ", "## ", "### "]
            lines = markdown.split("\n")
            for line in lines:
                if any(line.startswith(marker) for marker in section_markers):
                    section_name = line.strip("#").strip().lower()
                    if section_name not in sections_generated:
                        sections_generated.append(section_name)

            # Initialize repository as None for guest users
            repository = None

            # Save to history if user is authenticated
            if current_user:
                # Try to find matching repository
                repo_url_clean = request.repo_url.rstrip("/").rstrip(".git")
                repository = (
                    db.query(Repository)
                    .filter(Repository.url == repo_url_clean)
                    .first()
                )

                # Create history entry
                history_entry = GenerationHistory(
                    user_id=current_user.id,
                    repository_id=repository.id if repository else None,
                    repo_url=request.repo_url,
                    markdown_content=markdown,
                    style=request.style,
                    generation_time_ms=elapsed_ms,
                    status="completed",
                    model_used="gitscriptor_core",  # Update based on actual model used
                )
                db.add(history_entry)
                db.commit()

            # Build repository metadata
            repository_metadata = None
            if repository:
                repository_metadata = {
                    "id": repository.id,
                    "name": repository.name,
                    "full_name": repository.full_name,
                    "description": repository.description,
                    "language": repository.language,
                    "stars_count": repository.stars_count,
                    "forks_count": repository.forks_count,
                }

            return ReadmeGenerateResponse(
                success=True,
                markdown=markdown,
                elapsed_ms=elapsed_ms,
                style=request.style,
                template_used=request.template_id or request.style,
                sections_generated=sections_generated,
                word_count=word_count,
                repository=repository_metadata,
                metadata={
                    "repo_url": request.repo_url,
                    "generated_at": time.time(),
                    "user_authenticated": current_user is not None,
                    "ai_model": request.ai_model or "default",
                },
                generation_id=f"gen_{int(time.time())}_{current_user.id if current_user else 'anon'}",
            )

        except subprocess.TimeoutExpired:
            # Save failed generation to history
            if current_user:
                history_entry = GenerationHistory(
                    user_id=current_user.id,
                    repo_url=request.repo_url,
                    markdown_content="",
                    style=request.style,
                    status="failed",
                    error_message="Repository clone timeout",
                )
                db.add(history_entry)
                db.commit()

            raise HTTPException(status_code=408, detail="Repository clone timeout")
        except Exception as e:
            # Save failed generation to history
            if current_user:
                history_entry = GenerationHistory(
                    user_id=current_user.id,
                    repo_url=request.repo_url,
                    markdown_content="",
                    style=request.style,
                    status="failed",
                    error_message=str(e),
                )
                db.add(history_entry)
                db.commit()

            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/test", response_model=ReadmeGenerateResponse)
async def test_generate_readme(
    request: ReadmeGenerateRequest,
    db: Session = Depends(get_db),
):
    """Test README generation without authentication (development only)."""
    if os.getenv("ENVIRONMENT") != "development":
        raise HTTPException(status_code=404, detail="Not found")

    start_time = time.time()

    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            # Generate README content
            readme_content = generate_readme(
                request.repo_url,
                style=request.style,
            )

            generation_time_ms = int((time.time() - start_time) * 1000)

            return ReadmeGenerateResponse(
                success=True,
                content=readme_content,
                style=request.style,
                generation_time_ms=generation_time_ms,
                repo_analysis={
                    "repo_url": request.repo_url,
                    "detected_languages": [],
                    "detected_frameworks": [],
                    "has_tests": False,
                    "has_docs": False,
                    "lines_of_code": 0,
                },
            )

        except Exception as e:
            generation_time_ms = int((time.time() - start_time) * 1000)
            logger.error(f"README generation failed: {e}")
            raise HTTPException(
                status_code=500, detail=f"README generation failed: {str(e)}"
            )
