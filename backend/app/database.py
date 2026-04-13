import os
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from .runtime_paths import data_dir


DATA_DIR = data_dir()
DATABASE_URL = os.getenv("PREANESTHETIC_DB_URL", f"sqlite:///{DATA_DIR / 'preanesthetic_assessment.db'}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
