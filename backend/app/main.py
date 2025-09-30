"""FastAPI application entry point."""
from __future__ import annotations

from dataclasses import dataclass
from importlib import import_module, util
from typing import Any, Callable, Iterable

from fastapi import APIRouter, FastAPI


@dataclass(frozen=True)
class _FallbackSettings:
    app_name: str = "YCXT Upload Service"


def _load_attribute(module_name: str, attribute: str, default: Any) -> Any:
    spec = util.find_spec(module_name)
    if spec is None:
        return default
    module = import_module(module_name)
    return getattr(module, attribute, default)


def _noop() -> None:
    return None


def _router_has_names(router: APIRouter, names: Iterable[str]) -> bool:
    existing = {getattr(route, "name", "") for route in getattr(router, "routes", [])}
    return set(names).issubset(existing)


settings = _load_attribute("app.core.config", "settings", _FallbackSettings())
create_all: Callable[[], None] = _load_attribute("app.db.session", "create_all", _noop)
start_scheduler: Callable[[], None] = _load_attribute("app.tasks.scheduler", "start_scheduler", _noop)
api_router: APIRouter = _load_attribute("app.api.router", "api_router", APIRouter())
upload_router: APIRouter = _load_attribute("app.api.upload", "router", APIRouter())

if getattr(upload_router, "routes", None):
    names = [getattr(route, "name", "") for route in upload_router.routes]
    if not _router_has_names(api_router, names):
        api_router.include_router(upload_router)

create_all()

app = FastAPI(title=settings.app_name)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    """Start background services once the application is ready."""
    start_scheduler()


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Basic endpoint for uptime monitoring."""
    return {"status": "ok"}
