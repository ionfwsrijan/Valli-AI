from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from .conversation_router import classify_input
from .database import create_db_and_tables, get_session
from .llm_service import generate_empathetic_question, speech_media_type, synthesize_speech_audio
from .models import AssessmentSession
from .patient_directory import patient_record_for_phone
from .policy_rag import retrieve_policy_answer, should_hide_policy_sources
from .questionnaire import (
    QUESTION_MAP,
    apply_parsed_answer,
    format_question_prompt,
    invalid_answer_message,
    is_question_complete,
    next_question,
    question_to_payload,
    render_question_text,
    visible_questions,
)
from .risk_engine import compute_risk_profile
from .schemas import (
    AnswerRequest,
    DashboardItem,
    QuestionPayload,
    SessionCreateRequest,
    SessionReport,
    SessionSnapshot,
    TranscriptEntry,
    VoiceSynthesisRequest,
    VisionAirwayCaptureRequest,
)
from .runtime_paths import packaged_frontend_dir
from .vision_airway import analyze_airway_photo, has_required_exam_captures


BOT_GREETING = "Hello! I am Valli. You may use text or voice for taking the assessment."
ANSWER_CONFIRMATION = "Got it, thank you."
CAMERA_EXAM_PROMPT = (
    "The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment."
)
PHONE_LOOKUP_CONFIRMATION = "I found the patient's basic details from that phone number and filled them in."
PHONE_LOOKUP_NOT_FOUND = "You're not an existing patient in the demo directory. Please enter a registered 10-digit number."

LANGUAGE_NAME_MAP = {
    "en": "English",
    "ta": "Tamil",
    "hi": "Hindi",
    "te": "Telugu",
    "ml": "Malayalam",
    "kn": "Kannada",
}


def cors_allowed_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    origins = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
    return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


def cors_allowed_origin_regex() -> str | None:
    raw_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip()
    return raw_regex or None


create_db_and_tables()

app = FastAPI(
    title="Pre-Anesthetic Assessment API",
    version="1.0.0",
    description="Voice-first conversational pre-anesthetic assessment with verbatim transcript capture.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allowed_origins(),
    allow_origin_regex=cors_allowed_origin_regex(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIST_DIR = packaged_frontend_dir()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def decode_answers(db_session: AssessmentSession) -> dict[str, Any]:
    return json.loads(db_session.answers_json or "{}")


def decode_transcript(db_session: AssessmentSession) -> list[dict[str, Any]]:
    return json.loads(db_session.transcript_json or "[]")


def decode_risk(db_session: AssessmentSession) -> dict[str, Any]:
    return json.loads(db_session.risk_json or "{}")


def encode_and_store(
    db_session: AssessmentSession,
    *,
    answers: dict[str, Any],
    transcript: list[dict[str, Any]],
    risk: dict[str, Any],
) -> None:
    db_session.answers_json = json.dumps(answers)
    db_session.transcript_json = json.dumps(transcript, default=str)
    db_session.risk_json = json.dumps(risk)
    db_session.updated_at = utc_now()


def transcript_entry(speaker: str, message: str, question_id: str | None = None) -> dict[str, Any]:
    return {
        "speaker": speaker,
        "message": message,
        "timestamp": utc_now().isoformat(),
        "question_id": question_id,
    }


def normalize_transcript_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for entry in entries:
        if entry.get("speaker") == "ai":
            question_id = entry.get("question_id")
            if isinstance(question_id, str) and question_id in QUESTION_MAP:
                question = QUESTION_MAP[question_id]
                if entry.get("message") == question.text:
                    normalized.append({**entry, "message": format_question_prompt(question)})
                    continue
        normalized.append(entry)
    return normalized


def build_snapshot(db_session: AssessmentSession) -> SessionSnapshot:
    answers = decode_answers(db_session)
    transcript_entries = decode_transcript(db_session)
    transcript_raw = normalize_transcript_entries(transcript_entries)
    risk = decode_risk(db_session)
    current_question = QUESTION_MAP.get(db_session.current_question_id) if db_session.current_question_id else None
    current_payload = None

    if current_question:
        payload_dict = question_to_payload(current_question, answers)
        for entry in reversed(transcript_entries):
            if entry.get("speaker") == "ai" and entry.get("question_id") == current_question.id:
                ai_question_text = entry.get("message")
                prompt_parts = [ai_question_text]
                if current_question.helper_text:
                    prompt_parts.append(current_question.helper_text.strip())
                if current_question.options:
                    prompt_parts.extend(option.label.strip() for option in current_question.options)
                payload_dict["text"] = render_question_text(current_question, answers)
                payload_dict["prompt_text"] = "\n".join(part for part in prompt_parts if part)
                break
        current_payload = QuestionPayload.model_validate(payload_dict)

    visible = visible_questions(answers)
    answered_ids = {key for key in answers.keys() if key in QUESTION_MAP}
    completed = len([question for question in visible if question.id in answered_ids])

    return SessionSnapshot(
        session_id=db_session.id,
        status=db_session.status,
        current_question=current_payload,
        progress_completed=completed,
        progress_total=max(len(visible), completed),
        transcript=[TranscriptEntry.model_validate(entry) for entry in transcript_raw],
        answers=answers,
        risk_snapshot=risk,
    )


def format_vision_transcript_messages(vision_assessment: dict[str, Any], capture_type: str) -> list[str]:
    capture_title = "Frontal view" if capture_type == "frontal" else "Side-profile view"
    captures = vision_assessment.get("captures")
    capture = captures.get(capture_type) if isinstance(captures, dict) else None
    if not isinstance(capture, dict):
        return [f"{capture_title} camera assessment was recorded. Detailed measurements are available in the final report."]

    messages: list[str] = []
    summary = capture.get("summary")
    if isinstance(summary, str) and summary:
        messages.append(f"{capture_title} camera result: {summary} Detailed measurements are available in the final report.")

    return messages or [f"{capture_title} camera assessment was recorded. Detailed measurements are available in the final report."]


def should_add_answer_confirmation(routing: dict[str, Any], completed_current_question: bool) -> bool:
    return (
        completed_current_question
        and routing["mode"] == "answer_only"
        and routing.get("answer_text") is not None
        and not routing.get("policy_question")
        and not routing.get("interjection_message")
    )


def apply_phone_demographics(answers: dict[str, Any], patient_record: dict[str, Any]) -> None:
    answers["patient_name"] = patient_record.get("patient_name")
    answers["patient_age"] = patient_record.get("patient_age")
    answers["patient_sex"] = patient_record.get("patient_sex")
    answers["height_cm"] = patient_record.get("height_cm")
    answers["weight_kg"] = patient_record.get("weight_kg")
    answers["demographics_prefilled_from_phone"] = True


def get_assessment_or_404(session_id: str, db: Session) -> AssessmentSession:
    assessment = db.get(AssessmentSession, session_id)
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment session not found.")
    return assessment


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/voice/speak")
def speak_text(payload: VoiceSynthesisRequest) -> Response:
    language_code = (payload.language or "en").strip().lower()
    full_language = LANGUAGE_NAME_MAP.get(language_code, "English")
    try:
        audio_bytes = synthesize_speech_audio(
            payload.text,
            language=full_language,
            response_format=payload.response_format,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return Response(
        content=audio_bytes,
        media_type=speech_media_type(payload.response_format),
        headers={"Cache-Control": "no-store"},
    )


@app.post("/api/sessions", response_model=SessionSnapshot)
async def create_assessment(payload: SessionCreateRequest, db: Session = Depends(get_session)) -> SessionSnapshot:
    language_code = (payload.language or "en").strip().lower()
    full_language = LANGUAGE_NAME_MAP.get(language_code, "English")
    answers: dict[str, Any] = {
        "consent_for_ai": payload.consent_for_ai,
        "language": full_language,
    }
    first = next_question(None, answers)
    transcript: list[dict[str, Any]] = [transcript_entry("ai", BOT_GREETING)]
    if first is not None:
        base_prompt = render_question_text(first, answers)
        natural_prompt = await generate_empathetic_question("", base_prompt, language=full_language)
        transcript.append(transcript_entry("ai", natural_prompt, first.id))

    assessment = AssessmentSession(
        current_question_id=first.id if first else None,
        answers_json=json.dumps(answers),
        transcript_json=json.dumps(transcript),
        risk_json=json.dumps(compute_risk_profile(answers)),
        status="in_progress" if first else "completed",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return build_snapshot(assessment)


@app.get("/api/sessions", response_model=list[DashboardItem])
def list_assessments(db: Session = Depends(get_session)) -> list[DashboardItem]:
    assessments = db.exec(
        select(AssessmentSession).where(AssessmentSession.status == "completed").order_by(AssessmentSession.updated_at.desc())
    ).all()
    items: list[DashboardItem] = []
    for assessment in assessments:
        answers = decode_answers(assessment)
        risk = decode_risk(assessment)
        items.append(
            DashboardItem(
                session_id=assessment.id,
                patient_name=answers.get("patient_name"),
                proposed_procedure=answers.get("proposed_procedure"),
                updated_at=assessment.updated_at,
                consolidated_risk=risk.get("consolidated_risk"),
                asa_class=risk.get("asa_class"),
                status=assessment.status,
            )
        )
    return items


@app.get("/api/sessions/{session_id}", response_model=SessionSnapshot)
def get_assessment(session_id: str, db: Session = Depends(get_session)) -> SessionSnapshot:
    assessment = get_assessment_or_404(session_id, db)
    return build_snapshot(assessment)


@app.post("/api/sessions/{session_id}/answer", response_model=SessionSnapshot)
async def submit_answer(session_id: str, payload: AnswerRequest, db: Session = Depends(get_session)) -> SessionSnapshot:
    assessment = get_assessment_or_404(session_id, db)
    if assessment.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment is already completed.")
    if not assessment.current_question_id:
        raise HTTPException(status_code=400, detail="There is no active question for this session.")

    current = QUESTION_MAP[assessment.current_question_id]
    answers = decode_answers(assessment)
    current_language = str(answers.get("language") or "English")
    transcript = normalize_transcript_entries(decode_transcript(assessment))

    transcript.append(transcript_entry("patient", payload.answer_text, current.id))

    routing = classify_input(current, payload.answer_text, answers)
    answer_confirmation = ANSWER_CONFIRMATION
    lookup_failure_message: str | None = None
    if routing["mode"] in {"answer_only", "mixed"} and routing["answer_text"] is not None:
        if current.input_type == "phone" and isinstance(routing["parsed_answer"], str):
            patient_record = patient_record_for_phone(routing["parsed_answer"])
            if patient_record is None:
                lookup_failure_message = PHONE_LOOKUP_NOT_FOUND
                routing["parsed_answer"] = None
            else:
                apply_parsed_answer(current, answers, routing["parsed_answer"])
                apply_phone_demographics(answers, patient_record)
                answer_confirmation = PHONE_LOOKUP_CONFIRMATION
        elif routing["parsed_answer"] is not None or current.input_type != "phone":
            apply_parsed_answer(current, answers, routing["parsed_answer"])

    risk = compute_risk_profile(answers)

    if routing["policy_question"]:
        policy = retrieve_policy_answer(routing["policy_question"])
        source_text = ""
        if policy["sources"] and not should_hide_policy_sources(routing["policy_question"]):
            source_text = f" Source: {', '.join(policy['sources'])}."
        transcript.append(transcript_entry("ai", f"{policy['answer']}{source_text}"))
    elif routing.get("interjection_message"):
        transcript.append(transcript_entry("ai", routing["interjection_message"]))

    if routing["mode"] in {"answer_only", "mixed"}:
        if not is_question_complete(current, answers):
            correction = lookup_failure_message or invalid_answer_message(
                current, routing["answer_text"] or payload.answer_text, routing["parsed_answer"]
            )
            if correction:
                transcript.append(transcript_entry("ai", correction, current.id))
            base_prompt = render_question_text(current, answers)
            natural_prompt = await generate_empathetic_question(
                payload.answer_text,
                base_prompt,
                language=current_language,
            )
            transcript.append(transcript_entry("ai", natural_prompt, current.id))
            assessment.current_question_id = current.id
            assessment.status = "in_progress"
        else:
            if should_add_answer_confirmation(routing, True):
                transcript.append(transcript_entry("ai", answer_confirmation))
            upcoming = next_question(current.id, answers)
            if upcoming is not None:
                base_prompt = render_question_text(upcoming, answers)
                natural_prompt = await generate_empathetic_question(
                    payload.answer_text,
                    base_prompt,
                    language=current_language,
                )
                transcript.append(transcript_entry("ai", natural_prompt, upcoming.id))
                assessment.current_question_id = upcoming.id
                assessment.status = "in_progress"
            else:
                transcript.append(transcript_entry("ai", CAMERA_EXAM_PROMPT))
                assessment.current_question_id = None
                assessment.status = "awaiting_exam"
    else:
        base_prompt = render_question_text(current, answers)
        natural_prompt = await generate_empathetic_question(
            payload.answer_text,
            base_prompt,
            language=current_language,
        )
        transcript.append(transcript_entry("ai", natural_prompt, current.id))
        assessment.current_question_id = current.id
        assessment.status = "in_progress"

    encode_and_store(assessment, answers=answers, transcript=transcript, risk=risk)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return build_snapshot(assessment)


@app.post("/api/sessions/{session_id}/vision-airway", response_model=SessionSnapshot)
def submit_airway_capture(
    session_id: str,
    payload: VisionAirwayCaptureRequest,
    db: Session = Depends(get_session),
) -> SessionSnapshot:
    assessment = get_assessment_or_404(session_id, db)
    if assessment.current_question_id:
        raise HTTPException(status_code=400, detail="Complete the questionnaire before starting the camera-based examination.")
    if not payload.consent_for_image_analysis:
        raise HTTPException(status_code=400, detail="Image-analysis consent is required for airway vision capture.")

    answers = decode_answers(assessment)
    transcript = normalize_transcript_entries(decode_transcript(assessment))

    try:
        answers["vision_airway"] = analyze_airway_photo(
            payload.image_data_url,
            payload.capture_type,
            answers.get("vision_airway") if isinstance(answers.get("vision_airway"), dict) else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    transcript = [
        entry
        for entry in transcript
        if entry.get("question_id") not in {f"vision_{payload.capture_type}", "vision_exam_status"}
    ]
    for message in format_vision_transcript_messages(answers["vision_airway"], payload.capture_type):
        transcript.append(transcript_entry("ai", message, f"vision_{payload.capture_type}"))
    risk = compute_risk_profile(answers)
    if has_required_exam_captures(answers["vision_airway"]):
        transcript.append(
            transcript_entry(
                "ai",
                "The camera-based examination is complete. Your final transcript and report are now ready.",
                "vision_exam_status",
            )
        )
        assessment.status = "completed"
    else:
        transcript.append(
            transcript_entry(
                "ai",
                "Please capture the remaining required airway view to finish the examination.",
                "vision_exam_status",
            )
        )
        assessment.status = "awaiting_exam"

    encode_and_store(assessment, answers=answers, transcript=transcript, risk=risk)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return build_snapshot(assessment)


@app.get("/api/sessions/{session_id}/report", response_model=SessionReport)
def get_report(session_id: str, db: Session = Depends(get_session)) -> SessionReport:
    assessment = get_assessment_or_404(session_id, db)
    answers = decode_answers(assessment)
    transcript = [TranscriptEntry.model_validate(entry) for entry in normalize_transcript_entries(decode_transcript(assessment))]
    risk = decode_risk(assessment)

    patient_summary = {
        "name": answers.get("patient_name"),
        "age": answers.get("patient_age"),
        "sex": answers.get("patient_sex"),
        "uhid_no": answers.get("uhid_no"),
        "ip_no": answers.get("ip_no"),
        "history_source": answers.get("history_source"),
        "preoperative_diagnosis": answers.get("preoperative_diagnosis"),
        "proposed_procedure": answers.get("proposed_procedure"),
        "height_cm": answers.get("height_cm"),
        "weight_kg": answers.get("weight_kg"),
    }

    return SessionReport(
        session_id=assessment.id,
        status=assessment.status,
        patient_summary=patient_summary,
        answers=answers,
        transcript=transcript,
        risk_assessment=risk,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
    )


def safe_frontend_file(full_path: str) -> Path | None:
    if not FRONTEND_DIST_DIR.exists():
        return None

    relative_path = full_path.strip("/")
    target = (FRONTEND_DIST_DIR / relative_path).resolve() if relative_path else (FRONTEND_DIST_DIR / "index.html").resolve()
    root = FRONTEND_DIST_DIR.resolve()
    if root not in {target, *target.parents}:
        return None
    return target if target.exists() and target.is_file() else None


@app.get("/", include_in_schema=False)
def frontend_index() -> FileResponse:
    index_file = safe_frontend_file("")
    if index_file is None:
        raise HTTPException(status_code=404, detail="Frontend build not found. Run the frontend build first.")
    return FileResponse(index_file)


@app.get("/{full_path:path}", include_in_schema=False)
def frontend_routes(full_path: str) -> FileResponse:
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    direct_file = safe_frontend_file(full_path)
    if direct_file is not None:
        return FileResponse(direct_file)

    index_file = safe_frontend_file("")
    if index_file is None:
        raise HTTPException(status_code=404, detail="Frontend build not found. Run the frontend build first.")
    return FileResponse(index_file)
