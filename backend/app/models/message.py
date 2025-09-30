from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    raw_payload: Mapped[str] = mapped_column(String, nullable=False)
    parsed_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    device: Mapped["Device"] = relationship("Device", back_populates="messages")

    def __repr__(self) -> str:  # pragma: no cover - repr simple
        return f"Message(id={self.id!r}, device_id={self.device_id!r}, status={self.status!r})"


from app.models.device import Device  # noqa: E402  circular import
