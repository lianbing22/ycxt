"""Application API router aggregation."""
from __future__ import annotations

from fastapi import APIRouter

from . import upload

api_router = APIRouter()
api_router.include_router(upload.router)
