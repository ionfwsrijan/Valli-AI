from __future__ import annotations

from typing import Any

from .ai_engine import hybrid_ai_assessment


COMORBIDITY_LABELS = {
    "diabetes": "Diabetes",
    "hypertension": "Hypertension",
    "thyroid_disorder": "Thyroid disorder",
    "asthma": "Asthma",
    "seizures": "Seizure disorder",
    "heart_disease": "Heart disease",
    "kidney_disease": "Kidney disease",
    "liver_disease": "Liver disease",
    "stroke_history": "Stroke history",
    "bleeding_disorder": "Bleeding disorder",
}


def as_bool(value: Any) -> bool:
    return value is True


def as_float(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None


def as_int(value: Any) -> int | None:
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return None


def compute_bmi(weight_kg: Any, height_cm: Any) -> float | None:
    weight = as_float(weight_kg)
    height = as_float(height_cm)
    if not weight or not height or height <= 0:
        return None
    height_m = height / 100
    return round(weight / (height_m * height_m), 1)


def derive_stop_bang_score(answers: dict[str, Any], bmi: float | None) -> tuple[int, list[str]]:
    age = as_int(answers.get("patient_age")) or 0
    sex = str(answers.get("patient_sex") or "").lower()
    score = 0
    positive_items: list[str] = []
    vision = vision_airway_overall(answers)
    vision_flags = vision.get("derived_flags") if isinstance(vision, dict) and isinstance(vision.get("derived_flags"), list) else []

    treated_hypertension = as_bool(answers.get("stopbang_high_pressure_treated")) or as_bool(answers.get("hypertension"))
    bmi_over_35 = (bmi or 0) >= 35
    age_over_50 = age > 50
    male_sex = sex == "male"
    vision_neck_girth_risk = (
        "Neck girth cue" in vision_flags or "Estimated neck circumference above 40 cm" in vision_flags
    )

    checks = {
        "Snoring": as_bool(answers.get("stopbang_snore")),
        "Daytime tiredness": as_bool(answers.get("stopbang_tired")),
        "Observed apnea": as_bool(answers.get("stopbang_observed_apnea")),
        "Treated hypertension": treated_hypertension,
        "BMI above 35": bmi_over_35,
        "Age above 50": age_over_50,
        "Neck circumference above 40 cm": vision_neck_girth_risk,
        "Male sex": male_sex,
    }

    for label, passed in checks.items():
        if passed:
            score += 1
            positive_items.append(label)

    return score, positive_items


def stop_bang_risk(score: int) -> str:
    if score >= 5:
        return "High Risk"
    if score >= 3:
        return "Intermediate Risk"
    return "Low Risk"


def vision_airway_overall(answers: dict[str, Any]) -> dict[str, Any] | None:
    vision = answers.get("vision_airway")
    if not isinstance(vision, dict):
        return None
    overall = vision.get("overall")
    return overall if isinstance(overall, dict) else None


def vision_airway_points(answers: dict[str, Any]) -> tuple[int, list[str]]:
    overall = vision_airway_overall(answers)
    if not overall:
        return 0, []

    reasons: list[str] = []
    bucket = overall.get("bucket")
    derived_flags = overall.get("derived_flags") if isinstance(overall.get("derived_flags"), list) else []

    for item in derived_flags[:3]:
        reasons.append(f"Camera finding: {item}.")

    if overall.get("status") == "insufficient_quality":
        reasons.append("Camera image quality was limited; repeat capture or direct airway exam is recommended.")
        return 1, reasons

    if bucket == "High Concern":
        return 2, reasons
    if bucket == "Needs Review":
        return 1, reasons
    return 0, reasons


def airway_prediction(answers: dict[str, Any], bmi: float | None, stop_bang: int) -> tuple[str, int, list[str]]:
    indicators = {
        "Limited mouth opening": as_bool(answers.get("airway_limited_mouth_opening")),
        "Limited neck extension": as_bool(answers.get("airway_limited_neck_extension")),
        "Double chin / submental fullness": as_bool(answers.get("airway_double_chin")),
        "Jaw recession": as_bool(answers.get("airway_jaw_recession")),
        "BMI above 35": (bmi or 0) >= 35,
        "STOP-Bang high-risk range": stop_bang >= 5,
    }
    score = 0
    active: list[str] = []
    for label, present in indicators.items():
        if present:
            score += 1
            active.append(label)

    vision_points, vision_reasons = vision_airway_points(answers)
    score += vision_points
    active.extend(vision_reasons)

    if score >= 4:
        return "High-Risk Airway", score, active
    if score >= 2:
        return "Potentially Difficult Airway", score, active
    return "Airway Likely Uncomplicated", score, active


def derive_asa_class(answers: dict[str, Any], bmi: float | None) -> tuple[str, list[str]]:
    rationales: list[str] = []
    mild_flags = [
        as_bool(answers.get("diabetes")),
        as_bool(answers.get("hypertension")),
        as_bool(answers.get("thyroid_disorder")) or as_bool(answers.get("hypothyroidism")) or as_bool(answers.get("hyperthyroidism")),
        as_bool(answers.get("asthma")),
        as_bool(answers.get("bleeding_disorder")),
        as_bool(answers.get("smoking_history")),
        as_bool(answers.get("alcohol_history")),
        (bmi or 0) >= 30,
    ]
    severe_systemic = any(
        [
            as_bool(answers.get("heart_disease")),
            as_bool(answers.get("kidney_disease")),
            as_bool(answers.get("liver_disease")),
            as_bool(answers.get("stroke_history")),
            as_bool(answers.get("seizures")),
            as_bool(answers.get("pacemaker_implants")),
            as_bool(answers.get("stent_history")),
        ]
    )
    nyha = as_int(answers.get("nyha_class")) or 0
    mmrc = as_int(answers.get("mmrc_grade")) or 0
    on_dialysis = as_bool(answers.get("on_dialysis"))

    if severe_systemic or on_dialysis or nyha >= 3 or mmrc >= 3 or (bmi or 0) >= 40:
        rationales.append("Systemic disease or reduced functional reserve is present.")
        asa_numeric = 3
    elif any(mild_flags):
        rationales.append("At least one mild systemic risk factor is present.")
        asa_numeric = 2
    else:
        rationales.append("No systemic disease was captured in the interview.")
        asa_numeric = 1

    if (as_bool(answers.get("heart_disease")) and nyha >= 4) or (
        as_bool(answers.get("heart_disease")) and as_bool(answers.get("chest_pain")) and as_bool(answers.get("breathlessness"))
    ):
        rationales.append("Cardiorespiratory symptoms suggest a potentially life-threatening condition.")
        asa_numeric = 4

    return f"ASA {asa_numeric}", rationales


def build_risk_flags(answers: dict[str, Any], bmi: float | None, stop_bang_score: int) -> list[str]:
    flags: list[str] = []

    if as_bool(answers.get("icu_after_previous_surgery")):
        flags.append("Previous surgery required ICU admission")
    if as_bool(answers.get("ventilator_support")):
        flags.append("Previous surgery needed ventilator support")
    if as_bool(answers.get("oxygen_therapy_taken")):
        flags.append("Previous surgery needed oxygen therapy")
    if as_bool(answers.get("anesthesia_complication_history")):
        flags.append("History of anesthesia-related complication")
    if as_bool(answers.get("drug_allergies")):
        flags.append("Drug allergy reported")
    if as_bool(answers.get("stent_history")):
        flags.append("Cardiac stent history")
    if as_bool(answers.get("pacemaker_implants")):
        flags.append("Pacemaker or implant present")
    if as_bool(answers.get("on_dialysis")):
        flags.append("Dialysis history reported")
    if as_bool(answers.get("recent_fever")) or as_bool(answers.get("recent_cough")) or as_bool(answers.get("wheezing")):
        flags.append("Recent respiratory symptoms present")
    if as_bool(answers.get("smoking_history")):
        flags.append("Active or previous smoking history")
    if as_bool(answers.get("heart_disease")) and as_bool(answers.get("chest_pain")):
        flags.append("Cardiac history with chest pain")
    if stop_bang_score >= 5:
        flags.append("High-risk obstructive sleep apnea screen")
    if bmi and bmi >= 35:
        flags.append("Obesity may complicate airway or positioning")

    solids = as_float(answers.get("fasting_last_solid_hours"))
    clear_liquids = as_float(answers.get("fasting_last_clear_liquid_hours"))
    if solids is not None and solids < 6:
        flags.append("Reported solid-food fasting duration is under 6 hours")
    if clear_liquids is not None and clear_liquids < 2:
        flags.append("Reported clear-liquid fasting duration is under 2 hours")

    vision = vision_airway_overall(answers)
    if vision:
        if vision.get("bucket") == "High Concern":
            flags.append("Camera assessment suggests difficult-airway features")
        elif vision.get("bucket") == "Needs Review":
            flags.append("Camera assessment recommends clinician review or repeat capture")

    return flags


def consolidated_risk(asa_class: str, airway: str, flags: list[str], stop_bang_score: int) -> str:
    if asa_class == "ASA 4" or airway == "High-Risk Airway" or stop_bang_score >= 5:
        return "High Risk"
    if asa_class == "ASA 3" or airway == "Potentially Difficult Airway" or len(flags) >= 2:
        return "Moderate Risk"
    return "Low Risk"


def present_conditions(answers: dict[str, Any]) -> list[str]:
    found = [label for key, label in COMORBIDITY_LABELS.items() if as_bool(answers.get(key))]
    if as_bool(answers.get("smoking_history")):
        found.append("Smoking history")
    if as_bool(answers.get("alcohol_history")):
        found.append("Alcohol history")
    return found


def apply_ai_consensus(rule_based_risk: str, ai_consensus_label: str, ai_confidence: float) -> tuple[str, bool]:
    if ai_confidence < 0.58:
        return rule_based_risk, False

    ordering = {"Low Risk": 0, "Moderate Risk": 1, "High Risk": 2}
    if ordering[ai_consensus_label] > ordering[rule_based_risk]:
        return ai_consensus_label, True
    return rule_based_risk, False


def compute_risk_profile(answers: dict[str, Any]) -> dict[str, Any]:
    bmi = compute_bmi(answers.get("weight_kg"), answers.get("height_cm"))
    stop_bang_score_value, stop_bang_positive = derive_stop_bang_score(answers, bmi)
    stop_bang_band = stop_bang_risk(stop_bang_score_value)
    airway_label, airway_score, airway_reasons = airway_prediction(answers, bmi, stop_bang_score_value)
    asa_class, asa_reasons = derive_asa_class(answers, bmi)
    flags = build_risk_flags(answers, bmi, stop_bang_score_value)
    ai_analysis = hybrid_ai_assessment(answers)
    vision = answers.get("vision_airway") if isinstance(answers.get("vision_airway"), dict) else None

    if "difficult intubation" in ai_analysis["nlp_insights"]["red_flag_terms"] and airway_label != "High-Risk Airway":
        airway_label = "High-Risk Airway"
        airway_reasons.append("NLP detected difficult-intubation language in the verbatim history.")

    rule_based_overall_risk = consolidated_risk(asa_class, airway_label, flags, stop_bang_score_value)
    overall_risk, ai_escalated = apply_ai_consensus(
        rule_based_overall_risk,
        ai_analysis["ai_consensus"]["label"],
        ai_analysis["ai_consensus"]["confidence"],
    )

    if ai_escalated:
        flags.append(
            f"AI ensemble elevated risk from {rule_based_overall_risk} to {overall_risk} based on model consensus"
        )

    return {
        "bmi": bmi,
        "asa_class": asa_class,
        "asa_rationale": asa_reasons,
        "airway_risk": airway_label,
        "airway_score": airway_score,
        "airway_reasons": airway_reasons,
        "stop_bang_score": stop_bang_score_value,
        "stop_bang_risk": stop_bang_band,
        "stop_bang_positive_items": stop_bang_positive,
        "risk_flags": flags,
        "baseline_rule_risk": rule_based_overall_risk,
        "consolidated_risk": overall_risk,
        "present_conditions": present_conditions(answers),
        "ml_prediction": ai_analysis["ml_prediction"],
        "dl_prediction": ai_analysis["dl_prediction"],
        "ai_consensus": {
            **ai_analysis["ai_consensus"],
            "elevated_rule_risk": ai_escalated,
        },
        "nlp_insights": ai_analysis["nlp_insights"],
        "ai_feature_highlights": ai_analysis["feature_highlights"],
        "vision_airway": vision,
        "clinical_note": (
            "Assessment summary generated from the recorded history."
            if not vision
            else "Assessment summary generated from the recorded history and the camera airway examination."
        ),
    }
