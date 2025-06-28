from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health")


class HealthResponse(BaseModel):
    ok: bool


@router.get("/", response_model=HealthResponse)
async def health_check():
    return HealthResponse(ok=True)
