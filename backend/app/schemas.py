from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class TranscriptEntry(BaseModel):
    speaker: str
    message: str
    timestamp: datetime
    question_id: str | None = None


class QuestionOptionPayload(BaseModel):
    value: str
    label: str


class QuestionPayload(BaseModel):
    id: str
    field: str
    text: str
    prompt_text: str
    section: str
    input_type: str
    placeholder: str | None = None
    options: list[QuestionOptionPayload] = Field(default_factory=list)
    helper_text: str | None = None
    optional: bool = False


class SessionCreateRequest(BaseModel):
    consent_for_ai: bool = True


class AnswerRequest(BaseModel):
    answer_text: str = Field(min_length=1)


class VisionAirwayCaptureRequest(BaseModel):
    capture_type: Literal["frontal", "profile"] = "frontal"
    image_data_url: str = Field(min_length=32)
    consent_for_image_analysis: bool = True


class SessionSnapshot(BaseModel):
    session_id: str
    status: str
    current_question: QuestionPayload | None = None
    progress_completed: int
    progress_total: int
    transcript: list[TranscriptEntry]
    answers: dict[str, Any]
    risk_snapshot: dict[str, Any]


class DashboardItem(BaseModel):
    session_id: str
    patient_name: str | None = None
    proposed_procedure: str | None = None
    updated_at: datetime
    consolidated_risk: str | None = None
    asa_class: str | None = None
    status: str


class SessionReport(BaseModel):
    session_id: str
    status: str
    patient_summary: dict[str, Any]
    answers: dict[str, Any]
    transcript: list[TranscriptEntry]
    risk_assessment: dict[str, Any]
    created_at: datetime
    updated_at: datetime
