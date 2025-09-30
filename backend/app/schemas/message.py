from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    device_name: str = Field(..., description="Unique name of the device")
    payload: dict[str, Any]


class MessageResponse(BaseModel):
    id: int
    device_id: int
    status: str
    parsed_payload: dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True


class DeviceStatusResponse(BaseModel):
    device_name: str
    status: str
    last_seen: datetime | None
    prediction_score: float | None = None
