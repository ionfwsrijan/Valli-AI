import base64
import io

from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

from app.main import app


def synthetic_frontal_data_url() -> str:
    image = Image.new("RGB", (320, 420), (236, 228, 220))
    draw = ImageDraw.Draw(image)
    draw.ellipse((68, 36, 252, 292), fill=(192, 161, 142), outline=(118, 98, 86), width=4)
    draw.ellipse((118, 118, 138, 136), fill=(58, 48, 48))
    draw.ellipse((182, 118, 202, 136), fill=(58, 48, 48))
    draw.rectangle((128, 188, 192, 218), fill=(24, 20, 20))
    draw.rounded_rectangle((108, 232, 212, 286), radius=24, fill=(104, 82, 74))

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=92)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def synthetic_profile_data_url() -> str:
    image = Image.new("RGB", (320, 420), (236, 228, 220))
    draw = ImageDraw.Draw(image)
    draw.polygon(
        [(188, 42), (218, 74), (232, 110), (238, 150), (232, 182), (214, 224), (232, 284), (202, 332), (150, 354), (116, 328), (136, 242), (132, 138), (150, 84)],
        fill=(192, 161, 142),
        outline=(118, 98, 86),
    )
    draw.ellipse((176, 118, 194, 136), fill=(58, 48, 48))
    draw.polygon([(224, 158), (244, 168), (226, 186)], fill=(134, 98, 84))
    draw.line((206, 206, 228, 214), fill=(92, 70, 60), width=4)
    draw.line((168, 312, 126, 366), fill=(104, 82, 74), width=24)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=92)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def test_airway_vision_capture_requires_questionnaire_completion() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True}).json()

        response = client.post(
            f"/api/sessions/{session['session_id']}/vision-airway",
            json={
                "capture_type": "frontal",
                "image_data_url": synthetic_frontal_data_url(),
                "consent_for_image_analysis": True,
            },
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Complete the questionnaire before starting the camera-based examination."


def test_airway_vision_capture_updates_session_and_completes_after_both_views() -> None:
    with TestClient(app) as client:
        session = client.post("/api/sessions", json={"consent_for_ai": True}).json()
        current_question = session["current_question"]
        assert current_question["id"] == "patient_name"

        answers = {
            "patient_name": "Jane Example",
            "patient_age": "29",
            "patient_sex": "Female",
            "uhid_no": "UH-2201",
            "ip_no": "IP-119",
            "body_metrics": "68 kg and 162 cm",
            "preoperative_diagnosis": "Fibroid uterus",
            "proposed_procedure": "Total abdominal hysterectomy",
            "history_source": "Patient",
            "previous_surgery": "No",
            "diabetes": "No",
            "hypertension": "No",
            "thyroid_disorder": "No",
            "asthma": "No",
            "seizures": "No",
            "heart_disease": "No",
            "kidney_disease": "No",
            "liver_disease": "No",
            "stroke_history": "No",
            "bleeding_disorder": "No",
            "other_present_illness_details": "No other health problems.",
            "drug_allergies": "No",
            "family_history": "No",
            "smoking_history": "No",
            "alcohol_history": "No",
            "palpitations": "No",
            "breathlessness": "No",
            "chest_pain": "No",
            "snoring_history": "No",
            "stopbang_snore": "No",
            "stopbang_tired": "No",
            "stopbang_observed_apnea": "No",
            "stopbang_high_pressure_treated": "No",
            "recent_fever": "No",
            "recent_cough": "No",
            "wheezing": "No",
            "anesthesiologist_suggestions": "No suggestions.",
        }

        while current_question is not None:
            answer_text = answers[current_question["id"]]
            progressed = client.post(
                f"/api/sessions/{session['session_id']}/answer",
                json={"answer_text": answer_text},
            )
            assert progressed.status_code == 200
            session = progressed.json()
            current_question = session["current_question"]

        assert session["status"] == "awaiting_exam"

        frontal_response = client.post(
            f"/api/sessions/{session['session_id']}/vision-airway",
            json={
                "capture_type": "frontal",
                "image_data_url": synthetic_frontal_data_url(),
                "consent_for_image_analysis": True,
            },
        )

        assert frontal_response.status_code == 200
        frontal_payload = frontal_response.json()
        vision = frontal_payload["risk_snapshot"]["vision_airway"]
        assert vision["captures"]["frontal"]["status"] == "available"
        assert vision["overall"]["label"]
        frontal_metrics = vision["captures"]["frontal"]["metrics"]
        assert any(metric["label"] == "Estimated neck circumference" for metric in frontal_metrics)
        assert any("40 cm" in metric["finding"] for metric in frontal_metrics if metric["label"] == "Estimated neck circumference")
        assert frontal_payload["status"] == "awaiting_exam"
        assert any("Frontal view camera result:" in item["message"] for item in frontal_payload["transcript"])
        assert not any("measurements:" in item["message"] for item in frontal_payload["transcript"])
        assert frontal_payload["transcript"][-1]["message"] == "Please capture the remaining required airway view to finish the examination."

        profile_response = client.post(
            f"/api/sessions/{session['session_id']}/vision-airway",
            json={
                "capture_type": "profile",
                "image_data_url": synthetic_profile_data_url(),
                "consent_for_image_analysis": True,
            },
        )

        assert profile_response.status_code == 200
        profile_payload = profile_response.json()
        profile_vision = profile_payload["risk_snapshot"]["vision_airway"]
        assert profile_vision["captures"]["profile"]["status"] in {"available", "insufficient_quality"}
        assert profile_payload["status"] == "completed"
        assert any("Side-profile view camera result:" in item["message"] for item in profile_payload["transcript"])
        assert not any("measurements:" in item["message"] for item in profile_payload["transcript"])
        assert profile_payload["transcript"][-1]["message"] == "The camera-based examination is complete. Your final transcript and report are now ready."
