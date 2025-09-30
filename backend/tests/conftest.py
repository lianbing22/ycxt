from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.main import app
from app.db import session as db_session
from app.db.base import Base
from app.tasks.scheduler import shutdown_scheduler


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    original_engine = db_session.engine
    original_session_local = db_session.SessionLocal

    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False, expire_on_commit=False)

    db_session.engine = test_engine
    db_session.SessionLocal = TestingSessionLocal

    Base.metadata.create_all(bind=test_engine)

    yield

    shutdown_scheduler()
    Base.metadata.drop_all(bind=test_engine)
    db_session.SessionLocal = original_session_local
    db_session.engine = original_engine


@pytest.fixture()
def db_session_fixture() -> Generator[Session, None, None]:
    session: Session = db_session.SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
