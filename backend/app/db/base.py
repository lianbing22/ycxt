from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


def init_db() -> None:
    """Import models for SQLAlchemy metadata registration."""
    # Import models to register with the metadata
    from app.models import device, message, prediction  # noqa: F401

