"""Runtime configuration for the FastAPI application."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Container for environment driven configuration values."""

    app_name: str = os.getenv("APP_NAME", "YCXT Upload Service")


settings = Settings()
