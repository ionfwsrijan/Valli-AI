from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from .runtime_paths import packaged_policy_doc_path, writable_policy_doc_path


@dataclass(frozen=True)
class PolicyChunk:
    heading: str
    content: str


@dataclass(frozen=True)
class PolicyRetriever:
    chunks: list[PolicyChunk]
    vectorizer: TfidfVectorizer
    matrix: Any


QUESTION_PATTERNS = [
    r"\bcan i\b",
    r"\bshould i\b",
    r"\bwhat if\b",
    r"\bwhen should\b",
    r"\bwhen can\b",
    r"\bhow long\b",
    r"\bhow many\b",
    r"\bdo i need\b",
    r"\bam i\b",
    r"\bis it okay\b",
    r"\bwill i\b",
    r"\bwhere should\b",
    r"\bwho should\b",
]

QUESTION_REGEX = re.compile("|".join(QUESTION_PATTERNS), flags=re.IGNORECASE)
POLICY_KEYWORDS = {
    "fasting",
    "fast",
    "water",
    "drink",
    "drinking",
    "liquid",
    "food",
    "eat",
    "ride",
    "home",
    "escort",
    "pickup",
    "driver",
    "drop",
    "discharge",
    "medicine",
    "medication",
    "tablet",
    "hospital",
    "arrival",
    "report",
    "documents",
}

FASTING_KEYWORDS = {
    "fasting",
    "fast",
    "water",
    "drink",
    "drinking",
    "liquid",
    "liquids",
    "clear liquid",
    "clear liquids",
    "food",
    "eat",
    "eating",
    "gum",
    "coffee",
    "tea",
}

RIDE_HOME_KEYWORDS = {
    "ride",
    "home",
    "escort",
    "pickup",
    "driver",
    "drop",
    "discharge",
    "go home",
    "alone",
    "taxi",
    "uber",
    "lyft",
}

DAY_BEFORE_PATTERNS = (
    "day before",
    "the day before",
    "night before",
    "tonight",
    "tomorrow",
    "previous day",
)

FINAL_WINDOW_PATTERNS = (
    "2 hour",
    "two hour",
    "3 hour",
    "three hour",
    "4 hour",
    "four hour",
    "morning of",
    "right before",
    "just before",
)


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def contains_any(text: str, keywords: set[str]) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)


def contains_pattern(text: str, patterns: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(pattern in lowered for pattern in patterns)


def split_policy_sections(raw_text: str) -> list[PolicyChunk]:
    sections: list[PolicyChunk] = []
    current_heading = "General"
    current_lines: list[str] = []

    for line in raw_text.splitlines():
        if line.startswith("## "):
            if current_lines:
                sections.append(PolicyChunk(current_heading, normalize_whitespace(" ".join(current_lines))))
            current_heading = line[3:].strip()
            current_lines = []
            continue
        if line.strip():
            current_lines.append(line.strip())

    if current_lines:
        sections.append(PolicyChunk(current_heading, normalize_whitespace(" ".join(current_lines))))

    return sections


@lru_cache(maxsize=1)
def load_policy_retriever() -> PolicyRetriever:
    policy_path = writable_policy_doc_path() if writable_policy_doc_path().exists() else packaged_policy_doc_path()
    raw_text = policy_path.read_text(encoding="utf-8") if policy_path.exists() else ""
    chunks = split_policy_sections(raw_text)
    if not chunks:
        chunks = [
            PolicyChunk(
                "General",
                "No hospital policy knowledge base has been configured yet. Add approved hospital guidance to docs/hospital_policy.md.",
            )
        ]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([f"{chunk.heading}. {chunk.content}" for chunk in chunks])
    return PolicyRetriever(chunks=chunks, vectorizer=vectorizer, matrix=matrix)


def detect_policy_question(text: str) -> bool:
    cleaned = normalize_whitespace(text)
    lowered = cleaned.lower()
    keyword_hit = any(keyword in lowered for keyword in POLICY_KEYWORDS)
    return bool(keyword_hit and (cleaned.endswith("?") or QUESTION_REGEX.search(cleaned)))


def split_answer_and_policy_question(text: str) -> tuple[str | None, str | None]:
    cleaned = normalize_whitespace(text)
    if not cleaned:
        return None, None

    match = QUESTION_REGEX.search(cleaned)
    if match:
        if match.start() == 0:
            return None, cleaned
        answer_part = cleaned[: match.start()].rstrip(" ,;:-")
        answer_part = re.sub(r"\b(and|also|plus|but)\s*$", "", answer_part, flags=re.IGNORECASE).strip()
        question_part = cleaned[match.start() :].lstrip(" ,;:-")
        return (answer_part or None), (question_part or None)

    if cleaned.endswith("?"):
        return None, cleaned

    return cleaned, None


def build_contextual_answer(query: str, snippets: list[PolicyChunk]) -> str:
    primary = snippets[0]
    supporting = snippets[1:] if len(snippets) > 1 else []
    lowered = query.lower()
    lead_parts: list[str] = []

    if contains_any(lowered, FASTING_KEYWORDS):
        lead_parts.append(
            "This depends on how soon the procedure is and on the instructions from the anesthesiology or surgical team."
        )
        if contains_pattern(lowered, DAY_BEFORE_PATTERNS):
            lead_parts.append(
                "A day before surgery is different from the final immediate pre-operative window, so the assistant should not treat them the same."
            )
        elif contains_pattern(lowered, FINAL_WINDOW_PATTERNS):
            lead_parts.append(
                "As the procedure gets close, fasting becomes stricter, so the assistant should not answer with a blanket yes."
            )
        else:
            lead_parts.append(
                "The assistant should avoid a blanket yes or no about water or food when the exact anesthesia timing is not known."
            )
    elif contains_any(lowered, RIDE_HOME_KEYWORDS):
        lead_parts.append(
            "Ride-home advice depends on the anesthesia plan and the discharge pathway, but sedation and anesthesia usually require a responsible adult unless the hospital team has explicitly cleared otherwise."
        )

    answer_parts = [*lead_parts, primary.content]
    if supporting:
        answer_parts.append(f"Related note: {supporting[0].content}")
    return " ".join(answer_parts)


def retrieve_policy_answer(query: str) -> dict[str, Any]:
    retriever = load_policy_retriever()
    query_vector = retriever.vectorizer.transform([query])
    scores = (retriever.matrix @ query_vector.T).toarray().ravel()
    ranking = np.argsort(scores)[::-1]
    best_indices = [int(index) for index in ranking[:2] if scores[index] > 0]

    if not best_indices:
        return {
            "answer": (
                "I could not find a matching hospital-policy note in the configured knowledge base. "
                "Please ask the hospital or update docs/hospital_policy.md with the approved policy."
            ),
            "sources": [],
        }

    snippets = [retriever.chunks[index] for index in best_indices]
    answer = build_contextual_answer(query, snippets)

    return {
        "answer": answer,
        "sources": [snippet.heading for snippet in snippets],
    }
