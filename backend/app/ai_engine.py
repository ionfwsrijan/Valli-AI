from __future__ import annotations

import re
import warnings
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.exceptions import ConvergenceWarning
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


RISK_LABELS = ["Low Risk", "Moderate Risk", "High Risk"]

NEGATION_TOKENS = {"no", "not", "denies", "denied", "without", "never", "none"}

TEXT_FIELDS = [
    "uhid_no",
    "ip_no",
    "preoperative_diagnosis",
    "proposed_procedure",
    "previous_surgery_month",
    "presenting_comorbidity_overview",
    "icu_reason",
    "anesthesia_complication_details",
    "diabetes_meds",
    "hypertension_meds",
    "thyroid_disorder_meds",
    "hypothyroidism_meds",
    "hyperthyroidism_meds",
    "asthma_meds",
    "seizures_meds",
    "heart_disease_meds",
    "kidney_disease_meds",
    "liver_disease_meds",
    "stroke_meds",
    "bleeding_disorder_meds",
    "asthma_last_episode",
    "asthma_inhaler_details",
    "seizures_last_episode",
    "other_present_illness_details",
    "drug_allergies_details",
    "family_history_details",
    "smoking_details",
    "alcohol_details",
    "palpitations_details",
    "fever_meds",
    "previous_surgery_when",
    "final_concerns",
    "anesthesiologist_suggestions",
]

CLINICAL_LEXICON = {
    "respiratory": [
        "breathless",
        "breathlessness",
        "dyspnea",
        "dyspnoea",
        "cough",
        "wheeze",
        "wheezing",
        "asthma",
        "fever",
        "sputum",
        "snore",
        "sleep apnea",
        "apnea",
    ],
    "cardiac": [
        "chest pain",
        "angina",
        "palpitation",
        "palpitations",
        "heart disease",
        "cardiac",
        "stent",
        "heart attack",
        "shortness of breath",
    ],
    "allergy": [
        "allergy",
        "allergic",
        "drug reaction",
        "anaphylaxis",
        "rash",
    ],
    "airway": [
        "difficult airway",
        "difficult intubation",
        "mouth opening",
        "limited mouth opening",
        "limited neck extension",
        "double chin",
        "receded jaw",
        "jaw recession",
        "snoring",
    ],
    "renal": [
        "dialysis",
        "kidney",
        "renal",
    ],
    "neuro": [
        "stroke",
        "seizure",
        "fits",
    ],
    "substance": [
        "smoking",
        "smoker",
        "tobacco",
        "alcohol",
        "drink",
        "drinking",
    ],
    "anesthesia": [
        "icu",
        "delayed recovery",
        "post operative ventilation",
        "ventilator",
        "difficult intubation",
        "spinal",
        "general anesthesia",
        "regional block",
    ],
}

RED_FLAG_TERMS = {
    "anaphylaxis",
    "difficult intubation",
    "icu",
    "dialysis",
    "pacemaker",
    "stent",
    "chest pain",
    "wheezing",
    "breathlessness",
    "allergy",
}

FEATURE_NAMES = [
    "age",
    "bmi",
    "nyha_class",
    "mmrc_grade",
    "stopbang_count",
    "fasting_last_solid_hours",
    "fasting_last_clear_liquid_hours",
    "diabetes",
    "hypertension",
    "thyroid_disorder",
    "asthma",
    "seizures",
    "heart_disease",
    "kidney_disease",
    "liver_disease",
    "stroke_history",
    "smoking_history",
    "alcohol_history",
    "drug_allergies",
    "previous_surgery",
    "icu_after_previous_surgery",
    "anesthesia_complication_history",
    "stent_history",
    "pacemaker_implants",
    "on_dialysis",
    "breathlessness",
    "chest_pain",
    "recent_fever",
    "recent_cough",
    "wheezing",
    "airway_limited_mouth_opening",
    "airway_limited_neck_extension",
    "airway_double_chin",
    "airway_jaw_recession",
    "vision_airway_high_concern",
    "vision_airway_needs_review",
    "vision_airway_quality",
    "vision_airway_flag_count",
    "nlp_respiratory_mentions",
    "nlp_cardiac_mentions",
    "nlp_allergy_mentions",
    "nlp_airway_mentions",
    "nlp_substance_mentions",
    "nlp_red_flag_mentions",
    "medication_field_count",
]

FEATURE_LABELS = {
    "age": "Age above normal adult baseline",
    "bmi": "BMI elevation",
    "nyha_class": "NYHA functional limitation",
    "mmrc_grade": "Respiratory limitation",
    "stopbang_count": "STOP-Bang risk burden",
    "diabetes": "Diabetes",
    "hypertension": "Hypertension",
    "thyroid_disorder": "Thyroid disorder",
    "asthma": "Asthma",
    "seizures": "Seizure disorder",
    "heart_disease": "Heart disease",
    "kidney_disease": "Kidney disease",
    "liver_disease": "Liver disease",
    "stroke_history": "Stroke history",
    "smoking_history": "Smoking history",
    "drug_allergies": "Drug allergy",
    "icu_after_previous_surgery": "ICU after prior surgery",
    "anesthesia_complication_history": "Prior anesthesia complication",
    "stent_history": "Cardiac stent history",
    "pacemaker_implants": "Implant or pacemaker",
    "on_dialysis": "Dialysis",
    "breathlessness": "Breathlessness",
    "chest_pain": "Chest pain",
    "recent_cough": "Recent cough",
    "wheezing": "Wheezing",
    "airway_limited_mouth_opening": "Limited mouth opening",
    "airway_limited_neck_extension": "Limited neck extension",
    "airway_double_chin": "Submental fullness",
    "airway_jaw_recession": "Jaw recession",
    "vision_airway_high_concern": "Vision screen high-concern cue",
    "vision_airway_needs_review": "Vision screen review cue",
    "vision_airway_flag_count": "Vision-derived airway flags",
    "nlp_respiratory_mentions": "NLP respiratory findings",
    "nlp_cardiac_mentions": "NLP cardiac findings",
    "nlp_allergy_mentions": "NLP allergy findings",
    "nlp_airway_mentions": "NLP airway findings",
    "nlp_red_flag_mentions": "NLP red-flag phrases",
}


@dataclass(frozen=True)
class ModelBundle:
    feature_names: list[str]
    ml_model: RandomForestClassifier
    dl_model: Pipeline


def as_bool(value: Any) -> int:
    return 1 if value is True else 0


def as_float(value: Any, default: float = 0.0) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return default
    return default


def as_int(value: Any, default: int = 0) -> int:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value))
        except ValueError:
            return default
    return default


def compute_bmi(weight_kg: Any, height_cm: Any) -> float:
    weight = as_float(weight_kg)
    height = as_float(height_cm)
    if weight <= 0 or height <= 0:
        return 0.0
    height_m = height / 100
    return round(weight / (height_m * height_m), 1)


def stopbang_count(answers: dict[str, Any], bmi: float) -> int:
    age = as_int(answers.get("patient_age"))
    sex = str(answers.get("patient_sex") or "").lower()
    treated_hypertension = as_bool(answers.get("stopbang_high_pressure_treated")) or as_bool(answers.get("hypertension"))
    bmi_over_35 = as_bool(answers.get("stopbang_bmi_above_35")) or int(bmi >= 35)
    age_over_50 = as_bool(answers.get("stopbang_age_above_50")) or int(age > 50)
    male_sex = as_bool(answers.get("stopbang_male")) or int(sex == "male")
    signals = [
        as_bool(answers.get("stopbang_snore")),
        as_bool(answers.get("stopbang_tired")),
        as_bool(answers.get("stopbang_observed_apnea")),
        treated_hypertension,
        bmi_over_35,
        age_over_50,
        as_bool(answers.get("neck_circumference_gt_40")),
        male_sex,
    ]
    return int(sum(signals))


def normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower())


def sentence_tokens(text: str) -> list[list[str]]:
    sentences = re.split(r"[.!?\n;]+", text)
    return [normalize_text(sentence).split() for sentence in sentences if sentence.strip()]


def phrase_detected(tokens: list[str], phrase: str) -> bool:
    phrase_tokens = normalize_text(phrase).split()
    if not phrase_tokens or len(tokens) < len(phrase_tokens):
        return False

    end_limit = len(tokens) - len(phrase_tokens) + 1
    for start in range(end_limit):
        if tokens[start : start + len(phrase_tokens)] == phrase_tokens:
            context = tokens[max(0, start - 3) : start]
            if any(token in NEGATION_TOKENS for token in context):
                continue
            return True
    return False


def collect_text(answers: dict[str, Any]) -> str:
    snippets: list[str] = []
    for field in TEXT_FIELDS:
        value = answers.get(field)
        if isinstance(value, str) and value.strip():
            snippets.append(value.strip())
    return ". ".join(snippets)


def medication_mentions(answers: dict[str, Any]) -> list[str]:
    mentions: list[str] = []
    for key, value in answers.items():
        if key.endswith("_meds") and isinstance(value, str) and value.strip():
            mentions.append(value.strip())
    return mentions[:6]


def vision_airway_overall(answers: dict[str, Any]) -> dict[str, Any]:
    vision = answers.get("vision_airway")
    if not isinstance(vision, dict):
        return {}
    overall = vision.get("overall")
    return overall if isinstance(overall, dict) else {}


def extract_nlp_insights(answers: dict[str, Any]) -> dict[str, Any]:
    text = collect_text(answers)
    tokenized = sentence_tokens(text)
    category_counts = {category: 0 for category in CLINICAL_LEXICON}
    concepts: set[str] = set()
    red_flags: set[str] = set()

    for sentence in tokenized:
        for category, phrases in CLINICAL_LEXICON.items():
            for phrase in phrases:
                if phrase_detected(sentence, phrase):
                    category_counts[category] += 1
                    concepts.add(phrase)
                    if phrase in RED_FLAG_TERMS:
                        red_flags.add(phrase)

    return {
        "source_text_length": len(text),
        "category_counts": category_counts,
        "detected_concepts": sorted(concepts),
        "red_flag_terms": sorted(red_flags),
        "medication_mentions": medication_mentions(answers),
    }


def build_feature_map(answers: dict[str, Any], nlp_insights: dict[str, Any]) -> dict[str, float]:
    bmi = compute_bmi(answers.get("weight_kg"), answers.get("height_cm"))
    category_counts = nlp_insights["category_counts"]
    vision = vision_airway_overall(answers)
    vision_flags = vision.get("derived_flags") if isinstance(vision.get("derived_flags"), list) else []
    vision_bucket = str(vision.get("bucket") or "")
    feature_map = {
        "age": float(as_int(answers.get("patient_age"))),
        "bmi": float(bmi),
        "nyha_class": float(as_int(answers.get("nyha_class"))),
        "mmrc_grade": float(as_int(answers.get("mmrc_grade"))),
        "stopbang_count": float(stopbang_count(answers, bmi)),
        "fasting_last_solid_hours": float(as_float(answers.get("fasting_last_solid_hours"), 8.0)),
        "fasting_last_clear_liquid_hours": float(as_float(answers.get("fasting_last_clear_liquid_hours"), 3.0)),
        "diabetes": float(as_bool(answers.get("diabetes"))),
        "hypertension": float(as_bool(answers.get("hypertension"))),
        "thyroid_disorder": float(
            as_bool(answers.get("thyroid_disorder"))
            or as_bool(answers.get("hypothyroidism"))
            or as_bool(answers.get("hyperthyroidism"))
        ),
        "asthma": float(as_bool(answers.get("asthma"))),
        "seizures": float(as_bool(answers.get("seizures"))),
        "heart_disease": float(as_bool(answers.get("heart_disease"))),
        "kidney_disease": float(as_bool(answers.get("kidney_disease"))),
        "liver_disease": float(as_bool(answers.get("liver_disease"))),
        "stroke_history": float(as_bool(answers.get("stroke_history"))),
        "smoking_history": float(as_bool(answers.get("smoking_history"))),
        "alcohol_history": float(as_bool(answers.get("alcohol_history"))),
        "drug_allergies": float(as_bool(answers.get("drug_allergies"))),
        "previous_surgery": float(as_bool(answers.get("previous_surgery"))),
        "icu_after_previous_surgery": float(as_bool(answers.get("icu_after_previous_surgery"))),
        "anesthesia_complication_history": float(as_bool(answers.get("anesthesia_complication_history"))),
        "stent_history": float(as_bool(answers.get("stent_history"))),
        "pacemaker_implants": float(as_bool(answers.get("pacemaker_implants"))),
        "on_dialysis": float(as_bool(answers.get("on_dialysis"))),
        "breathlessness": float(as_bool(answers.get("breathlessness"))),
        "chest_pain": float(as_bool(answers.get("chest_pain"))),
        "recent_fever": float(as_bool(answers.get("recent_fever"))),
        "recent_cough": float(as_bool(answers.get("recent_cough"))),
        "wheezing": float(as_bool(answers.get("wheezing"))),
        "airway_limited_mouth_opening": float(as_bool(answers.get("airway_limited_mouth_opening"))),
        "airway_limited_neck_extension": float(as_bool(answers.get("airway_limited_neck_extension"))),
        "airway_double_chin": float(as_bool(answers.get("airway_double_chin"))),
        "airway_jaw_recession": float(as_bool(answers.get("airway_jaw_recession"))),
        "vision_airway_high_concern": float(vision_bucket == "High Concern"),
        "vision_airway_needs_review": float(vision_bucket == "Needs Review"),
        "vision_airway_quality": float(as_float(vision.get("quality_score"))),
        "vision_airway_flag_count": float(len(vision_flags)),
        "nlp_respiratory_mentions": float(category_counts["respiratory"]),
        "nlp_cardiac_mentions": float(category_counts["cardiac"]),
        "nlp_allergy_mentions": float(category_counts["allergy"]),
        "nlp_airway_mentions": float(category_counts["airway"]),
        "nlp_substance_mentions": float(category_counts["substance"]),
        "nlp_red_flag_mentions": float(len(nlp_insights["red_flag_terms"])),
        "medication_field_count": float(len(nlp_insights["medication_mentions"])),
    }
    return feature_map


def vectorize(feature_map: dict[str, float]) -> np.ndarray:
    return np.array([[feature_map[name] for name in FEATURE_NAMES]], dtype=float)


def risk_index(label: str) -> int:
    return RISK_LABELS.index(label)


def label_from_index(index: int) -> str:
    return RISK_LABELS[int(index)]


def top_active_features(feature_map: dict[str, float]) -> list[str]:
    ranked = sorted(
        (
            (name, value)
            for name, value in feature_map.items()
            if value > 0 and name in FEATURE_LABELS
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    return [FEATURE_LABELS[name] for name, _ in ranked[:5]]


def synthetic_label_from_features(features: dict[str, float]) -> int:
    risk_score = 0
    risk_score += 2 if features["heart_disease"] else 0
    risk_score += 2 if features["kidney_disease"] else 0
    risk_score += 2 if features["liver_disease"] else 0
    risk_score += 2 if features["stroke_history"] else 0
    risk_score += 2 if features["on_dialysis"] else 0
    risk_score += 2 if features["anesthesia_complication_history"] else 0
    risk_score += 1 if features["diabetes"] else 0
    risk_score += 1 if features["hypertension"] else 0
    risk_score += 1 if features["thyroid_disorder"] else 0
    risk_score += 1 if features["breathlessness"] else 0
    risk_score += 1 if features["chest_pain"] else 0
    risk_score += 1 if features["recent_cough"] else 0
    risk_score += 1 if features["wheezing"] else 0
    risk_score += 1 if features["bmi"] >= 35 else 0
    risk_score += 1 if features["stopbang_count"] >= 5 else 0
    risk_score += 2 if features["vision_airway_high_concern"] else 0
    risk_score += 1 if features["vision_airway_needs_review"] else 0
    risk_score += 1 if features["vision_airway_flag_count"] >= 2 else 0
    risk_score += 1 if features["fasting_last_solid_hours"] and features["fasting_last_solid_hours"] < 6 else 0
    risk_score += 1 if features["fasting_last_clear_liquid_hours"] and features["fasting_last_clear_liquid_hours"] < 2 else 0
    risk_score += 1 if features["nlp_red_flag_mentions"] >= 1 else 0
    risk_score += 1 if features["nlp_cardiac_mentions"] >= 1 else 0
    risk_score += 1 if features["nyha_class"] >= 3 else 0
    risk_score += 1 if features["mmrc_grade"] >= 3 else 0

    if risk_score >= 7:
        return 2
    if risk_score >= 3:
        return 1
    return 0


def synthetic_feature_sample(rng: np.random.Generator) -> dict[str, float]:
    age = float(rng.integers(18, 86))
    male = float(rng.integers(0, 2))
    bmi = float(np.clip(rng.normal(26 + male * 1.5 + max(age - 50, 0) * 0.03, 5.8), 18, 47))
    hypertension = float(rng.random() < min(0.12 + age / 150, 0.78))
    diabetes = float(rng.random() < min(0.08 + age / 180, 0.56))
    thyroid_disorder = float(rng.random() < 0.09)
    heart_disease = float(rng.random() < min(0.04 + age / 220, 0.45))
    kidney_disease = float(rng.random() < 0.05 + hypertension * 0.08 + diabetes * 0.06)
    liver_disease = float(rng.random() < 0.04)
    stroke_history = float(rng.random() < 0.03 + heart_disease * 0.05)
    seizures = float(rng.random() < 0.03)
    asthma = float(rng.random() < 0.08)
    smoking_history = float(rng.random() < 0.18 + male * 0.08)
    alcohol_history = float(rng.random() < 0.15 + male * 0.07)
    drug_allergies = float(rng.random() < 0.08)
    previous_surgery = float(rng.random() < 0.35)
    icu_after_previous_surgery = float(previous_surgery and rng.random() < 0.12)
    anesthesia_complication_history = float(previous_surgery and rng.random() < 0.09)
    stent_history = float(heart_disease and rng.random() < 0.18)
    pacemaker_implants = float(heart_disease and rng.random() < 0.06)
    on_dialysis = float(kidney_disease and rng.random() < 0.18)
    breathlessness = float(rng.random() < 0.12 + heart_disease * 0.18 + asthma * 0.15)
    chest_pain = float(rng.random() < 0.07 + heart_disease * 0.18)
    recent_fever = float(rng.random() < 0.08)
    recent_cough = float(rng.random() < 0.11 + asthma * 0.08 + smoking_history * 0.12)
    wheezing = float(rng.random() < 0.05 + asthma * 0.22 + smoking_history * 0.05)
    limited_mouth = float(rng.random() < 0.06 + (bmi >= 35) * 0.08)
    limited_neck = float(rng.random() < 0.05 + (bmi >= 35) * 0.08)
    double_chin = float(rng.random() < 0.08 + (bmi >= 35) * 0.22)
    jaw_recession = float(rng.random() < 0.04)
    vision_high_concern = float(rng.random() < (0.03 + limited_mouth * 0.22 + limited_neck * 0.22 + double_chin * 0.18))
    vision_needs_review = float((vision_high_concern == 0) and (rng.random() < (0.14 + jaw_recession * 0.18 + double_chin * 0.12)))
    vision_quality = float(np.clip(rng.normal(0.66 - vision_needs_review * 0.08, 0.16), 0.18, 0.96))
    vision_flag_count = float(
        min(
            3,
            int(vision_high_concern * rng.integers(2, 4))
            + int(vision_needs_review * rng.integers(1, 3)),
        )
    )
    stopbang = float(
        (rng.random() < 0.24 + male * 0.08)
        + (rng.random() < 0.20)
        + (rng.random() < 0.12)
        + hypertension
        + float(bmi >= 35)
        + float(age > 50)
        + float(rng.random() < 0.22)
        + male
    )
    nyha = float(rng.choice([0, 1, 2, 3, 4], p=[0.3, 0.3, 0.22, 0.12, 0.06]))
    mmrc = float(rng.choice([0, 1, 2, 3, 4], p=[0.28, 0.3, 0.22, 0.13, 0.07]))
    solids = float(np.clip(rng.normal(7.5, 2.2), 0.5, 14))
    clear_liquids = float(np.clip(rng.normal(3.5, 1.5), 0.2, 8))
    nlp_respiratory = float(rng.poisson(1.2 * (breathlessness + recent_cough + wheezing + asthma)))
    nlp_cardiac = float(rng.poisson(1.1 * (heart_disease + chest_pain + stent_history)))
    nlp_allergy = float(rng.poisson(1.0 * drug_allergies))
    nlp_airway = float(rng.poisson(1.1 * (limited_mouth + limited_neck + double_chin + jaw_recession)))
    nlp_substance = float(rng.poisson(1.0 * (smoking_history + alcohol_history)))
    nlp_red_flags = float(rng.poisson(0.8 * (icu_after_previous_surgery + anesthesia_complication_history + on_dialysis + chest_pain)))
    meds = float(rng.integers(0, 5))

    return {
        "age": age,
        "bmi": bmi,
        "nyha_class": nyha,
        "mmrc_grade": mmrc,
        "stopbang_count": stopbang,
        "fasting_last_solid_hours": solids,
        "fasting_last_clear_liquid_hours": clear_liquids,
        "diabetes": diabetes,
        "hypertension": hypertension,
        "thyroid_disorder": thyroid_disorder,
        "asthma": asthma,
        "seizures": seizures,
        "heart_disease": heart_disease,
        "kidney_disease": kidney_disease,
        "liver_disease": liver_disease,
        "stroke_history": stroke_history,
        "smoking_history": smoking_history,
        "alcohol_history": alcohol_history,
        "drug_allergies": drug_allergies,
        "previous_surgery": previous_surgery,
        "icu_after_previous_surgery": icu_after_previous_surgery,
        "anesthesia_complication_history": anesthesia_complication_history,
        "stent_history": stent_history,
        "pacemaker_implants": pacemaker_implants,
        "on_dialysis": on_dialysis,
        "breathlessness": breathlessness,
        "chest_pain": chest_pain,
        "recent_fever": recent_fever,
        "recent_cough": recent_cough,
        "wheezing": wheezing,
        "airway_limited_mouth_opening": limited_mouth,
        "airway_limited_neck_extension": limited_neck,
        "airway_double_chin": double_chin,
        "airway_jaw_recession": jaw_recession,
        "vision_airway_high_concern": vision_high_concern,
        "vision_airway_needs_review": vision_needs_review,
        "vision_airway_quality": vision_quality,
        "vision_airway_flag_count": vision_flag_count,
        "nlp_respiratory_mentions": nlp_respiratory,
        "nlp_cardiac_mentions": nlp_cardiac,
        "nlp_allergy_mentions": nlp_allergy,
        "nlp_airway_mentions": nlp_airway,
        "nlp_substance_mentions": nlp_substance,
        "nlp_red_flag_mentions": nlp_red_flags,
        "medication_field_count": meds,
    }


@lru_cache(maxsize=1)
def load_model_bundle() -> ModelBundle:
    rng = np.random.default_rng(42)
    rows: list[list[float]] = []
    labels: list[int] = []

    for _ in range(1600):
        feature_map = synthetic_feature_sample(rng)
        rows.append([feature_map[name] for name in FEATURE_NAMES])
        labels.append(synthetic_label_from_features(feature_map))

    X = np.array(rows, dtype=float)
    y = np.array(labels, dtype=int)

    ml_model = RandomForestClassifier(
        n_estimators=180,
        max_depth=10,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced_subsample",
    )
    ml_model.fit(X, y)

    dl_model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "mlp",
                MLPClassifier(
                    hidden_layer_sizes=(64, 32, 16),
                    activation="relu",
                    solver="adam",
                    alpha=0.0008,
                    learning_rate_init=0.002,
                    max_iter=450,
                    random_state=42,
                ),
            ),
        ]
    )
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", ConvergenceWarning)
        dl_model.fit(X, y)

    return ModelBundle(feature_names=FEATURE_NAMES, ml_model=ml_model, dl_model=dl_model)


def prediction_payload(probabilities: np.ndarray) -> dict[str, Any]:
    labels_with_scores = [
        {"label": label_from_index(index), "probability": round(float(score), 4)}
        for index, score in enumerate(probabilities.tolist())
    ]
    best_index = int(np.argmax(probabilities))
    return {
        "label": label_from_index(best_index),
        "confidence": round(float(probabilities[best_index]), 4),
        "probabilities": labels_with_scores,
    }


def hybrid_ai_assessment(answers: dict[str, Any]) -> dict[str, Any]:
    nlp_insights = extract_nlp_insights(answers)
    feature_map = build_feature_map(answers, nlp_insights)
    vector = vectorize(feature_map)
    models = load_model_bundle()

    ml_probs = models.ml_model.predict_proba(vector)[0]
    dl_probs = models.dl_model.predict_proba(vector)[0]
    consensus_probs = (ml_probs + dl_probs) / 2

    ml_prediction = prediction_payload(ml_probs)
    dl_prediction = prediction_payload(dl_probs)
    consensus_prediction = prediction_payload(consensus_probs)

    return {
        "feature_highlights": top_active_features(feature_map),
        "ml_prediction": ml_prediction,
        "dl_prediction": dl_prediction,
        "ai_consensus": consensus_prediction,
        "nlp_insights": nlp_insights,
    }
