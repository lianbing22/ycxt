from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.db.session import create_all
from app.tasks.scheduler import start_scheduler

create_all()

app = FastAPI(title=settings.app_name)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    start_scheduler()


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
