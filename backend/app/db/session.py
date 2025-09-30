from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base, init_db

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def create_all() -> None:
    init_db()
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_session() -> Session:
    session: Session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
