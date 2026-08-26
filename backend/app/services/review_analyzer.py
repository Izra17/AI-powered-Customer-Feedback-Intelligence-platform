"""
review_analyzer.py
-------------------
Orchestrates the per-review AI analysis pipeline:

    review text --> sentiment --> topic --> issue severity

Exposes `analyze_review()` as the single public entry point, matching the
interface described in the project spec so a real LLM call could later
replace the internals without touching calling code elsewhere.
"""
from app.services.sentiment import analyze_sentiment
from app.services.topic_analysis import classify_topic, detect_severity


def analyze_review(review_text: str, rating: int = None) -> dict:
    """
    Run the full deterministic analysis pipeline on a single review.

    Returns a dict:
        {
            "sentiment": "Positive" | "Neutral" | "Negative",
            "sentiment_score": float in [-1, 1],
            "topic": str,
            "severity": "Low" | "Medium" | "High" | "Critical" | None
        }
    """
    sentiment_label, sentiment_score = analyze_sentiment(review_text, rating)
    topic = classify_topic(review_text)
    severity = detect_severity(review_text, sentiment_score, rating)

    return {
        "sentiment": sentiment_label,
        "sentiment_score": sentiment_score,
        "topic": topic,
        "severity": severity,
    }
