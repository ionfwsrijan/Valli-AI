from __future__ import annotations

import os

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency fallback
    def load_dotenv() -> bool:
        return False


try:
    from openai import AsyncOpenAI, OpenAI
except ImportError:  # pragma: no cover - optional dependency fallback
    AsyncOpenAI = None  # type: ignore[assignment]
    OpenAI = None  # type: ignore[assignment]


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_VALLI_MODEL = os.getenv("OPENAI_VALLI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
OPENAI_VALLI_TTS_MODEL = os.getenv("OPENAI_VALLI_TTS_MODEL", "gpt-4o-mini-tts").strip() or "gpt-4o-mini-tts"
OPENAI_VALLI_TTS_VOICE = os.getenv("OPENAI_VALLI_TTS_VOICE", "coral").strip() or "coral"

try:
    OPENAI_VALLI_TTS_SPEED = max(0.25, min(4.0, float(os.getenv("OPENAI_VALLI_TTS_SPEED", "0.95"))))
except ValueError:
    OPENAI_VALLI_TTS_SPEED = 0.95

client = AsyncOpenAI(api_key=OPENAI_API_KEY) if AsyncOpenAI and OPENAI_API_KEY else None
sync_client = OpenAI(api_key=OPENAI_API_KEY) if OpenAI and OPENAI_API_KEY else None


async def generate_empathetic_question(
    previous_patient_answer: str,
    next_core_question: str,
    language: str = "English",
) -> str:
    if client is None:
        return next_core_question

    context_block = ""
    if previous_patient_answer:
        context_block = f"The patient just answered the previous question with: '{previous_patient_answer}'."

    system_prompt = (
        "You are a calm, compassionate doctor conducting a pre-operative assessment. "
        "Ask the exact clinical question provided to you, but make it sound natural, warm, and easy for a patient to understand. "
        f"You must respond only in {language}. "
        "Strict rules: "
        "1. Do not change the medical intent of the question. "
        "2. Do not ask additional questions or add extra medical advice. "
        "3. Keep the wording simple and patient-friendly. Avoid heavy medical terms unless the question already uses them. "
        "4. You may add one short human bridge such as 'Thank you', 'Alright', or 'I understand' when it fits, but do not sound repetitive or dramatic. "
        "5. Keep it to one short question, or two very short sentences at most. "
        "6. Return only what the doctor should say next, with no labels or explanation."
    )

    try:
        response = await client.chat.completions.create(
            model=OPENAI_VALLI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"{context_block}\n\n"
                        f"The next clinical question you must ask is: '{next_core_question}'."
                    ),
                },
            ],
            temperature=0.55,
            max_tokens=220,
        )
        generated = (response.choices[0].message.content or "").strip()
        return generated or next_core_question
    except Exception:
        return next_core_question


def speech_media_type(response_format: str) -> str:
    if response_format == "wav":
        return "audio/wav"
    if response_format == "aac":
        return "audio/aac"
    if response_format == "flac":
        return "audio/flac"
    if response_format == "opus":
        return "audio/ogg"
    if response_format == "pcm":
        return "audio/L16"
    return "audio/mpeg"


def voice_instructions(language: str) -> str:
    return (
        f"Speak naturally in {language} with a calm, warm, emotionally present, professional feminine voice suitable "
        "for a pre-operative assessment. Sound reassuring, human, and attentive rather than robotic."
    )


def synthesize_speech_audio(
    text: str,
    *,
    language: str = "English",
    response_format: str = "mp3",
) -> bytes:
    if sync_client is None:
        raise RuntimeError("OpenAI voice is not configured on the server.")

    normalized_text = " ".join(text.split()).strip()
    if not normalized_text:
        raise RuntimeError("No text was provided for speech synthesis.")

    safe_text = normalized_text[:4000]

    try:
        response = sync_client.audio.speech.create(
            model=OPENAI_VALLI_TTS_MODEL,
            voice=OPENAI_VALLI_TTS_VOICE,
            input=safe_text,
            instructions=voice_instructions(language),
            response_format=response_format,
            speed=OPENAI_VALLI_TTS_SPEED,
        )
        return response.content
    except Exception as exc:  # pragma: no cover - network/API failure
        raise RuntimeError(str(exc)) from exc
