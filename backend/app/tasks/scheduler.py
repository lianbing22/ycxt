from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.db.session import get_session
from app.services.analysis import refresh_device_states

_scheduler: BackgroundScheduler | None = None


def _refresh_job() -> None:
    with get_session() as session:
        refresh_device_states(session)


def start_scheduler() -> None:
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return

    scheduler = BackgroundScheduler()
    scheduler.add_job(_refresh_job, "interval", seconds=settings.scheduler_interval_seconds, id="refresh-job", replace_existing=True)
    scheduler.start()
    _scheduler = scheduler


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown()
        _scheduler = None
