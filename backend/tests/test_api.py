
def test_ingest_and_status(client):
    response = client.post(
        "/messages/",
        json={"device_name": "alpha", "payload": {"temperature": 72, "voltage": 3.0, "current": 0.4}},
    )
    assert response.status_code == 201
    message = response.json()
    assert message["status"] == "critical"

    status_response = client.get("/messages/status/alpha")
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["status"] == "critical"
    assert status_payload["prediction_score"] is not None


def test_status_not_found(client):
    response = client.get("/messages/status/unknown")
    assert response.status_code == 404
