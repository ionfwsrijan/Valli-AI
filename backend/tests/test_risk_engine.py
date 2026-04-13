from app.risk_engine import compute_risk_profile


def test_low_risk_profile_for_healthy_candidate() -> None:
    profile = compute_risk_profile(
        {
            "patient_age": 28,
            "patient_sex": "female",
            "height_cm": 168,
            "weight_kg": 60,
            "fasting_last_solid_hours": 8,
            "fasting_last_clear_liquid_hours": 3,
        }
    )

    assert profile["asa_class"] == "ASA 1"
    assert profile["consolidated_risk"] == "Low Risk"
    assert profile["stop_bang_score"] == 0
    assert "ml_prediction" in profile
    assert "dl_prediction" in profile
    assert "nlp_insights" in profile


def test_higher_risk_profile_for_multi_comorbidity_case() -> None:
    profile = compute_risk_profile(
        {
            "patient_age": 67,
            "patient_sex": "male",
            "height_cm": 170,
            "weight_kg": 108,
            "hypertension": True,
            "diabetes": True,
            "heart_disease": True,
            "chest_pain": True,
            "breathlessness": True,
            "nyha_class": "4",
            "stopbang_snore": True,
            "stopbang_tired": True,
            "stopbang_observed_apnea": True,
            "fasting_last_solid_hours": 4,
            "fasting_last_clear_liquid_hours": 1,
            "airway_limited_mouth_opening": True,
            "airway_limited_neck_extension": True,
            "airway_double_chin": True,
        }
    )

    assert profile["asa_class"] == "ASA 4"
    assert profile["stop_bang_risk"] == "High Risk"
    assert profile["airway_risk"] in {"Potentially Difficult Airway", "High-Risk Airway"}
    assert profile["consolidated_risk"] == "High Risk"
    assert profile["ai_consensus"]["label"] in {"Moderate Risk", "High Risk"}


def test_vision_airway_screen_contributes_to_airway_summary() -> None:
    profile = compute_risk_profile(
        {
            "patient_age": 46,
            "patient_sex": "male",
            "height_cm": 172,
            "weight_kg": 88,
            "vision_airway": {
                "overall": {
                    "status": "available",
                    "label": "Camera assessment suggests difficult-airway features",
                    "bucket": "High Concern",
                    "quality_score": 0.77,
                    "confidence": 0.71,
                    "derived_flags": ["Limited mouth opening cue", "Limited neck extension cue"],
                }
            },
        }
    )

    assert profile["vision_airway"]["overall"]["bucket"] == "High Concern"
    assert any("Camera finding:" in reason for reason in profile["airway_reasons"])
    assert "Camera assessment suggests difficult-airway features" in profile["risk_flags"]
