from __future__ import annotations

from dataclasses import asdict, dataclass, field
import re
from typing import Any


@dataclass(frozen=True)
class QuestionOption:
    value: str
    label: str


@dataclass(frozen=True)
class Question:
    id: str
    field: str
    text: str
    section: str
    input_type: str = "text"
    placeholder: str | None = None
    options: list[QuestionOption] = field(default_factory=list)
    depends_on: dict[str, Any] = field(default_factory=dict)
    helper_text: str | None = None
    optional: bool = False


YES_VALUES = {
    "yes",
    "y",
    "yeah",
    "yep",
    "affirmative",
    "true",
    "1",
    "ஆம்",
    "ஆமாம்",
    "ஆமா",
    "சரி",
    "हाँ",
    "हां",
    "जी",
    "हाँ जी",
}
NO_VALUES = {
    "no",
    "n",
    "nope",
    "negative",
    "false",
    "0",
    "இல்லை",
    "இல்ல",
    "வேண்டாம்",
    "नहीं",
    "नही",
    "मत",
    "न",
}
SKIP_VALUES = {
    "skip",
    "not available",
    "na",
    "n/a",
    "don't have it",
    "do not have it",
    "unknown",
    "தவிர்",
    "தவிர்க்கவும்",
    "தெரியாது",
    "छोड़ें",
    "छोड़ो",
    "पता नहीं",
    "मालूम नहीं",
}

COMPOUND_QUESTION_FIELDS: dict[str, tuple[str, ...]] = {
    "smoking_details": ("smoking_years", "smoking_packs_per_day", "smoking_last_puff"),
    "alcohol_details": ("alcohol_years", "alcohol_last_drink"),
}

COMPOUND_QUESTION_LABELS: dict[str, dict[str, str]] = {
    "smoking_details": {
        "smoking_years": "the number of years of this habit",
        "smoking_packs_per_day": "packs per day",
        "smoking_last_puff": "the last puff",
    },
    "alcohol_details": {
        "alcohol_years": "the number of years of this habit",
        "alcohol_last_drink": "the last drink",
    },
}

TIME_REFERENCE_PATTERNS = (
    r"\btoday\b",
    r"\byesterday\b",
    r"\btonight\b",
    r"\bthis morning\b",
    r"\bthis afternoon\b",
    r"\bthis evening\b",
    r"\blast night\b",
    r"\blast week\b",
    r"\blast month\b",
    r"\b\d+(?:\.\d+)?\s*(?:minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago\b",
)


def merge_depends_on(*parts: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for part in parts:
        merged.update(part)
    return merged


def illness_questions(
    field_name: str,
    question_text: str,
    meds_field: str,
    *,
    section: str = "Health Problems",
    base_depends_on: dict[str, Any] | None = None,
    duration_text: str = "If yes, for how many years?",
    medicine_text: str = "Are you currently taking any medicines for this?",
    medicine_details_text: str = "Could you please mention the medicines you are taking for this illness?",
    extra_questions: list[Question] | None = None,
) -> list[Question]:
    shared_depends = base_depends_on or {}
    active_depends = merge_depends_on(shared_depends, {field_name: True})
    questions = [
        Question(field_name, field_name, question_text, section, "boolean", depends_on=shared_depends),
        Question(
            f"{field_name}_duration_years",
            f"{field_name}_duration_years",
            duration_text,
            section,
            "number",
            depends_on=active_depends,
        ),
        Question(
            f"{field_name}_on_medication",
            f"{field_name}_on_medication",
            medicine_text,
            section,
            "boolean",
            depends_on=active_depends,
        ),
        Question(
            meds_field,
            meds_field,
            medicine_details_text,
            section,
            depends_on=merge_depends_on(shared_depends, {f"{field_name}_on_medication": True}),
        ),
    ]
    if extra_questions:
        questions.extend(extra_questions)
    return questions


PATIENT_IDENTITY_QUESTIONS = [
    Question("patient_name", "patient_name", "What is your name?", "Patient Details"),
    Question("patient_age", "patient_age", "What is your age?", "Patient Details", "integer", "For example, 42"),
    Question(
        "patient_sex",
        "patient_sex",
        "What's your gender?",
        "Patient Details",
        "choice",
        options=[
            QuestionOption("male", "Male"),
            QuestionOption("female", "Female"),
            QuestionOption("other", "Other"),
        ],
    ),
    Question(
        "uhid_no",
        "uhid_no",
        "What is your UHID number?",
        "Patient Details",
        helper_text="You can skip this if you do not have it.",
        optional=True,
    ),
    Question(
        "ip_no",
        "ip_no",
        "What is your IP number?",
        "Patient Details",
        helper_text="You can skip this if you do not have it.",
        optional=True,
    ),
    Question(
        "body_metrics",
        "body_metrics",
        "Please tell me both your weight in kilograms and your height in centimeters.",
        "Patient Details",
        "body_metrics",
        helper_text="For example: 68 kg and 162 cm.",
    ),
    Question("preoperative_diagnosis", "preoperative_diagnosis", "What is the pre-operative diagnosis?", "Patient Details"),
    Question("proposed_procedure", "proposed_procedure", "What is the proposed procedure?", "Patient Details"),
    Question(
        "history_source",
        "history_source",
        "History taken from:",
        "Patient Details",
        "choice",
        options=[
            QuestionOption("patient", "Patient"),
            QuestionOption("relative_guardian", "Relative/Guardian"),
            QuestionOption("medical_records", "Medical Records"),
        ],
    ),
]


PREVIOUS_HISTORY_QUESTIONS = [
    Question(
        "previous_surgery",
        "previous_surgery",
        "Do you have any history of previous surgeries in the past?",
        "Previous Surgery",
        "boolean",
    ),
    Question(
        "previous_surgery_when",
        "previous_surgery_when",
        "Could you please mention when it was done?",
        "Previous Surgery",
        depends_on={"previous_surgery": True},
    ),
    Question(
        "previous_surgery_year",
        "previous_surgery_year",
        "Could you please mention the year?",
        "Previous Surgery",
        "integer",
        depends_on={"previous_surgery": True},
    ),
    Question(
        "previous_surgery_month",
        "previous_surgery_month",
        "Could you please mention the month?",
        "Previous Surgery",
        depends_on={"previous_surgery": True},
    ),
    Question(
        "previous_anesthesia_type",
        "previous_anesthesia_type",
        "Do you remember the type of anaesthesia used for the procedure?",
        "Previous Surgery",
        "choice",
        depends_on={"previous_surgery": True},
        options=[
            QuestionOption("ga", "GA"),
            QuestionOption("spinal", "Spinal"),
            QuestionOption("regional_block", "Regional Block"),
            QuestionOption("unknown", "Do not remember"),
        ],
    ),
    Question(
        "icu_after_previous_surgery",
        "icu_after_previous_surgery",
        "Were you admitted in ICU after the procedure?",
        "Previous Surgery",
        "boolean",
        depends_on={"previous_surgery": True},
    ),
    Question(
        "icu_reason",
        "icu_reason",
        "Do you remember the reason why you were admitted in the ICU?",
        "Previous Surgery",
        depends_on={"icu_after_previous_surgery": True},
    ),
    Question(
        "icu_days",
        "icu_days",
        "Could you mention the number of days you were in the ICU?",
        "Previous Surgery",
        "integer",
        depends_on={"icu_after_previous_surgery": True},
    ),
    Question(
        "ventilator_support",
        "ventilator_support",
        "Were you on a ventilator?",
        "Previous Surgery",
        "boolean",
        depends_on={"icu_after_previous_surgery": True},
    ),
    Question(
        "ventilator_days",
        "ventilator_days",
        "If yes, for how many days?",
        "Previous Surgery",
        "integer",
        depends_on={"ventilator_support": True},
    ),
    Question(
        "oxygen_therapy_taken",
        "oxygen_therapy_taken",
        "Was O2 therapy taken?",
        "Previous Surgery",
        "boolean",
        depends_on={"icu_after_previous_surgery": True},
    ),
]


HEALTH_PROBLEM_QUESTIONS = [
    *illness_questions("diabetes", "Do you have diabetes?", "diabetes_meds"),
    *illness_questions(
        "hypertension",
        "Do you have high BP (blood pressure)?",
        "hypertension_meds",
    ),
    *illness_questions(
        "thyroid_disorder",
        "Do you have a thyroid disorder?",
        "thyroid_disorder_meds",
    ),
    *illness_questions(
        "asthma",
        "Do you have asthma?",
        "asthma_meds",
        extra_questions=[
            Question(
                "asthma_inhaler_details",
                "asthma_inhaler_details",
                "Could you please mention the dose or frequency of the inhaler?",
                "Health Problems",
                depends_on={"asthma": True},
            ),
            Question(
                "asthma_last_episode",
                "asthma_last_episode",
                "When was the last episode?",
                "Health Problems",
                depends_on={"asthma": True},
            ),
        ],
    ),
    *illness_questions(
        "seizures",
        "Do you have seizures?",
        "seizures_meds",
        extra_questions=[
            Question(
                "seizures_last_episode",
                "seizures_last_episode",
                "When was the last episode?",
                "Health Problems",
                depends_on={"seizures": True},
            ),
        ],
    ),
    *illness_questions(
        "heart_disease",
        "Do you have heart disease?",
        "heart_disease_meds",
    ),
    Question(
        "stent_history",
        "stent_history",
        "Have you had any procedure with stenting done?",
        "Health Problems",
        "boolean",
        depends_on={"heart_disease": True},
    ),
    Question(
        "pacemaker_implants",
        "pacemaker_implants",
        "Do you have any implants or pacemakers?",
        "Health Problems",
        "boolean",
        depends_on={"heart_disease": True},
    ),
    *illness_questions(
        "kidney_disease",
        "Do you have kidney disease?",
        "kidney_disease_meds",
    ),
    Question(
        "on_dialysis",
        "on_dialysis",
        "Are you on dialysis?",
        "Health Problems",
        "boolean",
        depends_on={"kidney_disease": True},
    ),
    Question(
        "dialysis_cycles",
        "dialysis_cycles",
        "How many cycles of dialysis has been done?",
        "Health Problems",
        "integer",
        depends_on={"on_dialysis": True},
    ),
    *illness_questions(
        "liver_disease",
        "Do you have liver disease?",
        "liver_disease_meds",
    ),
    *illness_questions(
        "stroke_history",
        "Do you have a history of stroke?",
        "stroke_meds",
    ),
    *illness_questions(
        "bleeding_disorder",
        "Do you have any bleeding disorders?",
        "bleeding_disorder_meds",
    ),
    Question(
        "other_present_illness_details",
        "other_present_illness_details",
        "Could you mention any more details about your health problems?",
        "Health Problems",
    ),
]


ALLERGY_AND_HABIT_QUESTIONS = [
    Question("drug_allergies", "drug_allergies", "Do you have any drug allergies?", "Allergies and Habits", "boolean"),
    Question(
        "drug_allergies_details",
        "drug_allergies_details",
        "Which drug are you allergic to?",
        "Allergies and Habits",
        depends_on={"drug_allergies": True},
    ),
    Question(
        "family_history",
        "family_history",
        "Could you please mention any relevant family history of illness?",
        "Allergies and Habits",
        "boolean",
    ),
    Question(
        "family_history_details",
        "family_history_details",
        "Could you specify more relating to the condition?",
        "Allergies and Habits",
        depends_on={"family_history": True},
    ),
    Question("smoking_history", "smoking_history", "Do you have a history of smoking?", "Allergies and Habits", "boolean"),
    Question(
        "smoking_details",
        "smoking_details",
        "Could you mention the number of years of this habit, packs per day and the last puff?",
        "Allergies and Habits",
        depends_on={"smoking_history": True},
    ),
    Question(
        "alcohol_history",
        "alcohol_history",
        "Do you have a history of alcohol consumption?",
        "Allergies and Habits",
        "boolean",
    ),
    Question(
        "alcohol_details",
        "alcohol_details",
        "Could you please mention the number of years of this habit and last drink?",
        "Allergies and Habits",
        depends_on={"alcohol_history": True},
    ),
]


CARDIOVASCULAR_QUESTIONS = [
    Question(
        "palpitations",
        "palpitations",
        "Do you have any history of irregular heart beats?",
        "Cardiovascular System",
        "boolean",
    ),
    Question(
        "palpitations_details",
        "palpitations_details",
        "Could you please mention more details about the irregular heart beats?",
        "Cardiovascular System",
        depends_on={"palpitations": True},
    ),
    Question(
        "breathlessness",
        "breathlessness",
        "Do you have any history of breathlessness?",
        "Cardiovascular System",
        "boolean",
    ),
    Question(
        "chest_pain",
        "chest_pain",
        "Do you have any history of chest pain?",
        "Cardiovascular System",
        "boolean",
    ),
    Question(
        "nyha_class",
        "nyha_class",
        "NYHA classification",
        "Cardiovascular System",
        "choice",
        depends_on={"breathlessness": True},
        options=[
            QuestionOption(
                "1",
                "Class 1: Ordinary activity does not cause unusual tiredness, irregular heart beats, or shortness of breath.",
            ),
            QuestionOption(
                "2",
                "Class 2: You are comfortable at rest, but ordinary activity such as walking up two flights of stairs causes tiredness, irregular heart beats, or shortness of breath.",
            ),
            QuestionOption(
                "3",
                "Class 3: You are comfortable at rest, but less than ordinary activity such as walking one block or showering causes tiredness, irregular heart beats, or shortness of breath.",
            ),
            QuestionOption(
                "4",
                "Class 4: You have tiredness, irregular heart beats, or shortness of breath even at rest.",
            ),
        ],
    ),
]


OSA_QUESTIONS = [
    Question("snoring_history", "snoring_history", "Do you have history of snoring?", "Obstructive Sleep Apnoea", "boolean", helper_text="Making noises while sleeping?"),
    Question(
        "stopbang_snore",
        "stopbang_snore",
        "Do you snore loudly?",
        "Obstructive Sleep Apnoea",
        "boolean",
        depends_on={"snoring_history": True},
    ),
    Question(
        "stopbang_tired",
        "stopbang_tired",
        "Do you feel tired during the day?",
        "Obstructive Sleep Apnoea",
        "boolean",
        depends_on={"snoring_history": True},
    ),
    Question(
        "stopbang_observed_apnea",
        "stopbang_observed_apnea",
        "Has anyone seen you stop breathing or gasp during sleep?",
        "Obstructive Sleep Apnoea",
        "boolean",
        depends_on={"snoring_history": True},
    ),
    Question(
        "stopbang_high_pressure_treated",
        "stopbang_high_pressure_treated",
        "Are you being treated for high blood pressure?",
        "Obstructive Sleep Apnoea",
        "boolean",
        depends_on={"snoring_history": True},
    ),
]


RESPIRATORY_QUESTIONS = [
    Question(
        "recent_fever",
        "recent_fever",
        "Did you have any history of fever in the recent past?",
        "Respiratory System",
        "boolean",
    ),
    Question(
        "fever_days",
        "fever_days",
        "How many days?",
        "Respiratory System",
        "integer",
        depends_on={"recent_fever": True},
    ),
    Question(
        "fever_meds",
        "fever_meds",
        "What medications did you take for it?",
        "Respiratory System",
        depends_on={"recent_fever": True},
    ),
    Question(
        "recent_cough",
        "recent_cough",
        "Did you have a history of cough with or without discharge in the recent past?",
        "Respiratory System",
        "boolean",
    ),
    Question(
        "cough_sputum",
        "cough_sputum",
        "Was the discharge discoloured?",
        "Respiratory System",
        "boolean",
        depends_on={"recent_cough": True},
    ),
    Question(
        "wheezing",
        "wheezing",
        "Did you have a history of wheezing?",
        "Respiratory System",
        "boolean",
    ),
    Question(
        "wheezing_treated",
        "wheezing_treated",
        "Did you take any medications for it?",
        "Respiratory System",
        "boolean",
        depends_on={"wheezing": True},
    ),
    Question(
        "mmrc_grade",
        "mmrc_grade",
        "Modified Medical Research Council (MMRC) dyspnoea scale",
        "Respiratory System",
        "choice",
        depends_on={"breathlessness": True},
        options=[
            QuestionOption("0", "Grade 0: I feel breathless only with hard exercise."),
            QuestionOption("1", "Grade 1: I feel short of breath when hurrying on level ground or walking up a slight hill."),
            QuestionOption("2", "Grade 2: I walk slower than people of my age on level ground because of breathlessness."),
            QuestionOption("3", "Grade 3: I stop for breath after walking about 100 metres or after a few minutes on level ground."),
            QuestionOption("4", "Grade 4: I am too breathless to leave the house or I get breathless while dressing."),
        ],
    ),
]


FINAL_QUESTIONS = [
    Question(
        "anesthesiologist_suggestions",
        "anesthesiologist_suggestions",
        "Do you have any suggestions for the anesthesiologist?",
        "Final Notes",
    ),
]


QUESTION_FLOW: list[Question] = [
    *PATIENT_IDENTITY_QUESTIONS,
    *PREVIOUS_HISTORY_QUESTIONS,
    *HEALTH_PROBLEM_QUESTIONS,
    *ALLERGY_AND_HABIT_QUESTIONS,
    *CARDIOVASCULAR_QUESTIONS,
    *OSA_QUESTIONS,
    *RESPIRATORY_QUESTIONS,
    *FINAL_QUESTIONS,
]


QUESTION_MAP = {question.id: question for question in QUESTION_FLOW}


def is_skip_answer(raw_answer: str) -> bool:
    normalized = raw_answer.strip().lower()
    return normalized in SKIP_VALUES


def missing_compound_fields(question_id: str, answers: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    for field_name in COMPOUND_QUESTION_FIELDS.get(question_id, ()):
        value = answers.get(field_name)
        if value is None or value == "":
            missing.append(field_name)
    return missing


def join_missing_labels(labels: list[str]) -> str:
    if not labels:
        return ""
    if len(labels) == 1:
        return labels[0]
    if len(labels) == 2:
        return f"{labels[0]} and {labels[1]}"
    return f"{', '.join(labels[:-1])}, and {labels[-1]}"


def compound_followup_text(question_id: str, answers: dict[str, Any]) -> str:
    missing = missing_compound_fields(question_id, answers)
    labels = [COMPOUND_QUESTION_LABELS[question_id][field] for field in missing]
    if question_id == "smoking_details":
        if missing:
            return f"Thank you. I still need {join_missing_labels(labels)}."
        return "Could you mention the number of years of this habit, packs per day and the last puff?"
    if question_id == "alcohol_details":
        if missing:
            return f"Thank you. I still need {join_missing_labels(labels)}."
        return "Could you please mention the number of years of this habit and the last drink?"
    return QUESTION_MAP[question_id].text


def body_metrics_missing_fields(answers: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    if answers.get("weight_kg") is None:
        missing.append("weight_kg")
    if answers.get("height_cm") is None:
        missing.append("height_cm")
    return missing


def body_metrics_followup_text(answers: dict[str, Any] | None = None) -> str:
    active_answers = answers or {}
    missing = body_metrics_missing_fields(active_answers)
    if missing == ["weight_kg"]:
        return "Thank you. I still need your weight in kilograms."
    if missing == ["height_cm"]:
        return "Thank you. I still need your height in centimeters."
    if active_answers.get("weight_kg") is not None or active_answers.get("height_cm") is not None:
        return "Thank you. I still need both your weight in kilograms and your height in centimeters."
    return "Please tell me both your weight in kilograms and your height in centimeters."


def extract_years_value(raw_answer: str) -> float | None:
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b", raw_answer)
    return round(float(match.group(1)), 2) if match else None


def extract_packs_per_day_value(raw_answer: str) -> float | None:
    match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:packs?\s*(?:/|per)?\s*day|packs?\s*a\s*day|pack\s*(?:/|per)\s*day|pack\s*a\s*day)\b",
        raw_answer,
    )
    return round(float(match.group(1)), 2) if match else None


def extract_time_reference(raw_answer: str, *, keywords: tuple[str, ...]) -> str | None:
    lowered = raw_answer.strip().lower()

    for keyword in keywords:
        keyword_match = re.search(rf"{keyword}\s*(?:was|is|:)?\s*(.+)", lowered)
        if keyword_match:
            candidate = keyword_match.group(1).strip(" ,.;:-")
            if candidate:
                return candidate

    for pattern in TIME_REFERENCE_PATTERNS:
        match = re.search(pattern, lowered)
        if match:
            return match.group(0).strip(" ,.;:-")

    if lowered and not re.search(r"\d", lowered):
        cleaned = re.sub(r"\b(?:and|about|around|approximately|approx|for|since|it was|it is)\b", " ", lowered)
        candidate = re.sub(r"\s+", " ", cleaned).strip(" ,.;:-")
        if candidate:
            return candidate

    return None


def parse_compound_question(question: Question, raw_answer: str, answers: dict[str, Any] | None = None) -> dict[str, Any]:
    active_answers = answers or {}
    lowered = raw_answer.strip().lower()
    parsed: dict[str, Any] = {}

    if question.id == "smoking_details":
        years = extract_years_value(lowered)
        packs_per_day = extract_packs_per_day_value(lowered)
        last_puff = extract_time_reference(lowered, keywords=("last puff", "last smoke", "last cigarette"))

        if years is not None:
            parsed["smoking_years"] = years
        if packs_per_day is not None:
            parsed["smoking_packs_per_day"] = packs_per_day
        if last_puff:
            parsed["smoking_last_puff"] = last_puff

        missing_before = missing_compound_fields(question.id, active_answers)
        numbers = extract_numbers(lowered)
        if len(numbers) == 1:
            numeric_missing = [field for field in missing_before if field in {"smoking_years", "smoking_packs_per_day"}]
            if len(numeric_missing) == 1 and numeric_missing[0] not in parsed:
                parsed[numeric_missing[0]] = round(numbers[0], 2)

        return parsed

    if question.id == "alcohol_details":
        years = extract_years_value(lowered)
        last_drink = extract_time_reference(lowered, keywords=("last drink",))

        if years is not None:
            parsed["alcohol_years"] = years
        if last_drink:
            parsed["alcohol_last_drink"] = last_drink

        missing_before = missing_compound_fields(question.id, active_answers)
        numbers = extract_numbers(lowered)
        if len(numbers) == 1 and missing_before == ["alcohol_years"] and "alcohol_years" not in parsed:
            parsed["alcohol_years"] = round(numbers[0], 2)

        return parsed

    return {}


def compound_answer_summary(question_id: str, answers: dict[str, Any]) -> str:
    if question_id == "smoking_details":
        return (
            f"{display_number(answers['smoking_years'])} years, "
            f"{display_number(answers['smoking_packs_per_day'])} packs per day, "
            f"last puff: {answers['smoking_last_puff']}"
        )
    if question_id == "alcohol_details":
        return f"{display_number(answers['alcohol_years'])} years, last drink: {answers['alcohol_last_drink']}"
    return ""


def extract_numbers(raw_answer: str) -> list[float]:
    return [float(match) for match in re.findall(r"\d+(?:\.\d+)?", raw_answer)]


def display_number(value: float | int) -> str:
    numeric = float(value)
    return str(int(numeric)) if numeric.is_integer() else str(round(numeric, 2))


NUMERIC_FILLER_WORDS = {
    "i",
    "im",
    "m",
    "am",
    "my",
    "it",
    "is",
    "was",
    "were",
    "have",
    "has",
    "had",
    "been",
    "for",
    "since",
    "about",
    "around",
    "approximately",
    "approx",
    "roughly",
    "only",
    "just",
    "number",
    "no",
    "the",
    "of",
    "this",
    "that",
    "there",
    "are",
    "were",
}


def numeric_question_rules(question: Question) -> tuple[set[str], float | None, float | None]:
    allowed_words = set(NUMERIC_FILLER_WORDS)
    min_value: float | None = None
    max_value: float | None = None
    lowered_text = question.text.lower()

    if question.id == "patient_age":
        allowed_words.update({"age", "aged", "old", "year", "years", "yr", "yrs"})
        min_value = 0
        max_value = 120
    elif question.id == "previous_surgery_year":
        allowed_words.update({"year", "years", "in"})
        min_value = 1900
        max_value = 2100
    elif question.field.endswith("_duration_years"):
        allowed_words.update({"year", "years", "yr", "yrs", "past"})
        min_value = 0
        max_value = 120
    elif question.field.endswith("_days") or "how many days" in lowered_text or "number of days" in lowered_text:
        allowed_words.update({"day", "days"})
        min_value = 0
        max_value = 3650
    elif question.field == "dialysis_cycles":
        allowed_words.update({"cycle", "cycles", "session", "sessions", "time", "times"})
        min_value = 0
        max_value = 10000

    return allowed_words, min_value, max_value


def numeric_validation_message(question: Question) -> str:
    if question.id == "patient_age":
        return "I need your age as a number in years. For example, 42."
    if question.id == "previous_surgery_year":
        return "I need the year as a 4-digit number. For example, 2020."
    if question.field.endswith("_duration_years"):
        return "I need the number of years only. For example, 5 or 5 years."
    if question.field.endswith("_days") or "how many days" in question.text.lower() or "number of days" in question.text.lower():
        return "I need the number of days only. For example, 3."
    if question.field == "dialysis_cycles":
        return "I need the number of dialysis cycles only. For example, 4."
    return "I need a number for this answer."


def parse_body_metrics(raw_answer: str, answers: dict[str, Any] | None = None) -> dict[str, float]:
    lowered = raw_answer.strip().lower()
    active_answers = answers or {}
    parsed: dict[str, float] = {}

    weight_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram|kilograms)\b", lowered)
    height_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:cm|cms|centimeter|centimeters)\b", lowered)

    if weight_match:
        parsed["weight_kg"] = round(float(weight_match.group(1)), 2)
    if height_match:
        parsed["height_cm"] = round(float(height_match.group(1)), 2)

    numbers = extract_numbers(lowered)
    if len(numbers) >= 2:
        if "weight_kg" not in parsed and min(numbers[0], numbers[1]) <= 300:
            parsed["weight_kg"] = round(min(numbers[0], numbers[1]), 2)
        if "height_cm" not in parsed and max(numbers[0], numbers[1]) <= 300:
            parsed["height_cm"] = round(max(numbers[0], numbers[1]), 2)
    elif len(numbers) == 1:
        value = round(numbers[0], 2)
        missing = body_metrics_missing_fields(active_answers)
        if missing == ["weight_kg"]:
            parsed["weight_kg"] = value
        elif missing == ["height_cm"]:
            parsed["height_cm"] = value
        elif "weight" in lowered and value <= 300:
            parsed["weight_kg"] = value
        elif "height" in lowered and value <= 300:
            parsed["height_cm"] = value
        elif value <= 100:
            parsed["weight_kg"] = value
        elif value > 100:
            parsed["height_cm"] = value

    return parsed


def render_question_text(question: Question, answers: dict[str, Any] | None = None) -> str:
    if question.id == "body_metrics":
        return body_metrics_followup_text(answers)
    if question.id in COMPOUND_QUESTION_FIELDS:
        return compound_followup_text(question.id, answers or {})
    return question.text.strip()


def format_question_prompt(question: Question, answers: dict[str, Any] | None = None) -> str:
    parts = [render_question_text(question, answers)]
    if question.helper_text:
        if question.id != "body_metrics" or not (answers and (answers.get("weight_kg") is not None or answers.get("height_cm") is not None)):
            parts.append(question.helper_text.strip())
    if question.options:
        parts.extend(option.label.strip() for option in question.options)
    return "\n".join(part for part in parts if part)


def question_to_payload(question: Question, answers: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = asdict(question)
    payload["options"] = [asdict(option) for option in question.options]
    payload["text"] = render_question_text(question, answers)
    if question.id == "body_metrics" and answers and (answers.get("weight_kg") is not None or answers.get("height_cm") is not None):
        payload["helper_text"] = None
    if question.id in COMPOUND_QUESTION_FIELDS and answers and len(missing_compound_fields(question.id, answers)) < len(
        COMPOUND_QUESTION_FIELDS[question.id]
    ):
        payload["helper_text"] = None
    payload["prompt_text"] = format_question_prompt(question, answers)
    return payload


def parse_boolean(raw_answer: str) -> bool | None:
    normalized = raw_answer.strip().lower()
    if normalized in YES_VALUES:
        return True
    if normalized in NO_VALUES:
        return False
    if "yes" in normalized:
        return True
    if "no" in normalized:
        return False
    return None


def parse_numeric(raw_answer: str, integer_only: bool = False) -> int | float | None:
    cleaned = raw_answer.strip().lower()
    numbers = extract_numbers(cleaned)
    if len(numbers) != 1:
        return None
    value = numbers[0]
    if integer_only:
        return int(round(value))
    return round(value, 2)


def parse_numeric_question(question: Question, raw_answer: str) -> int | float | None:
    cleaned = raw_answer.strip().lower()
    allowed_words, min_value, max_value = numeric_question_rules(question)
    words = re.findall(r"[a-z]+", cleaned)

    if any(word not in allowed_words for word in words):
        return None

    parsed = parse_numeric(cleaned, integer_only=question.input_type == "integer")
    if parsed is None:
        return None

    value = float(parsed)
    if min_value is not None and value < min_value:
        return None
    if max_value is not None and value > max_value:
        return None
    return parsed


def invalid_answer_message(question: Question, raw_answer: str, parsed_answer: Any) -> str | None:
    cleaned = raw_answer.strip()
    if not cleaned:
        return None
    if question.input_type in {"integer", "number"} and parsed_answer is None:
        return numeric_validation_message(question)
    if question.input_type == "body_metrics" and isinstance(parsed_answer, dict) and not parsed_answer:
        return "I need your weight and height as numbers. For example, 68 kg and 162 cm."
    return None


def parse_choice(question: Question, raw_answer: str) -> str:
    normalized = raw_answer.strip().lower()
    normalized_compact = re.sub(r"[^a-z0-9]+", " ", normalized).strip()
    for option in question.options:
        option_value = option.value.lower()
        option_label = option.label.lower()
        option_value_compact = re.sub(r"[^a-z0-9]+", " ", option_value).strip()
        option_label_compact = re.sub(r"[^a-z0-9]+", " ", option_label).strip()

        if normalized == option_value or normalized == option_label:
            return option.value
        if normalized_compact == option_value_compact or normalized_compact == option_label_compact:
            return option.value
        if option_value_compact and (
            normalized_compact.startswith(option_value_compact) or option_value_compact.startswith(normalized_compact)
        ):
            return option.value
        if option_label_compact and (
            normalized_compact.startswith(option_label_compact) or option_label_compact.startswith(normalized_compact)
        ):
            return option.value
        if option_value_compact and re.search(rf"(?<!\w){re.escape(option_value_compact)}(?!\w)", normalized_compact):
            return option.value
        if option_label_compact and re.search(rf"(?<!\w){re.escape(option_label_compact)}(?!\w)", normalized_compact):
            return option.value
    return raw_answer.strip()


def parse_answer(question: Question, raw_answer: str, answers: dict[str, Any] | None = None) -> Any:
    if question.optional and is_skip_answer(raw_answer):
        return None
    if question.input_type == "body_metrics":
        return parse_body_metrics(raw_answer, answers)
    if question.id in COMPOUND_QUESTION_FIELDS:
        return parse_compound_question(question, raw_answer, answers)
    if question.input_type == "boolean":
        parsed = parse_boolean(raw_answer)
        return parsed if parsed is not None else raw_answer.strip()
    if question.input_type == "integer":
        return parse_numeric_question(question, raw_answer)
    if question.input_type == "number":
        return parse_numeric_question(question, raw_answer)
    if question.input_type == "choice":
        return parse_choice(question, raw_answer)
    return raw_answer.strip()


def apply_parsed_answer(question: Question, answers: dict[str, Any], parsed_answer: Any) -> None:
    if question.id == "body_metrics":
        metrics = parsed_answer if isinstance(parsed_answer, dict) else {}
        if "weight_kg" in metrics:
            answers["weight_kg"] = metrics["weight_kg"]
        if "height_cm" in metrics:
            answers["height_cm"] = metrics["height_cm"]
        if not body_metrics_missing_fields(answers):
            answers["body_metrics"] = True
        else:
            answers.pop("body_metrics", None)
        return

    if question.id in COMPOUND_QUESTION_FIELDS:
        details = parsed_answer if isinstance(parsed_answer, dict) else {}
        for field_name, value in details.items():
            if value is not None:
                answers[field_name] = value
        if not missing_compound_fields(question.id, answers):
            answers[question.field] = compound_answer_summary(question.id, answers)
        else:
            answers.pop(question.field, None)
        return

    answers[question.field] = parsed_answer


def is_question_complete(question: Question, answers: dict[str, Any]) -> bool:
    if question.id == "body_metrics":
        return not body_metrics_missing_fields(answers)
    if question.id in COMPOUND_QUESTION_FIELDS:
        return not missing_compound_fields(question.id, answers)

    if question.input_type == "boolean":
        return isinstance(answers.get(question.field), bool)
    if question.input_type == "choice":
        return answers.get(question.field) in {option.value for option in question.options}
    if question.input_type in {"integer", "number"}:
        value = answers.get(question.field)
        return isinstance(value, (int, float)) and not isinstance(value, bool)

    return question.field in answers


def dependency_matches(current_value: Any, expected_value: Any) -> bool:
    if isinstance(expected_value, (list, tuple, set)):
        return current_value in expected_value
    return current_value == expected_value


def should_ask(question: Question, answers: dict[str, Any]) -> bool:
    for key, expected in question.depends_on.items():
        if not dependency_matches(answers.get(key), expected):
            return False
    return True


def first_question(answers: dict[str, Any] | None = None) -> Question | None:
    active_answers = answers or {}
    for question in QUESTION_FLOW:
        if should_ask(question, active_answers):
            return question
    return None


def next_question(current_question_id: str | None, answers: dict[str, Any]) -> Question | None:
    if current_question_id is None:
        return first_question(answers)

    seen_current = False
    for question in QUESTION_FLOW:
        if not seen_current:
            if question.id == current_question_id:
                seen_current = True
            continue
        if should_ask(question, answers):
            return question
    return None


def visible_questions(answers: dict[str, Any]) -> list[Question]:
    return [question for question in QUESTION_FLOW if should_ask(question, answers)]
