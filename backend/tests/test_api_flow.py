from fastapi.testclient import TestClient

from app.conversation_router import classify_input
from app.questionnaire import QUESTION_MAP, apply_parsed_answer, is_question_complete, parse_answer, question_to_payload
from app.main import app


def test_session_creation_and_progression() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True})
        assert session.status_code == 200
        payload = session.json()
        assert payload["current_question"]["id"] == "patient_name"
        assert payload["current_question"]["prompt_text"] == "What is your name?"
        assert payload["transcript"][0]["speaker"] == "ai"
        assert payload["transcript"][0]["message"] == "Hello! I am Valli. You may use text or voice for taking the assessment."
        assert payload["transcript"][1]["message"] == "What is your name?"

        progressed = client.post(
            f"/api/sessions/{payload['session_id']}/answer",
            json={"answer_text": "Jane Example"},
        )
        assert progressed.status_code == 200
        progressed_payload = progressed.json()
        assert progressed_payload["answers"]["patient_name"] == "Jane Example"
        assert len(progressed_payload["transcript"]) == 4


def test_questionnaire_defers_airway_exam_to_camera_stage() -> None:
    assert "body_metrics" in QUESTION_MAP
    assert "weight_kg" not in QUESTION_MAP
    assert "height_cm" not in QUESTION_MAP
    assert "airway_limited_mouth_opening" not in QUESTION_MAP
    assert "airway_limited_neck_extension" not in QUESTION_MAP
    assert "airway_double_chin" not in QUESTION_MAP
    assert "airway_jaw_recession" not in QUESTION_MAP
    assert "uhid_no" in QUESTION_MAP
    assert "ip_no" in QUESTION_MAP
    assert QUESTION_MAP["uhid_no"].optional is True
    assert QUESTION_MAP["ip_no"].optional is True
    assert "has_cardiovascular_symptoms" not in QUESTION_MAP
    assert "recent_respiratory_issue" not in QUESTION_MAP
    assert "fasting_last_solid_hours" not in QUESTION_MAP
    assert "fasting_last_clear_liquid_hours" not in QUESTION_MAP
    assert "final_concerns" not in QUESTION_MAP
    assert "stopbang_bmi_above_35" not in QUESTION_MAP
    assert "stopbang_age_above_50" not in QUESTION_MAP
    assert "neck_circumference_gt_40" not in QUESTION_MAP
    assert "stopbang_male" not in QUESTION_MAP
    assert "nyha_class" in QUESTION_MAP
    assert "mmrc_grade" in QUESTION_MAP
    assert "anesthesiologist_suggestions" in QUESTION_MAP
    assert len(QUESTION_MAP["nyha_class"].options) == 4
    assert len(QUESTION_MAP["mmrc_grade"].options) == 5
    assert QUESTION_MAP["patient_sex"].text == "What's your gender?"
    assert "has_presenting_comorbidity" not in QUESTION_MAP
    assert QUESTION_MAP["diabetes"].text == "Do you have diabetes?"
    assert QUESTION_MAP["hypertension"].text == "Do you have high BP (blood pressure)?"
    assert QUESTION_MAP["thyroid_disorder"].text == "Do you have a thyroid disorder?"
    assert QUESTION_MAP["bleeding_disorder"].text == "Do you have any bleeding disorders?"
    assert QUESTION_MAP["preoperative_diagnosis"].text == "What is the pre-operative diagnosis?"
    assert QUESTION_MAP["proposed_procedure"].text == "What is the proposed procedure?"
    assert QUESTION_MAP["palpitations"].text == "Do you have any history of irregular heart beats?"
    assert QUESTION_MAP["recent_fever"].text == "Did you have any history of fever in the recent past?"
    assert QUESTION_MAP["recent_cough"].text == "Did you have a history of cough with or without discharge in the recent past?"
    assert QUESTION_MAP["anesthesiologist_suggestions"].text == "Do you have any suggestions for the anesthesiologist?"


def test_incomplete_sessions_are_hidden_from_records() -> None:
    with TestClient(app) as client:
        started = client.post("/api/sessions", json={"consent_for_ai": True})
        assert started.status_code == 200

        records = client.get("/api/sessions")
        assert records.status_code == 200
        assert records.json() == []


def test_mixed_answer_and_policy_question_keeps_assessment_on_track() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True}).json()
        session = client.post(
            f"/api/sessions/{session['session_id']}/answer",
            json={"answer_text": "Jane Example"},
        ).json()
        assert session["current_question"]["id"] == "patient_age"

        mixed = client.post(
            f"/api/sessions/{session['session_id']}/answer",
            json={"answer_text": "29 and can I drink water before surgery?"},
        )
        assert mixed.status_code == 200
        payload = mixed.json()
        assert payload["answers"]["patient_age"] == 29
        assert payload["current_question"]["id"] == "patient_sex"
        assert payload["current_question"]["text"] == "What's your gender?"
        assert payload["current_question"]["prompt_text"] == "What's your gender?\nMale\nFemale\nOther"
        assert payload["transcript"][-1]["message"] == "What's your gender?\nMale\nFemale\nOther"
        assert any("Hospital policy guidance:" in item["message"] for item in payload["transcript"])


def test_optional_ids_can_be_skipped_and_body_metrics_follow_up_until_complete() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True}).json()
        session_id = session["session_id"]

        for answer in ["Jane Example", "29", "Female"]:
            session = client.post(
                f"/api/sessions/{session_id}/answer",
                json={"answer_text": answer},
            ).json()

        assert session["current_question"]["id"] == "uhid_no"
        assert session["current_question"]["optional"] is True

        session = client.post(
            f"/api/sessions/{session_id}/answer",
            json={"answer_text": "skip"},
        ).json()
        assert session["answers"]["uhid_no"] is None
        assert session["current_question"]["id"] == "ip_no"

        session = client.post(
            f"/api/sessions/{session_id}/answer",
            json={"answer_text": "skip"},
        ).json()
        assert session["answers"]["ip_no"] is None
        assert session["current_question"]["id"] == "body_metrics"

        session = client.post(
            f"/api/sessions/{session_id}/answer",
            json={"answer_text": "68 kg"},
        ).json()
        assert session["answers"]["weight_kg"] == 68
        assert session["current_question"]["id"] == "body_metrics"
        assert session["current_question"]["text"] == "Thank you. I still need your height in centimeters."

        session = client.post(
            f"/api/sessions/{session_id}/answer",
            json={"answer_text": "162 cm"},
        ).json()
        assert session["answers"]["height_cm"] == 162
        assert session["answers"]["body_metrics"] is True
        assert session["current_question"]["id"] == "preoperative_diagnosis"


def test_choice_answers_do_not_trigger_policy_routing() -> None:
    nyha_result = classify_input(
        QUESTION_MAP["nyha_class"],
        QUESTION_MAP["nyha_class"].options[1].label,
        {"breathlessness": True},
    )
    mmrc_result = classify_input(
        QUESTION_MAP["mmrc_grade"],
        QUESTION_MAP["mmrc_grade"].options[2].label,
        {"breathlessness": True},
    )

    assert nyha_result["mode"] == "answer_only"
    assert nyha_result["parsed_answer"] == "2"
    assert mmrc_result["mode"] == "answer_only"
    assert mmrc_result["parsed_answer"] == "2"


def test_compound_habit_questions_reask_only_missing_details() -> None:
    smoking_answers = {"smoking_history": True}
    smoking_question = QUESTION_MAP["smoking_details"]

    smoking_parsed = parse_answer(smoking_question, "4 packs per day", smoking_answers)
    apply_parsed_answer(smoking_question, smoking_answers, smoking_parsed)

    assert smoking_answers["smoking_packs_per_day"] == 4
    assert not is_question_complete(smoking_question, smoking_answers)
    smoking_payload = question_to_payload(smoking_question, smoking_answers)
    assert smoking_payload["text"] == "Thank you. I still need the number of years of this habit and the last puff."

    smoking_parsed = parse_answer(smoking_question, "10 years and yesterday", smoking_answers)
    apply_parsed_answer(smoking_question, smoking_answers, smoking_parsed)

    assert is_question_complete(smoking_question, smoking_answers)
    assert smoking_answers["smoking_details"] == "10 years, 4 packs per day, last puff: yesterday"

    alcohol_answers = {"alcohol_history": True}
    alcohol_question = QUESTION_MAP["alcohol_details"]

    alcohol_parsed = parse_answer(alcohol_question, "12 years", alcohol_answers)
    apply_parsed_answer(alcohol_question, alcohol_answers, alcohol_parsed)

    assert alcohol_answers["alcohol_years"] == 12
    assert not is_question_complete(alcohol_question, alcohol_answers)
    alcohol_payload = question_to_payload(alcohol_question, alcohol_answers)
    assert alcohol_payload["text"] == "Thank you. I still need the last drink."

    alcohol_parsed = parse_answer(alcohol_question, "yesterday evening", alcohol_answers)
    apply_parsed_answer(alcohol_question, alcohol_answers, alcohol_parsed)

    assert is_question_complete(alcohol_question, alcohol_answers)
    assert alcohol_answers["alcohol_details"] == "12 years, last drink: yesterday"


def test_policy_only_question_does_not_consume_current_question() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True}).json()
        policy_only = client.post(
            f"/api/sessions/{session['session_id']}/answer",
            json={"answer_text": "Can I go home alone after anesthesia?"},
        )
        assert policy_only.status_code == 200
        payload = policy_only.json()
        assert "patient_name" not in payload["answers"]
        assert payload["current_question"]["id"] == "patient_name"
        assert payload["transcript"][-1]["message"] == "What is your name?"
