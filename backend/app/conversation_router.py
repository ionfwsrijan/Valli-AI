from __future__ import annotations

import re
from typing import Any

from .policy_rag import (
    detect_off_topic_question,
    detect_policy_question,
    looks_like_question,
    off_topic_redirect_answer,
    split_answer_and_policy_question,
)
from .questionnaire import Question, parse_answer, parse_boolean, parse_choice

NAME_PATTERN = re.compile(r"[A-Za-z][A-Za-z .'-]{0,60}$")
TIME_OR_POLICY_STATEMENT_PATTERN = re.compile(
    r"\b(hour|hours|minute|minutes|today|tomorrow|tonight|eat|eating|drink|drinking|water|pizza|burger|food|home|ride|driver)\b",
    flags=re.IGNORECASE,
)


def has_clear_text_answer(question: Question, answer_text: str) -> bool:
    cleaned = answer_text.strip()
    if not cleaned or looks_like_question(cleaned):
        return False

    lowered = cleaned.lower()
    if re.search(r"\b(i|my|me)\b", lowered) and TIME_OR_POLICY_STATEMENT_PATTERN.search(lowered):
        return False

    if question.id == "patient_name":
        if re.search(r"\d", cleaned):
            return False
        if len(cleaned.split()) > 5:
            return False
        return bool(NAME_PATTERN.fullmatch(cleaned))

    return True


def has_clear_answer(question: Question, answer_text: str, answers: dict[str, Any] | None = None) -> bool:
    cleaned = answer_text.strip()
    if not cleaned:
        return False

    if question.input_type == "body_metrics":
        parsed = parse_answer(question, cleaned, answers)
        return isinstance(parsed, dict) and bool(parsed)
    if question.input_type == "boolean":
        return parse_boolean(cleaned) is not None
    if question.input_type == "integer":
        parsed = parse_answer(question, cleaned, answers)
        return isinstance(parsed, int)
    if question.input_type == "number":
        parsed = parse_answer(question, cleaned, answers)
        return isinstance(parsed, (int, float)) and not isinstance(parsed, bool)
    if question.input_type == "choice":
        parsed = parse_choice(question, cleaned)
        return parsed in {option.value for option in question.options}
    return has_clear_text_answer(question, cleaned)


def classify_input(question: Question, raw_text: str, answers: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = raw_text.strip()

    answer_part, policy_question = split_answer_and_policy_question(raw_text)
    contains_policy_question = policy_question is not None and detect_policy_question(policy_question)
    contains_non_assessment_question = (
        policy_question is not None
        and not contains_policy_question
        and looks_like_question(policy_question)
        and not (policy_question == cleaned and has_clear_answer(question, cleaned, answers))
    )
    contains_off_topic_question = policy_question is not None and (
        detect_off_topic_question(policy_question) or contains_non_assessment_question
    )

    if contains_policy_question and answer_part and has_clear_answer(question, answer_part, answers):
        return {
            "mode": "mixed",
            "answer_text": answer_part,
            "policy_question": cleaned,
            "interjection_message": None,
            "parsed_answer": parse_answer(question, answer_part, answers),
        }

    if contains_policy_question:
        return {
            "mode": "policy_only",
            "answer_text": None,
            "policy_question": cleaned,
            "interjection_message": None,
            "parsed_answer": None,
        }

    if contains_off_topic_question and answer_part and has_clear_answer(question, answer_part, answers):
        return {
            "mode": "mixed",
            "answer_text": answer_part,
            "policy_question": None,
            "interjection_message": off_topic_redirect_answer(answer_recorded=True),
            "parsed_answer": parse_answer(question, answer_part, answers),
        }

    if contains_off_topic_question:
        return {
            "mode": "off_topic_only",
            "answer_text": None,
            "policy_question": None,
            "interjection_message": off_topic_redirect_answer(),
            "parsed_answer": None,
        }

    if (
        question.input_type in {"boolean", "choice", "body_metrics"}
        and has_clear_answer(question, cleaned, answers)
        and not detect_policy_question(cleaned)
        and not detect_off_topic_question(cleaned)
    ):
        return {
            "mode": "answer_only",
            "answer_text": cleaned,
            "policy_question": None,
            "interjection_message": None,
            "parsed_answer": parse_answer(question, cleaned, answers),
        }

    return {
        "mode": "answer_only",
        "answer_text": cleaned,
        "policy_question": None,
        "interjection_message": None,
        "parsed_answer": parse_answer(question, raw_text, answers),
    }
