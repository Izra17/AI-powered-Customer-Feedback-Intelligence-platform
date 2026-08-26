"""
topic_analysis.py
------------------
Deterministic keyword/phrase-based topic classification and issue-severity
detection. Designed to be swapped for an LLM-based classifier later while
keeping the same function signatures:

    classify_topic(text) -> str
    detect_severity(text, sentiment_score, rating) -> str | None
"""
import re

TOPIC_KEYWORDS = {
    "Size & Fit": [
        "size", "sizing", "small", "tight", "narrow", "big", "loose",
        "true to size", "runs small", "runs large", "fit", "fits", "cramped",
    ],
    "Comfort": [
        "comfortable", "comfy", "uncomfortable", "cushion", "cushioning",
        "support", "arch", "soft", "hard", "stiff", "pain", "hurt", "ache",
        "blister", "insole",
    ],
    "Quality": [
        "quality", "material quality", "cheap", "premium", "stitching",
        "build quality", "fabric", "pilled", "faded", "color fading",
    ],
    "Durability": [
        "durable", "durability", "sole", "wear out", "worn out", "crack",
        "cracked", "tear", "torn", "long lasting", "last", "months of use",
    ],
    "Delivery": [
        "delivery", "delayed", "late", "shipping", "tracking", "arrived",
        "transit", "delivery partner",
    ],
    "Return Experience": [
        "return", "refund", "exchange", "pickup", "customer support",
        "support", "unresponsive",
    ],
    "Design": [
        "design", "colour", "color", "look", "style", "stylish", "logo",
        "photos", "branding",
    ],
    "Price & Value": [
        "price", "value", "worth", "expensive", "overpriced", "cost",
        "money",
    ],
    "Material": [
        "material", "fabric", "leather", "knit", "canvas", "sole material",
    ],
    "Packaging": [
        "packaging", "box", "package", "damaged box",
    ],
}

# Order matters: more specific topics checked first for tie-breaking
TOPIC_PRIORITY = [
    "Size & Fit", "Delivery", "Return Experience", "Durability",
    "Comfort", "Quality", "Material", "Packaging", "Design", "Price & Value",
]


def classify_topic(text: str) -> str:
    """Classify review text into the single most relevant topic."""
    text_lower = text.lower()
    scores = {}

    for topic, keywords in TOPIC_KEYWORDS.items():
        count = 0
        for kw in keywords:
            if kw in text_lower:
                count += 1
        if count > 0:
            scores[topic] = count

    if not scores:
        return "Other"

    max_count = max(scores.values())
    tied = [t for t, c in scores.items() if c == max_count]
    if len(tied) == 1:
        return tied[0]

    # tie-break using priority order
    for topic in TOPIC_PRIORITY:
        if topic in tied:
            return topic
    return tied[0]


CRITICAL_KEYWORDS = [
    "damaged", "torn", "cracked", "unresponsive", "refused", "never received",
    "worst", "terrible", "unacceptable",
]
HIGH_KEYWORDS = [
    "poor", "disappointing", "disappointed", "frustrating", "wrong",
    "worn out", "cheap", "hurt", "pain", "blisters",
]
MEDIUM_KEYWORDS = [
    "issue", "problem", "delayed", "late", "small", "tight", "uncomfortable",
]


def detect_severity(text: str, sentiment_score: float, rating: int = None):
    """
    Determine issue severity for negative-leaning reviews.
    Returns one of: "Low", "Medium", "High", "Critical", or None
    (None when the review isn't describing a negative issue).
    """
    if sentiment_score > -0.15 and (rating is None or rating >= 3):
        return None

    text_lower = text.lower()

    critical_hits = sum(1 for kw in CRITICAL_KEYWORDS if kw in text_lower)
    high_hits = sum(1 for kw in HIGH_KEYWORDS if kw in text_lower)
    medium_hits = sum(1 for kw in MEDIUM_KEYWORDS if kw in text_lower)

    rating_val = rating if rating is not None else 3

    if critical_hits > 0 or (sentiment_score <= -0.8 and rating_val <= 1):
        return "Critical"
    if high_hits > 0 or sentiment_score <= -0.55 or rating_val <= 1:
        return "High"
    if medium_hits > 0 or sentiment_score <= -0.3 or rating_val == 2:
        return "Medium"
    if sentiment_score <= -0.15:
        return "Low"
    return None
