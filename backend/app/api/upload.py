"""Upload related API endpoints."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..dependencies import get_importer, get_storage
from ..services.importer import Importer
from ..storage import UploadMetadata, UploadStorage

router = APIRouter(prefix="/uploads", tags=["uploads"])


async def _store_file(storage: UploadStorage, file: UploadFile) -> UploadMetadata:
    try:
        return await storage.save(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    storage: UploadStorage = Depends(get_storage),
    importer: Importer = Depends(get_importer),
) -> dict:
    metadata = await _store_file(storage, file)
    job = importer.enqueue(metadata)
    return {"upload": metadata.to_dict(), "job": job.to_dict()}


@router.get("/", response_model=List[dict])
async def list_uploads(storage: UploadStorage = Depends(get_storage)) -> List[dict]:
    return [item.to_dict() for item in storage.list()]


@router.get("/{upload_id}")
async def get_upload(upload_id: str, storage: UploadStorage = Depends(get_storage)) -> dict:
    try:
        upload = storage.get(upload_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return upload.to_dict()
