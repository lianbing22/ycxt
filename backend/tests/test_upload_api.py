from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.app.dependencies import get_importer, get_storage
from backend.app.main import app
from backend.app.services.importer import Importer, SimpleAnalysis
from backend.app.storage import UploadStorage


@pytest.fixture()
def client(tmp_path):
    storage = UploadStorage(tmp_path)
    importer = Importer(storage, SimpleAnalysis())

    app.dependency_overrides[get_storage] = lambda: storage
    app.dependency_overrides[get_importer] = lambda: importer

    with TestClient(app) as test_client:
        yield test_client

    storage.reset()
    app.dependency_overrides.clear()


def test_upload_csv_and_history(client: TestClient):
    payload = "name,age\nAlice,31\nBob,28\n"
    response = client.post(
        "/uploads/",
        files={"file": ("sample.csv", payload, "text/csv")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["upload"]["filename"] == "sample.csv"
    assert body["job"]["record_count"] == 2

    history = client.get("/uploads/")
    assert history.status_code == 200
    items = history.json()
    assert len(items) == 1
    assert items[0]["record_count"] == 2
    assert items[0]["status"] == "completed"


def test_rejects_non_tabular_files(client: TestClient):
    response = client.post(
        "/uploads/",
        files={"file": ("script.js", "console.log('nope')", "text/plain")},
    )

    assert response.status_code == 400
    assert "CSV" in response.json()["detail"]
