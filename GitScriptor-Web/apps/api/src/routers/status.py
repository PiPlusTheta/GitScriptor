from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Dict, Any
import psutil
import os
from datetime import datetime

from ..db.database import get_db
from ..db.models import User, Repository, GenerationHistory

router = APIRouter(tags=["Health & Status"])


class APIStatus(BaseModel):
    status: str
    version: str
    environment: str
    uptime: str
    database: Dict[str, Any]
    system: Dict[str, Any]
    statistics: Dict[str, Any]


@router.get("/status", response_model=APIStatus)
async def get_api_status(db: Session = Depends(get_db)):
    """Get comprehensive API status and statistics."""

    # Database statistics
    try:
        total_users = db.query(User).count()
        total_repositories = db.query(Repository).count()
        total_generations = db.query(GenerationHistory).count()

        # Recent activity (last 24 hours)
        from datetime import timedelta

        yesterday = datetime.now() - timedelta(days=1)
        recent_generations = (
            db.query(GenerationHistory)
            .filter(GenerationHistory.generated_at >= yesterday)
            .count()
        )

        database_status = {
            "connected": True,
            "total_users": total_users,
            "total_repositories": total_repositories,
            "total_generations": total_generations,
            "recent_generations_24h": recent_generations,
        }
    except Exception as e:
        database_status = {"connected": False, "error": str(e)}

    # System information
    import sys
    import platform

    system_info = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": (
            psutil.disk_usage("/").percent
            if os.name != "nt"
            else psutil.disk_usage("C:").percent
        ),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "platform": platform.system(),
    }

    # Generation statistics
    try:
        generation_stats = db.query(
            func.count(GenerationHistory.id).label("total"),
            func.count(func.nullif(GenerationHistory.status, "completed")).label(
                "failed"
            ),
            func.avg(GenerationHistory.generation_time_ms).label("avg_time"),
        ).first()

        statistics = {
            "total_generations": generation_stats.total if generation_stats else 0,
            "failed_generations": generation_stats.failed if generation_stats else 0,
            "success_rate": round(
                (
                    (
                        (generation_stats.total - generation_stats.failed)
                        / generation_stats.total
                        * 100
                    )
                    if generation_stats and generation_stats.total > 0
                    else 100
                ),
                2,
            ),
            "average_generation_time_ms": (
                round(generation_stats.avg_time, 2)
                if generation_stats and generation_stats.avg_time
                else 0
            ),
        }
    except Exception:
        statistics = {
            "total_generations": 0,
            "failed_generations": 0,
            "success_rate": 100,
            "average_generation_time_ms": 0,
        }

    return APIStatus(
        status="healthy",
        version="1.0.0",
        environment=os.getenv("ENVIRONMENT", "development"),
        uptime="Unknown",  # In production, you'd track actual uptime
        database=database_status,
        system=system_info,
        statistics=statistics,
    )
