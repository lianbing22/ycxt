"""Background scheduler utilities."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


_started = False


def start_scheduler() -> None:
    """Start the application's background scheduler if not already running."""
    global _started
    if _started:
        logger.debug("Scheduler already running; skipping startup")
        return

    logger.debug("Starting background scheduler (no-op placeholder)")
    _started = True
