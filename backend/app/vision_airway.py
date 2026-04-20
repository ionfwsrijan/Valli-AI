from __future__ import annotations

import base64
import io
from datetime import datetime, timezone
from typing import Any

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError


MODEL_NAME = "Airway Camera Assessment"
MAX_IMAGE_DIMENSION = 768
REFERENCE_DATASET_VERSION = "prototype-reference-v2"


FRONTAL_REFERENCE_PROFILES = [
    {"id": "frontal_balanced_01", "quality": 0.82, "metrics": {"mouth_opening": 0.76, "submental_fullness": 0.22, "chin_projection": 0.78, "neck_girth": 0.34}},
    {"id": "frontal_balanced_02", "quality": 0.78, "metrics": {"mouth_opening": 0.71, "submental_fullness": 0.26, "chin_projection": 0.73, "neck_girth": 0.38}},
    {"id": "frontal_balanced_03", "quality": 0.74, "metrics": {"mouth_opening": 0.67, "submental_fullness": 0.29, "chin_projection": 0.69, "neck_girth": 0.41}},
    {"id": "frontal_balanced_04", "quality": 0.7, "metrics": {"mouth_opening": 0.63, "submental_fullness": 0.32, "chin_projection": 0.65, "neck_girth": 0.44}},
    {"id": "frontal_review_01", "quality": 0.76, "metrics": {"mouth_opening": 0.44, "submental_fullness": 0.42, "chin_projection": 0.52, "neck_girth": 0.49}},
    {"id": "frontal_review_02", "quality": 0.73, "metrics": {"mouth_opening": 0.39, "submental_fullness": 0.48, "chin_projection": 0.46, "neck_girth": 0.53}},
    {"id": "frontal_review_03", "quality": 0.68, "metrics": {"mouth_opening": 0.34, "submental_fullness": 0.51, "chin_projection": 0.41, "neck_girth": 0.57}},
    {"id": "frontal_review_04", "quality": 0.65, "metrics": {"mouth_opening": 0.29, "submental_fullness": 0.56, "chin_projection": 0.36, "neck_girth": 0.61}},
    {"id": "frontal_concern_01", "quality": 0.77, "metrics": {"mouth_opening": 0.18, "submental_fullness": 0.68, "chin_projection": 0.19, "neck_girth": 0.72}},
    {"id": "frontal_concern_02", "quality": 0.72, "metrics": {"mouth_opening": 0.16, "submental_fullness": 0.71, "chin_projection": 0.22, "neck_girth": 0.76}},
    {"id": "frontal_concern_03", "quality": 0.69, "metrics": {"mouth_opening": 0.21, "submental_fullness": 0.64, "chin_projection": 0.24, "neck_girth": 0.69}},
    {"id": "frontal_concern_04", "quality": 0.66, "metrics": {"mouth_opening": 0.14, "submental_fullness": 0.74, "chin_projection": 0.17, "neck_girth": 0.81}},
]

PROFILE_REFERENCE_PROFILES = [
    {"id": "profile_balanced_01", "quality": 0.82, "metrics": {"chin_projection": 0.79, "neck_extension": 0.76, "neck_girth": 0.24}},
    {"id": "profile_balanced_02", "quality": 0.78, "metrics": {"chin_projection": 0.73, "neck_extension": 0.71, "neck_girth": 0.29}},
    {"id": "profile_balanced_03", "quality": 0.74, "metrics": {"chin_projection": 0.68, "neck_extension": 0.66, "neck_girth": 0.34}},
    {"id": "profile_balanced_04", "quality": 0.7, "metrics": {"chin_projection": 0.62, "neck_extension": 0.61, "neck_girth": 0.39}},
    {"id": "profile_review_01", "quality": 0.76, "metrics": {"chin_projection": 0.48, "neck_extension": 0.44, "neck_girth": 0.56}},
    {"id": "profile_review_02", "quality": 0.72, "metrics": {"chin_projection": 0.42, "neck_extension": 0.37, "neck_girth": 0.63}},
    {"id": "profile_review_03", "quality": 0.68, "metrics": {"chin_projection": 0.36, "neck_extension": 0.31, "neck_girth": 0.69}},
    {"id": "profile_review_04", "quality": 0.65, "metrics": {"chin_projection": 0.31, "neck_extension": 0.27, "neck_girth": 0.73}},
    {"id": "profile_concern_01", "quality": 0.78, "metrics": {"chin_projection": 0.18, "neck_extension": 0.16, "neck_girth": 0.82}},
    {"id": "profile_concern_02", "quality": 0.74, "metrics": {"chin_projection": 0.14, "neck_extension": 0.13, "neck_girth": 0.86}},
    {"id": "profile_concern_03", "quality": 0.7, "metrics": {"chin_projection": 0.21, "neck_extension": 0.18, "neck_girth": 0.79}},
    {"id": "profile_concern_04", "quality": 0.67, "metrics": {"chin_projection": 0.11, "neck_extension": 0.09, "neck_girth": 0.9}},
]

REFERENCE_DATASET = {
    "frontal": FRONTAL_REFERENCE_PROFILES,
    "profile": PROFILE_REFERENCE_PROFILES,
}


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


def quadrant_exposure_balance(gray: np.ndarray) -> float:
    quadrants = [
        crop_by_ratio(gray, 0.0, 0.5, 0.0, 0.5),
        crop_by_ratio(gray, 0.0, 0.5, 0.5, 1.0),
        crop_by_ratio(gray, 0.5, 1.0, 0.0, 0.5),
        crop_by_ratio(gray, 0.5, 1.0, 0.5, 1.0),
    ]
    quadrant_means = np.array([float(quad.mean() / 255.0) for quad in quadrants], dtype=np.float32)
    return clamp(1.0 - float(np.std(quadrant_means) / 0.18))


def quality_assessment(gray: np.ndarray) -> tuple[float, str, dict[str, float]]:
    brightness = float(gray.mean() / 255.0)
    contrast = float(gray.std() / 255.0)
    focus = laplacian_energy(gray)
    balance = quadrant_exposure_balance(gray)

    brightness_score = clamp(1.0 - abs(brightness - 0.68) / 0.42)
    contrast_score = clamp((contrast - 0.035) / 0.16)
    focus_score = clamp((focus - 0.004) / 0.02)
    quality_score = (
        (brightness_score * 0.24)
        + (contrast_score * 0.24)
        + (focus_score * 0.36)
        + (balance * 0.16)
    )

    if quality_score >= 0.74:
        quality_grade = "good"
    elif quality_score >= 0.54:
        quality_grade = "usable"
    else:
        quality_grade = "poor"

    return quality_score, quality_grade, {
        "brightness_score": round_score(brightness_score),
        "contrast_score": round_score(contrast_score),
        "focus_score": round_score(focus_score),
        "balance_score": round_score(balance),
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


def reference_agreement(capture_type: str, quality_score: float, metric_values: dict[str, float]) -> tuple[float, list[dict[str, Any]]]:
    dataset = REFERENCE_DATASET[capture_type]
    scored_profiles: list[dict[str, Any]] = []

    for profile in dataset:
        profile_metrics = profile["metrics"]
        metric_distance = float(
            np.mean([abs(metric_values[key] - float(profile_metrics[key])) for key in metric_values])
        )
        quality_distance = abs(quality_score - float(profile["quality"]))
        distance = (metric_distance * 0.82) + (quality_distance * 0.18)
        similarity = clamp(1.0 - (distance / 0.46))
        scored_profiles.append(
            {
                "profile": profile["id"],
                "similarity": round_score(similarity),
                "distance": round_score(distance),
            }
        )

    scored_profiles.sort(key=lambda item: item["similarity"], reverse=True)
    top_matches = scored_profiles[:3]
    if not top_matches:
        return 0.0, []

    weights = [0.5, 0.3, 0.2]
    padded = top_matches + [top_matches[-1]] * max(0, 3 - len(top_matches))
    agreement = sum(match["similarity"] * weights[index] for index, match in enumerate(padded[:3]))
    return round_score(agreement), top_matches


def reliability_band(score: float) -> str:
    if score >= 0.8:
        return "Stronger"
    if score >= 0.62:
        return "Moderate"
    if score >= 0.45:
        return "Limited"
    return "Low"


def accuracy_tracking(
    capture_type: str,
    quality_score: float,
    stability_score: float,
    reference_match_score: float,
    top_reference_matches: list[dict[str, Any]],
) -> dict[str, Any]:
    estimated_accuracy = clamp((quality_score * 0.36) + (stability_score * 0.24) + (reference_match_score * 0.4))
    return {
        "reference_dataset_size": len(REFERENCE_DATASET[capture_type]),
        "reference_dataset_version": REFERENCE_DATASET_VERSION,
        "reference_match_score": round_score(reference_match_score),
        "feature_stability_score": round_score(stability_score),
        "estimated_accuracy": round_score(estimated_accuracy),
        "reliability_band": reliability_band(estimated_accuracy),
        "measured_accuracy_available": False,
        "accuracy_note": (
            "Prototype estimate derived from image quality, feature stability, and agreement with the built-in reference set. "
            "This is not a clinician-validated accuracy figure."
        ),
        "top_reference_matches": top_reference_matches,
    }


def frontal_capture_result(gray: np.ndarray, quality_score: float, quality_grade: str, quality_parts: dict[str, float]) -> dict[str, Any]:
    face_crop = crop_by_ratio(gray, 0.14, 0.9, 0.16, 0.84)
    symmetry_penalty = abs(
        float(face_crop[:, : face_crop.shape[1] // 2].mean()) - float(face_crop[:, face_crop.shape[1] // 2 :].mean())
    ) / 255.0
    mouth_opening = mouth_opening_proxy(face_crop)
    submental_fullness = submental_fullness_proxy(face_crop)
    jaw_taper = jaw_taper_proxy(face_crop)
    chin_projection = clamp(1 - jaw_taper)
    neck_girth = neck_girth_proxy(face_crop)

    metric_values = {
        "mouth_opening": mouth_opening,
        "submental_fullness": submental_fullness,
        "chin_projection": chin_projection,
        "neck_girth": neck_girth,
    }
    symmetry_score = clamp(1.0 - (symmetry_penalty * 2.6))
    stability_score = clamp((symmetry_score * 0.58) + (quality_parts["focus_score"] * 0.22) + (quality_parts["contrast_score"] * 0.2))
    reference_match_score, top_reference_matches = reference_agreement("frontal", quality_score, metric_values)
    tracking = accuracy_tracking("frontal", quality_score, stability_score, reference_match_score, top_reference_matches)

    confidence = clamp(
        0.18
        + (quality_score * 0.32)
        + (stability_score * 0.18)
        + (reference_match_score * 0.24)
        + (tracking["estimated_accuracy"] * 0.08),
        0.22,
        0.96,
    )
    if quality_grade == "good" and reference_match_score >= 0.72:
        confidence = max(confidence, 0.72)
    elif quality_grade == "usable" and reference_match_score >= 0.62:
        confidence = max(confidence, 0.58)

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
        "accuracy_tracking": tracking,
    }


def profile_contour_metrics(face_crop: np.ndarray) -> tuple[float, float, float]:
    edge_map = (
        np.abs(np.diff(face_crop, axis=1, prepend=face_crop[:, :1]))
        + np.abs(np.diff(face_crop, axis=0, prepend=face_crop[:1, :]))
    )
    half_width = max(1, edge_map.shape[1] // 2)
    left_energy = float(edge_map[:, :half_width].mean())
    right_energy = float(edge_map[:, -half_width:].mean())
    side = "left" if left_energy >= right_energy else "right"
    side_dominance = clamp(abs(left_energy - right_energy) / max(left_energy + right_energy, 1e-6))

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

    return chin_projection, neck_clearance, side_dominance


def profile_capture_result(gray: np.ndarray, quality_score: float, quality_grade: str, quality_parts: dict[str, float]) -> dict[str, Any]:
    face_crop = crop_by_ratio(gray, 0.12, 0.92, 0.16, 0.84)
    chin_projection_raw, neck_clearance_raw, side_dominance = profile_contour_metrics(face_crop)
    chin_projection = clamp((chin_projection_raw - 0.02) / 0.16)
    neck_extension = clamp((neck_clearance_raw - 0.03) / 0.18)
    neck_girth = clamp(1 - neck_extension)

    metric_values = {
        "chin_projection": chin_projection,
        "neck_extension": neck_extension,
        "neck_girth": neck_girth,
    }
    stability_score = clamp((side_dominance * 0.45) + (quality_parts["focus_score"] * 0.3) + (quality_parts["contrast_score"] * 0.25))
    reference_match_score, top_reference_matches = reference_agreement("profile", quality_score, metric_values)
    tracking = accuracy_tracking("profile", quality_score, stability_score, reference_match_score, top_reference_matches)

    confidence = clamp(
        0.18
        + (quality_score * 0.3)
        + (stability_score * 0.22)
        + (reference_match_score * 0.22)
        + (tracking["estimated_accuracy"] * 0.08),
        0.22,
        0.96,
    )
    if quality_grade == "good" and reference_match_score >= 0.72:
        confidence = max(confidence, 0.72)
    elif quality_grade == "usable" and reference_match_score >= 0.62:
        confidence = max(confidence, 0.58)

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
        "accuracy_tracking": tracking,
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
            "accuracy_tracking": {
                "reference_dataset_size": len(FRONTAL_REFERENCE_PROFILES) + len(PROFILE_REFERENCE_PROFILES),
                "reference_dataset_version": REFERENCE_DATASET_VERSION,
                "estimated_accuracy": 0.0,
                "reliability_band": "Pending",
                "measured_accuracy_available": False,
                "accuracy_note": "No camera capture has been analyzed yet.",
                "analyzed_views": 0,
            },
        }

    quality_scores = [float(capture.get("quality_score", 0.0)) for capture in captures.values()]
    combined_quality = round_score(float(np.mean(quality_scores))) if quality_scores else 0.0
    derived_flags = sorted({flag for capture in available_captures for flag in capture.get("derived_flags", [])})
    supporting_cues = [cue for capture in available_captures for cue in capture.get("supporting_cues", [])][:5]
    average_capture_confidence = float(np.mean([float(capture.get("confidence", 0.0)) for capture in captures.values()]))
    average_estimated_accuracy = float(
        np.mean(
            [
                float(capture.get("accuracy_tracking", {}).get("estimated_accuracy", 0.0))
                for capture in captures.values()
                if isinstance(capture.get("accuracy_tracking"), dict)
            ]
            or [0.0]
        )
    )

    if not available_captures:
        return {
            "status": "insufficient_quality",
            "label": "Camera assessment needs a repeat capture",
            "bucket": "Needs Review",
            "confidence": round_score(max(combined_quality * 0.55, average_estimated_accuracy * 0.45)),
            "quality_score": combined_quality,
            "derived_flags": [],
            "supporting_cues": supporting_cues,
            "note": "The captured image was too limited for a dependable read. Retake in even light with the face centered and unobstructed.",
            "accuracy_tracking": {
                "reference_dataset_size": len(FRONTAL_REFERENCE_PROFILES) + len(PROFILE_REFERENCE_PROFILES),
                "reference_dataset_version": REFERENCE_DATASET_VERSION,
                "estimated_accuracy": round_score(average_estimated_accuracy),
                "reliability_band": reliability_band(average_estimated_accuracy),
                "measured_accuracy_available": False,
                "accuracy_note": (
                    "The current estimate is limited by image quality. Retaking the image usually improves reliability more than repeating the same low-quality frame."
                ),
                "analyzed_views": len(captures),
            },
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

    confidence = clamp(
        (average_capture_confidence * 0.52)
        + (combined_quality * 0.24)
        + (average_estimated_accuracy * 0.18)
        + (0.06 if len(available_captures) == 2 else 0.0),
        0.0,
        0.95,
    )
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
        "accuracy_tracking": {
            "reference_dataset_size": len(FRONTAL_REFERENCE_PROFILES) + len(PROFILE_REFERENCE_PROFILES),
            "reference_dataset_version": REFERENCE_DATASET_VERSION,
            "estimated_accuracy": round_score(average_estimated_accuracy),
            "reliability_band": reliability_band(average_estimated_accuracy),
            "measured_accuracy_available": False,
            "accuracy_note": (
                "Overall reliability is estimated from image quality, capture confidence, and agreement with the built-in reference set. "
                "A clinician-confirmed accuracy score has not been recorded yet."
            ),
            "analyzed_views": len(captures),
        },
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
        "dataset_summary": {
            "reference_dataset_version": REFERENCE_DATASET_VERSION,
            "reference_dataset_size": len(FRONTAL_REFERENCE_PROFILES) + len(PROFILE_REFERENCE_PROFILES),
            "frontal_reference_profiles": len(FRONTAL_REFERENCE_PROFILES),
            "profile_reference_profiles": len(PROFILE_REFERENCE_PROFILES),
        },
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
