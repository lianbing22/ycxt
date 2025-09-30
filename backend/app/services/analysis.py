from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.message import Message
from app.models.prediction import Prediction


def parse_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Normalize incoming payload ensuring expected keys exist."""
    normalized = {
        "temperature": float(payload.get("temperature", 0.0)),
        "voltage": float(payload.get("voltage", 0.0)),
        "current": float(payload.get("current", 0.0)),
        "status": payload.get("status", "unknown"),
    }
    return normalized


def determine_device_status(parsed_payload: dict[str, Any]) -> str:
    temperature = parsed_payload["temperature"]
    voltage = parsed_payload["voltage"]

    if temperature > 80 or voltage < 3.0:
        return "critical"
    if temperature > 60 or voltage < 3.3:
        return "warning"
    return "normal"


def calculate_prediction_score(device: Device, parsed_payload: dict[str, Any]) -> float:
    """A naive scoring algorithm to estimate failure likelihood."""
    base = 0.2
    temp_factor = min(parsed_payload["temperature"] / 100, 1.0)
    voltage_factor = 1 - min(parsed_payload["voltage"] / 5, 1.0)
    history_factor = 0.1 * len(device.messages)
    return min(base + temp_factor + voltage_factor + history_factor, 1.0)


def process_message(session: Session, device_name: str, payload: dict[str, Any]) -> Message:
    parsed_payload = parse_payload(payload)

    device = session.query(Device).filter(Device.name == device_name).one_or_none()
    if device is None:
        device = Device(name=device_name)
        session.add(device)
        session.flush()

    status = determine_device_status(parsed_payload)
    device.status = status
    device.last_seen = datetime.utcnow()

    message = Message(
        device_id=device.id,
        raw_payload=str(payload),
        parsed_payload=parsed_payload,
        status=status,
    )
    session.add(message)

    prediction_score = calculate_prediction_score(device, parsed_payload)
    prediction = Prediction(device_id=device.id, score=prediction_score)
    session.add(prediction)

    session.commit()
    session.refresh(message)
    return message


def latest_prediction(session: Session, device: Device) -> Prediction | None:
    return (
        session.query(Prediction)
        .filter(Prediction.device_id == device.id)
        .order_by(Prediction.created_at.desc())
        .first()
    )


def refresh_device_states(session: Session) -> None:
    """Re-evaluate device states from their most recent messages."""
    devices = session.query(Device).all()
    for device in devices:
        last_message = (
            session.query(Message)
            .filter(Message.device_id == device.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        if last_message and last_message.parsed_payload:
            device.status = determine_device_status(last_message.parsed_payload)
            device.last_seen = last_message.created_at
            prediction = Prediction(
                device_id=device.id,
                score=calculate_prediction_score(device, last_message.parsed_payload),
            )
            session.add(prediction)
    session.commit()
