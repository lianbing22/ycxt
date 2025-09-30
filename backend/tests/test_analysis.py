from app.services.analysis import calculate_prediction_score, determine_device_status, parse_payload, process_message
from app.models.device import Device


def test_parse_payload_normalizes_missing_fields():
    parsed = parse_payload({"temperature": 75})
    assert parsed["temperature"] == 75.0
    assert parsed["voltage"] == 0.0
    assert parsed["current"] == 0.0
    assert parsed["status"] == "unknown"


def test_determine_device_status_thresholds():
    critical = determine_device_status({"temperature": 90, "voltage": 2.9, "current": 0, "status": "ok"})
    warning = determine_device_status({"temperature": 65, "voltage": 3.2, "current": 0, "status": "ok"})
    normal = determine_device_status({"temperature": 50, "voltage": 3.6, "current": 0, "status": "ok"})

    assert critical == "critical"
    assert warning == "warning"
    assert normal == "normal"


def test_process_message_persists(db_session_fixture):
    message = process_message(db_session_fixture, "device-1", {"temperature": 70, "voltage": 3.1, "current": 0.2})
    db_session_fixture.refresh(message.device)
    assert message.device.status == "warning"
    assert message.parsed_payload["temperature"] == 70.0


def test_calculate_prediction_score_increases_with_history(db_session_fixture):
    device = Device(name="device-history")
    db_session_fixture.add(device)
    db_session_fixture.commit()

    payload = {"temperature": 50, "voltage": 3.5, "current": 0.1}
    process_message(db_session_fixture, device.name, payload)
    db_session_fixture.refresh(device)
    first_score = calculate_prediction_score(device, payload)

    process_message(db_session_fixture, device.name, payload)
    db_session_fixture.refresh(device)
    second_score = calculate_prediction_score(device, payload)

    assert second_score >= first_score
