from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.models.device import Device
from app.schemas.message import DeviceStatusResponse, MessageCreate, MessageResponse
from app.services.analysis import latest_prediction, process_message

router = APIRouter(prefix="/messages", tags=["messages"])


def get_db_session():
    with get_session() as session:
        yield session


@router.post("/", response_model=MessageResponse, status_code=201)
async def ingest_message(payload: MessageCreate, session: Session = Depends(get_db_session)):
    try:
        message = process_message(session, payload.device_name, payload.payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return message


@router.get("/status/{device_name}", response_model=DeviceStatusResponse)
async def device_status(device_name: str, session: Session = Depends(get_db_session)):
    device = session.query(Device).filter(Device.name == device_name).one_or_none()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    prediction = latest_prediction(session, device)
    return DeviceStatusResponse(
        device_name=device.name,
        status=device.status,
        last_seen=device.last_seen,
        prediction_score=prediction.score if prediction else None,
    )
