from app.ai_engine import hybrid_ai_assessment


def test_hybrid_ai_assessment_returns_ml_dl_and_nlp_outputs() -> None:
    result = hybrid_ai_assessment(
        {
            "patient_age": 63,
            "patient_sex": "male",
            "height_cm": 171,
            "weight_kg": 102,
            "heart_disease": True,
            "breathlessness": True,
            "chest_pain": True,
            "drug_allergies": True,
            "drug_allergies_details": "Allergic to penicillin and had a rash before.",
            "anesthesia_complication_details": "Previous difficult intubation and ICU stay after surgery.",
            "final_concerns": "I also snore loudly and get breathless when walking.",
        }
    )

    assert result["ml_prediction"]["label"] in {"Low Risk", "Moderate Risk", "High Risk"}
    assert result["dl_prediction"]["label"] in {"Low Risk", "Moderate Risk", "High Risk"}
    assert isinstance(result["ml_prediction"]["confidence"], float)
    assert isinstance(result["dl_prediction"]["confidence"], float)
    assert "allergy" in result["nlp_insights"]["category_counts"]
    assert "difficult intubation" in result["nlp_insights"]["detected_concepts"]
