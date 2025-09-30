"""FastAPI application entry point."""
from __future__ import annotations

from fastapi import FastAPI

from .api import upload

app = FastAPI(title="YCXT Upload Service")
app.include_router(upload.router)
