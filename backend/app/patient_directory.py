from __future__ import annotations

import os
import re
from functools import lru_cache
from typing import Any

try:
    from pymongo import MongoClient
    from pymongo.collection import Collection
except Exception:  # pragma: no cover - optional dependency for local/dev fallback
    MongoClient = None
    Collection = Any  # type: ignore[assignment]


DEMO_PATIENTS: list[dict[str, Any]] = [
    {
        "phone_number": "9876501234",
        "patient_name": "Asha Raman",
        "patient_age": 34,
        "patient_sex": "female",
        "height_cm": 162,
        "weight_kg": 68,
    },
    {
        "phone_number": "9123456789",
        "patient_name": "Vikram Nair",
        "patient_age": 52,
        "patient_sex": "male",
        "height_cm": 174,
        "weight_kg": 82,
    },
    {
        "phone_number": "9012345678",
        "patient_name": "Latha Prasad",
        "patient_age": 46,
        "patient_sex": "female",
        "height_cm": 158,
        "weight_kg": 71,
    },
]


PHONE_PATTERN = re.compile(r"(?:\+?91[\s-]*)?([6-9](?:[\s-]*\d){9})\b")


def normalize_phone_number(raw_value: str) -> str | None:
    match = PHONE_PATTERN.search(raw_value.strip())
    if not match:
        return None
    digits = re.sub(r"\D", "", match.group(1))
    return digits if len(digits) == 10 else None


def mongo_enabled() -> bool:
    return bool(os.getenv("MONGODB_URI", "").strip()) and MongoClient is not None


@lru_cache(maxsize=1)
def mongo_collection() -> Collection | None:
    uri = os.getenv("MONGODB_URI", "").strip()
    if not uri or MongoClient is None:
        return None

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=1000)
        client.admin.command("ping")
        database = client[os.getenv("MONGODB_DB_NAME", "valli_ai")]
        collection = database[os.getenv("MONGODB_PATIENT_COLLECTION", "patient_directory")]
        collection.create_index("phone_number", unique=True)

        for record in DEMO_PATIENTS:
            collection.update_one(
                {"phone_number": record["phone_number"]},
                {"$setOnInsert": record},
                upsert=True,
            )

        return collection
    except Exception:
        return None


def patient_record_for_phone(phone_number: str) -> dict[str, Any] | None:
    collection = mongo_collection()
    if collection is not None:
        document = collection.find_one({"phone_number": phone_number}, {"_id": 0})
        if document:
            return dict(document)

    for record in DEMO_PATIENTS:
        if record["phone_number"] == phone_number:
            return dict(record)
    return None
