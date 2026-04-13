from __future__ import annotations

import os
import sys
from pathlib import Path


APP_FOLDER_NAME = "ValliPreAnestheticAssessment"


def source_root() -> Path:
    return Path(__file__).resolve().parents[1]


def resource_root() -> Path:
    if getattr(sys, "frozen", False):
        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            return Path(meipass)
    repo_root = Path(__file__).resolve().parents[2]
    if (repo_root / "frontend").exists() or (repo_root / "docs").exists():
        return repo_root
    return source_root()


def writable_root() -> Path:
    override = os.getenv("PREANESTHETIC_DATA_DIR")
    if override:
        path = Path(override)
    elif getattr(sys, "frozen", False):
        local_app_data = os.getenv("LOCALAPPDATA")
        base_path = Path(local_app_data) if local_app_data else Path.home() / "AppData" / "Local"
        path = base_path / APP_FOLDER_NAME
    else:
        path = resource_root()

    path.mkdir(parents=True, exist_ok=True)
    return path


def data_dir() -> Path:
    path = writable_root() / "data"
    path.mkdir(parents=True, exist_ok=True)
    return path


def docs_dir() -> Path:
    return resource_root() / "docs"


def packaged_frontend_dir() -> Path:
    return resource_root() / "frontend" / "dist"


def writable_policy_doc_path() -> Path:
    return writable_root() / "hospital_policy.md"


def packaged_policy_doc_path() -> Path:
    return docs_dir() / "hospital_policy.md"
