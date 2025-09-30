"""Database session and initialization utilities."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def create_all() -> None:
    """Initialize database structures if required.

    The real implementation is expected to create database tables or run
    migrations.  For the purposes of the upload feature tests we only log the
    call so the surrounding application behaves as expected without an actual
    database.
    """

    logger.debug("create_all called (no-op in test environment)")
