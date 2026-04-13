from __future__ import annotations

from typing import Any

from .policy_rag import detect_policy_question, split_answer_and_policy_question
from .questionnaire import Question, parse_answer, parse_boolean, parse_choice


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
    return True


def classify_input(question: Question, raw_text: str, answers: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = raw_text.strip()

    if (
        question.input_type in {"boolean", "choice", "body_metrics"}
        and has_clear_answer(question, cleaned, answers)
        and not detect_policy_question(cleaned)
    ):
        return {
            "mode": "answer_only",
            "answer_text": cleaned,
            "policy_question": None,
            "parsed_answer": parse_answer(question, cleaned, answers),
        }

    answer_part, policy_question = split_answer_and_policy_question(raw_text)
    contains_policy_question = policy_question is not None and detect_policy_question(policy_question)

    if contains_policy_question and answer_part and has_clear_answer(question, answer_part, answers):
        return {
            "mode": "mixed",
            "answer_text": answer_part,
            "policy_question": policy_question,
            "parsed_answer": parse_answer(question, answer_part, answers),
        }

    if contains_policy_question:
        return {
            "mode": "policy_only",
            "answer_text": None,
            "policy_question": policy_question,
            "parsed_answer": None,
        }

    return {
        "mode": "answer_only",
        "answer_text": cleaned,
        "policy_question": None,
        "parsed_answer": parse_answer(question, raw_text, answers),
    }
