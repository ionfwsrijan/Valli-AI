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
    r"\bcan you\b",
    r"\bshould i\b",
    r"\bdo you\b",
    r"\bare you\b",
    r"\bwhat if\b",
    r"\bwhat(?:'s| is| are| about)\b",
    r"\bwhen should\b",
    r"\bwhen can\b",
    r"\bwhere(?:'s| is| are| can| should)\b",
    r"\bwho(?:'s| is| are| can| should)\b",
    r"\bhow(?:\s+do|\s+does|\s+did|\s+is|\s+are|\s+am|\s+long|\s+many|\s+about)\b",
    r"\bwhy\b",
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
    "pizza",
    "burger",
    "sandwich",
    "meal",
    "rice",
    "roti",
    "chapati",
    "juice",
    "milk",
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

SOLID_FOOD_KEYWORDS = {
    "food",
    "eat",
    "eating",
    "pizza",
    "burger",
    "sandwich",
    "meal",
    "rice",
    "roti",
    "chapati",
    "solid",
}

DRINK_KEYWORDS = {
    "water",
    "drink",
    "drinking",
    "liquid",
    "liquids",
    "juice",
    "tea",
    "coffee",
    "milk",
}

OFF_TOPIC_KEYWORDS = {
    "looking good",
    "look good",
    "looking godd",
    "look godd",
    "looking gud",
    "look gud",
    "how do i look",
    "how am i looking",
    "beautiful",
    "handsome",
    "pretty",
    "cute",
    "smart",
    "hot",
    "ugly",
    "joke",
    "funny",
    "weather",
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
    "in an hour",
    "in 1 hour",
    "in one hour",
    "within an hour",
    "within 1 hour",
    "within one hour",
    "in 2 hours",
    "in two hours",
    "within 2 hours",
    "within two hours",
)


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def contains_any(text: str, keywords: set[str]) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)


def contains_pattern(text: str, patterns: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(pattern in lowered for pattern in patterns)


def first_sentence(text: str) -> str:
    match = re.search(r"(.+?[.!?])(?:\s|$)", normalize_whitespace(text))
    if match:
        return match.group(1).strip()
    return normalize_whitespace(text)


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
    return bool(keyword_hit and looks_like_question(cleaned))


def looks_like_question(text: str) -> bool:
    cleaned = normalize_whitespace(text)
    return bool(cleaned and (cleaned.endswith("?") or QUESTION_REGEX.search(cleaned)))


def detect_off_topic_question(text: str) -> bool:
    cleaned = normalize_whitespace(text)
    lowered = cleaned.lower()
    if detect_policy_question(cleaned):
        return False
    if not looks_like_question(cleaned):
        return False
    return any(keyword in lowered for keyword in OFF_TOPIC_KEYWORDS)


def split_answer_and_policy_question(text: str) -> tuple[str | None, str | None]:
    cleaned = normalize_whitespace(text)
    if not cleaned:
        return None, None

    question_mark_index = cleaned.find("?")
    if question_mark_index != -1:
        clause_start = max(
            cleaned.rfind(". ", 0, question_mark_index + 1),
            cleaned.rfind("! ", 0, question_mark_index + 1),
            cleaned.rfind("; ", 0, question_mark_index + 1),
            cleaned.rfind(": ", 0, question_mark_index + 1),
        )
        if clause_start != -1:
            answer_part = cleaned[:clause_start].rstrip(" .,!;:-")
            question_part = cleaned[clause_start + 2 :].strip()
            if looks_like_question(question_part):
                return (answer_part or None), (question_part or None)

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
    lowered = query.lower()

    if contains_any(lowered, FASTING_KEYWORDS):
        if contains_pattern(lowered, FINAL_WINDOW_PATTERNS):
            if contains_any(lowered, SOLID_FOOD_KEYWORDS):
                return (
                    "If surgery is within about four hours, do not eat pizza or other solid food now; "
                    "follow your hospital's fasting plan or call the anesthesiology team if unsure."
                )
            if contains_any(lowered, DRINK_KEYWORDS):
                return (
                    "Because your surgery is soon, do not start drinking now unless the hospital team has clearly told you that clear liquids are still allowed."
                )
        if contains_pattern(lowered, DAY_BEFORE_PATTERNS):
            return (
                "The day before surgery is different from the immediate pre-operative window, so please follow your hospital's written fasting plan instead of guessing."
            )
        return (
            "Fasting depends on when the anesthesia will start, so please follow your hospital's written instructions or call the anesthesiology team before eating or drinking."
        )

    if contains_any(lowered, RIDE_HOME_KEYWORDS):
        return (
            "After anesthesia or sedation, plan for a responsible adult to take you home unless the hospital team has clearly told you otherwise."
        )

    return first_sentence(primary.content)


def should_hide_policy_sources(query: str) -> bool:
    return contains_any(query.lower(), FASTING_KEYWORDS)


def off_topic_redirect_answer(*, answer_recorded: bool = False) -> str:
    prefix = "I have recorded your answer. " if answer_recorded else ""
    return (
        f"{prefix}Let's stay focused on your pre-anesthetic assessment so I can record the right clinical details safely. "
        "Please answer the current question, or ask me a surgery-related question if you need help."
    )


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
