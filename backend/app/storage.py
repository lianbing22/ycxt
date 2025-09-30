"""Storage utilities for managing uploaded files."""
from __future__ import annotations

import asyncio
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import UploadFile


ALLOWED_EXTENSIONS = {".csv", ".xls", ".xlsx"}


@dataclass
class UploadMetadata:
    """Represents the state of a stored upload."""

    id: str
    filename: str
    stored_path: str
    content_type: str
    size: int
    created_at: datetime
    status: str = "pending"
    record_count: int = 0
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, object]:
        payload = asdict(self)
        payload["created_at"] = self.created_at.isoformat()
        return payload


class UploadStorage:
    """Persists upload payloads to the filesystem and tracks metadata."""

    def __init__(self, base_dir: Path) -> None:
        self._base_dir = base_dir
        self._base_dir.mkdir(parents=True, exist_ok=True)
        self._records: Dict[str, UploadMetadata] = {}

    async def save(self, upload_file: UploadFile) -> UploadMetadata:
        """Persist an incoming FastAPI :class:`UploadFile`."""

        filename = upload_file.filename or "uploaded"
        extension = Path(filename).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise ValueError("Only CSV and Excel files are accepted")

        data = await upload_file.read()
        if not data:
            raise ValueError("The uploaded file is empty")

        file_id = uuid4().hex
        stored_name = f"{file_id}{extension}"
        stored_path = self._base_dir / stored_name
        await asyncio.to_thread(stored_path.write_bytes, data)

        metadata = UploadMetadata(
            id=file_id,
            filename=filename,
            stored_path=str(stored_path),
            content_type=upload_file.content_type or "application/octet-stream",
            size=len(data),
            created_at=datetime.utcnow(),
        )
        self._records[file_id] = metadata
        return metadata

    def list(self) -> List[UploadMetadata]:
        return sorted(self._records.values(), key=lambda item: item.created_at, reverse=True)

    def get(self, upload_id: str) -> UploadMetadata:
        try:
            return self._records[upload_id]
        except KeyError as exc:
            raise KeyError(f"Unknown upload id: {upload_id}") from exc

    def update(self, upload: UploadMetadata) -> None:
        self._records[upload.id] = upload

    def reset(self) -> None:
        for metadata in list(self._records.values()):
            try:
                Path(metadata.stored_path).unlink(missing_ok=True)
            except OSError:
                pass
        self._records.clear()


def create_default_storage() -> UploadStorage:
    base_dir = Path("backend/data/uploads")
    base_dir.mkdir(parents=True, exist_ok=True)
    return UploadStorage(base_dir)
