from __future__ import annotations

import os

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency fallback
    def load_dotenv() -> bool:
        return False


try:
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover - optional dependency fallback
    AsyncOpenAI = None  # type: ignore[assignment]


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_VALLI_MODEL = os.getenv("OPENAI_VALLI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

client = AsyncOpenAI(api_key=OPENAI_API_KEY) if AsyncOpenAI and OPENAI_API_KEY else None


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
        "You are Valli, a professional, calming anesthetist conducting a pre-operative assessment. "
        "Your task is to ask the exact clinical question provided to you, but phrase it naturally and conversationally. "
        f"You must respond only in {language}. "
        "Strict rules: "
        "1. Do not change the medical intent of the question. "
        "2. Do not ask any additional questions. Keep it to one single question. "
        "3. Do not overuse empathy. Only acknowledge the patient's previous answer if they clearly express severe pain, intense fear, or confusion. "
        "4. If empathy is needed, keep it brief, natural, and different each time. "
        "5. Return only the question Valli should say next, with no labels or extra explanation."
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
            temperature=0.4,
            max_tokens=220,
        )
        generated = (response.choices[0].message.content or "").strip()
        return generated or next_core_question
    except Exception:
        return next_core_question
