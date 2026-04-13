from __future__ import annotations

import base64
import io
from datetime import datetime, timezone
from typing import Any

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError


MODEL_NAME = "Airway Camera Assessment"
MAX_IMAGE_DIMENSION = 768


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def round_score(value: float) -> float:
    return round(float(value), 4)


def crop_by_ratio(array: np.ndarray, top: float, bottom: float, left: float, right: float) -> np.ndarray:
    height, width = array.shape[:2]
    start_y = max(0, min(height - 1, int(height * top)))
    end_y = max(start_y + 1, min(height, int(height * bottom)))
    start_x = max(0, min(width - 1, int(width * left)))
    end_x = max(start_x + 1, min(width, int(width * right)))
    return array[start_y:end_y, start_x:end_x]


def decode_image_data_url(image_data_url: str) -> Image.Image:
    if "," not in image_data_url:
        raise ValueError("Image payload must be a data URL.")

    header, encoded = image_data_url.split(",", 1)
    if ";base64" not in header:
        raise ValueError("Image payload must be base64 encoded.")

    try:
        raw = base64.b64decode(encoded)
    except ValueError as exc:
        raise ValueError("Image payload could not be decoded.") from exc

    try:
        with Image.open(io.BytesIO(raw)) as image:
            normalized = ImageOps.exif_transpose(image).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("Uploaded file is not a supported image.") from exc

    normalized.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION))
    return normalized


def image_arrays(image: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    rgb = np.asarray(image, dtype=np.float32)
    gray = np.asarray(image.convert("L"), dtype=np.float32)
    return rgb, gray


def laplacian_energy(gray: np.ndarray) -> float:
    laplacian = (
        -4 * gray
        + np.roll(gray, 1, axis=0)
        + np.roll(gray, -1, axis=0)
        + np.roll(gray, 1, axis=1)
        + np.roll(gray, -1, axis=1)
    )
    return float(np.mean(np.abs(laplacian)) / 255.0)


def quality_assessment(gray: np.ndarray) -> tuple[float, str, dict[str, float]]:
    brightness = float(gray.mean() / 255.0)
    contrast = float(gray.std() / 255.0)
    focus = laplacian_energy(gray)

    brightness_score = clamp(1.0 - abs(brightness - 0.58) / 0.46)
    contrast_score = clamp((contrast - 0.06) / 0.16)
    focus_score = clamp((focus - 0.008) / 0.06)
    quality_score = (brightness_score * 0.32) + (contrast_score * 0.28) + (focus_score * 0.4)

    if quality_score >= 0.68:
        quality_grade = "good"
    elif quality_score >= 0.45:
        quality_grade = "usable"
    else:
        quality_grade = "poor"

    return quality_score, quality_grade, {
        "brightness_score": round_score(brightness_score),
        "contrast_score": round_score(contrast_score),
        "focus_score": round_score(focus_score),
    }


def mouth_opening_proxy(face_crop: np.ndarray) -> float:
    mouth_zone = crop_by_ratio(face_crop, 0.54, 0.76, 0.28, 0.72)
    threshold = min(float(np.quantile(face_crop, 0.18)), float(mouth_zone.mean() - (mouth_zone.std() * 0.2)))
    dark_mask = mouth_zone <= threshold
    dark_ratio = float(dark_mask.mean())
    row_density = dark_mask.mean(axis=1)
    open_rows = float(np.mean(row_density > max(0.06, dark_ratio * 0.8)))
    return clamp((dark_ratio * 2.8) + (open_rows * 0.9))


def submental_fullness_proxy(face_crop: np.ndarray) -> float:
    submental_zone = crop_by_ratio(face_crop, 0.76, 0.92, 0.18, 0.82)
    overall_mean = float(face_crop.mean()) + 1e-6
    overall_std = float(face_crop.std()) + 1e-6
    darkness = clamp((overall_mean - float(submental_zone.mean())) / (overall_mean * 0.35))
    smoothness = clamp(1.0 - (float(submental_zone.std()) / overall_std))
    return clamp((darkness * 0.62) + (smoothness * 0.38))


def jaw_taper_proxy(face_crop: np.ndarray) -> float:
    midface = crop_by_ratio(face_crop, 0.34, 0.52, 0.16, 0.84)
    jaw_band = crop_by_ratio(face_crop, 0.7, 0.86, 0.16, 0.84)
    mid_threshold = float(np.quantile(midface, 0.45))
    jaw_threshold = float(np.quantile(jaw_band, 0.45))
    mid_width = float(np.mean((midface <= mid_threshold).mean(axis=0) > 0.18))
    jaw_width = float(np.mean((jaw_band <= jaw_threshold).mean(axis=0) > 0.18))
    return clamp(((mid_width - jaw_width) + 0.12) / 0.42)


def neck_girth_proxy(face_crop: np.ndarray) -> float:
    lower_band = crop_by_ratio(face_crop, 0.72, 0.94, 0.12, 0.88)
    threshold = float(np.quantile(lower_band, 0.48))
    visible_width = float(np.mean((lower_band <= threshold).mean(axis=0) > 0.18))
    return clamp((visible_width - 0.42) / 0.3)


def estimated_neck_circumference_cm(value: float) -> float:
    return round(32.0 + (value * 14.3), 1)


def mouth_opening_finding(value: float) -> str:
    if value < 0.2:
        return "Limited"
    if value < 0.45:
        return "Borderline"
    return "Adequate"


def submental_fullness_finding(value: float) -> str:
    if value > 0.62:
        return "Marked fullness"
    if value > 0.4:
        return "Mild fullness"
    return "Clear contour"


def chin_projection_finding(value: float) -> str:
    if value < 0.22:
        return "Reduced"
    if value < 0.5:
        return "Borderline"
    return "Preserved"


def neck_girth_finding(value: float) -> str:
    estimated_cm = estimated_neck_circumference_cm(value)
    if estimated_cm > 40.0:
        return f"{estimated_cm} cm (above 40 cm)"
    return f"{estimated_cm} cm (40 cm or below)"


def neck_extension_finding(value: float) -> str:
    if value < 0.22:
        return "Reduced"
    if value < 0.5:
        return "Borderline"
    return "Preserved"


def measurement_metric(key: str, label: str, value: float, finding: str, interpretation: str) -> dict[str, Any]:
    return {
        "key": key,
        "label": label,
        "value": round_score(value),
        "finding": finding,
        "interpretation": interpretation,
    }


def cues_from_metrics(metrics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "name": metric["label"],
            "value": metric["value"],
            "interpretation": metric["interpretation"],
        }
        for metric in metrics
    ]


def frontal_capture_result(gray: np.ndarray, quality_score: float, quality_grade: str, quality_parts: dict[str, float]) -> dict[str, Any]:
    face_crop = crop_by_ratio(gray, 0.14, 0.9, 0.16, 0.84)
    symmetry_penalty = abs(float(face_crop[:, : face_crop.shape[1] // 2].mean()) - float(face_crop[:, face_crop.shape[1] // 2 :].mean())) / 255.0
    mouth_opening = mouth_opening_proxy(face_crop)
    submental_fullness = submental_fullness_proxy(face_crop)
    jaw_taper = jaw_taper_proxy(face_crop)
    chin_projection = clamp(1 - jaw_taper)
    neck_girth = neck_girth_proxy(face_crop)

    confidence = clamp((quality_score * 0.78) + ((1 - clamp(symmetry_penalty * 3.2)) * 0.22))
    derived_flags: list[str] = []
    if quality_score >= 0.45 and mouth_opening < 0.2:
        derived_flags.append("Limited mouth opening cue")
    if quality_score >= 0.45 and submental_fullness > 0.62:
        derived_flags.append("Submental fullness cue")
    if quality_score >= 0.45 and jaw_taper > 0.62:
        derived_flags.append("Reduced chin projection cue")
    if quality_score >= 0.45 and neck_girth > 0.56:
        derived_flags.append("Estimated neck circumference above 40 cm")

    status = "available" if quality_score >= 0.38 else "insufficient_quality"
    if status == "insufficient_quality":
        summary = "The frontal camera view was too dim, blurry, or off-angle for a dependable read."
    elif derived_flags:
        summary = "The frontal camera view detected airway features that should be reviewed."
    else:
        summary = "The frontal camera view was broadly reassuring."

    metrics = [
        measurement_metric(
            "mouth_opening",
            "Mouth opening",
            mouth_opening,
            mouth_opening_finding(mouth_opening),
            "Higher values suggest a more open oral aperture in the frontal view.",
        ),
        measurement_metric(
            "submental_fullness",
            "Submental fullness",
            submental_fullness,
            submental_fullness_finding(submental_fullness),
            "Higher values suggest more lower-face or submental soft-tissue fullness.",
        ),
        measurement_metric(
            "chin_projection",
            "Chin projection",
            chin_projection,
            chin_projection_finding(chin_projection),
            "Higher values suggest better lower-jaw projection in the frontal view.",
        ),
        measurement_metric(
            "neck_girth",
            "Estimated neck circumference",
            neck_girth,
            neck_girth_finding(neck_girth),
            "Image-based screening of the 40 cm neck-circumference threshold from the frontal view.",
        ),
    ]

    return {
        "capture_type": "frontal",
        "status": status,
        "quality_score": round_score(quality_score),
        "quality_grade": quality_grade,
        "quality_components": quality_parts,
        "confidence": round_score(confidence),
        "derived_flags": derived_flags,
        "metrics": metrics,
        "supporting_cues": cues_from_metrics(metrics),
        "summary": summary,
    }


def profile_contour_metrics(face_crop: np.ndarray) -> tuple[float, float]:
    edge_map = (
        np.abs(np.diff(face_crop, axis=1, prepend=face_crop[:, :1]))
        + np.abs(np.diff(face_crop, axis=0, prepend=face_crop[:1, :]))
    )
    half_width = max(1, edge_map.shape[1] // 2)
    left_energy = float(edge_map[:, :half_width].mean())
    right_energy = float(edge_map[:, -half_width:].mean())
    side = "left" if left_energy >= right_energy else "right"

    if side == "left":
        contour_half = edge_map[:, :half_width]
        contour_x = np.argmax(contour_half, axis=1).astype(float)
        midface_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.24) : int(contour_half.shape[0] * 0.44)]))
        chin_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.54) : int(contour_half.shape[0] * 0.68)]))
        neck_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.72) : int(contour_half.shape[0] * 0.88)]))
        chin_projection = (midface_x - chin_x) / max(contour_half.shape[1], 1)
        neck_clearance = (neck_x - chin_x) / max(contour_half.shape[1], 1)
    else:
        contour_half = edge_map[:, -half_width:]
        contour_x = np.argmax(contour_half, axis=1).astype(float)
        midface_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.24) : int(contour_half.shape[0] * 0.44)]))
        chin_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.54) : int(contour_half.shape[0] * 0.68)]))
        neck_x = float(np.median(contour_x[int(contour_half.shape[0] * 0.72) : int(contour_half.shape[0] * 0.88)]))
        chin_projection = (chin_x - midface_x) / max(contour_half.shape[1], 1)
        neck_clearance = (chin_x - neck_x) / max(contour_half.shape[1], 1)

    return chin_projection, neck_clearance


def profile_capture_result(gray: np.ndarray, quality_score: float, quality_grade: str, quality_parts: dict[str, float]) -> dict[str, Any]:
    face_crop = crop_by_ratio(gray, 0.12, 0.92, 0.16, 0.84)
    chin_projection_raw, neck_clearance_raw = profile_contour_metrics(face_crop)
    chin_projection = clamp((chin_projection_raw - 0.02) / 0.16)
    neck_extension = clamp((neck_clearance_raw - 0.03) / 0.18)
    neck_girth = clamp(1 - neck_extension)
    confidence = clamp((quality_score * 0.85) + (min(chin_projection, neck_extension) * 0.15))

    derived_flags: list[str] = []
    if quality_score >= 0.45 and chin_projection < 0.22:
        derived_flags.append("Reduced chin projection cue")
    if quality_score >= 0.45 and neck_extension < 0.22:
        derived_flags.append("Limited neck extension cue")
    if quality_score >= 0.45 and neck_girth > 0.72:
        derived_flags.append("Estimated neck circumference above 40 cm")

    status = "available" if quality_score >= 0.38 else "insufficient_quality"
    if status == "insufficient_quality":
        summary = "The side-profile camera view did not have enough quality or contour contrast for a dependable read."
    elif derived_flags:
        summary = "The side-profile camera view detected airway features that should be reviewed."
    else:
        summary = "The side-profile camera view was broadly reassuring."

    metrics = [
        measurement_metric(
            "chin_projection",
            "Chin projection",
            chin_projection,
            chin_projection_finding(chin_projection),
            "Higher values suggest better chin projection in the side profile.",
        ),
        measurement_metric(
            "neck_extension",
            "Neck extension",
            neck_extension,
            neck_extension_finding(neck_extension),
            "Higher values suggest better chin-neck clearance and extension in the side profile.",
        ),
        measurement_metric(
            "neck_girth",
            "Estimated neck circumference",
            neck_girth,
            neck_girth_finding(neck_girth),
            "Image-based screening of the 40 cm neck-circumference threshold from the side profile.",
        ),
    ]

    return {
        "capture_type": "profile",
        "status": status,
        "quality_score": round_score(quality_score),
        "quality_grade": quality_grade,
        "quality_components": quality_parts,
        "confidence": round_score(confidence),
        "derived_flags": derived_flags,
        "metrics": metrics,
        "supporting_cues": cues_from_metrics(metrics),
        "summary": summary,
    }


def overall_vision_assessment(captures: dict[str, dict[str, Any]]) -> dict[str, Any]:
    available_captures = [capture for capture in captures.values() if capture.get("status") == "available"]
    if not captures:
        return {
            "status": "not_available",
            "label": "Camera assessment not captured yet",
            "bucket": "Unavailable",
            "confidence": 0.0,
            "quality_score": 0.0,
            "derived_flags": [],
            "supporting_cues": [],
            "note": "Capture both the frontal and side-profile airway views to complete the camera assessment.",
        }

    quality_scores = [float(capture.get("quality_score", 0.0)) for capture in captures.values()]
    combined_quality = round_score(float(np.mean(quality_scores))) if quality_scores else 0.0
    derived_flags = sorted({flag for capture in available_captures for flag in capture.get("derived_flags", [])})
    supporting_cues = [cue for capture in available_captures for cue in capture.get("supporting_cues", [])][:5]

    if not available_captures:
        return {
            "status": "insufficient_quality",
            "label": "Camera assessment needs a repeat capture",
            "bucket": "Needs Review",
            "confidence": round_score(combined_quality * 0.5),
            "quality_score": combined_quality,
            "derived_flags": [],
            "supporting_cues": supporting_cues,
            "note": "The captured image was too limited for a dependable read. Retake in even light with the face centered and unobstructed.",
        }

    high_concern = len(derived_flags) >= 2 or (
        "Limited mouth opening cue" in derived_flags and "Limited neck extension cue" in derived_flags
    )
    needs_review = bool(derived_flags) or combined_quality < 0.55

    if high_concern:
        label = "Camera assessment suggests difficult-airway features"
        bucket = "High Concern"
    elif needs_review:
        label = "Camera assessment needs review"
        bucket = "Needs Review"
    else:
        label = "Camera assessment appears reassuring"
        bucket = "Low Concern"

    confidence = clamp((combined_quality * 0.6) + (len(available_captures) * 0.12) + (len(derived_flags) * 0.08), 0.0, 0.92)
    note = "Camera-derived airway findings should be reviewed together with the bedside airway examination."
    if len(available_captures) == 1:
        note += " Both frontal and side-profile captures are required to finish the exam."

    return {
        "status": "available",
        "label": label,
        "bucket": bucket,
        "confidence": round_score(confidence),
        "quality_score": combined_quality,
        "derived_flags": derived_flags,
        "supporting_cues": supporting_cues,
        "note": note,
    }


def merge_with_existing(existing: dict[str, Any] | None, capture: dict[str, Any]) -> dict[str, Any]:
    existing_captures = {}
    if isinstance(existing, dict):
        prior_captures = existing.get("captures")
        if isinstance(prior_captures, dict):
            existing_captures = {key: value for key, value in prior_captures.items() if isinstance(value, dict)}

    existing_captures[capture["capture_type"]] = capture
    overall = overall_vision_assessment(existing_captures)
    return {
        "model_name": MODEL_NAME,
        "status": overall["status"],
        "analyzed_at": utc_now_iso(),
        "images_persisted": False,
        "captures": existing_captures,
        "overall": overall,
        "disclaimer": "",
    }


def has_required_exam_captures(assessment: dict[str, Any] | None) -> bool:
    if not isinstance(assessment, dict):
        return False
    captures = assessment.get("captures")
    if not isinstance(captures, dict):
        return False
    return "frontal" in captures and "profile" in captures


def analyze_airway_photo(
    image_data_url: str,
    capture_type: str,
    existing_assessment: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if capture_type not in {"frontal", "profile"}:
        raise ValueError("Capture type must be either 'frontal' or 'profile'.")

    image = decode_image_data_url(image_data_url)
    _, gray = image_arrays(image)
    quality_score, quality_grade, quality_parts = quality_assessment(gray)

    if capture_type == "frontal":
        capture = frontal_capture_result(gray, quality_score, quality_grade, quality_parts)
    else:
        capture = profile_capture_result(gray, quality_score, quality_grade, quality_parts)

    return merge_with_existing(existing_assessment, capture)
