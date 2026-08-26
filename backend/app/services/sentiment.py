"""
sentiment.py
------------
Deterministic, rule-based/NLP-style sentiment analysis service.

This module is intentionally structured so that a real LLM/embedding-based
provider (OpenAI, Anthropic, etc.) could be swapped in later without changing
the calling code. The public interface is `analyze_sentiment(text, rating)`.

The approach:
1. Normalize text.
2. Score matches against curated positive / negative lexicons (weighted).
3. Combine lexicon score with the star rating (a strong, real signal that
   real review pipelines commonly blend with text-derived sentiment).
4. Clip to [-1, 1] and bucket into Positive / Neutral / Negative.
"""
import re
from typing import Tuple

POSITIVE_WORDS = {
    "comfortable": 1.0, "comfy": 1.0, "lightweight": 0.8, "stylish": 0.7,
    "great": 0.9, "good": 0.6, "love": 1.0, "loved": 1.0, "amazing": 1.1,
    "excellent": 1.1, "perfect": 1.1, "fantastic": 1.0, "premium": 0.7,
    "soft": 0.6, "breathable": 0.6, "recommend": 0.8, "happy": 0.8,
    "quality": 0.4, "value": 0.4, "easy": 0.5, "impressed": 0.9,
    "durable": 0.7, "sturdy": 0.6, "true to size": 0.7, "well made": 0.8,
    "worth": 0.6, "favourite": 0.8, "favorite": 0.8, "nice": 0.5,
    "cushioning": 0.3, "support": 0.3, "spot on": 0.7,
}

NEGATIVE_WORDS = {
    "uncomfortable": -1.0, "small": -0.5, "tight": -0.6, "cheap": -0.9,
    "poor": -0.9, "bad": -0.8, "disappointing": -1.0, "disappointed": -1.0,
    "worn out": -0.8, "cracks": -0.8, "cracked": -0.8, "torn": -0.8,
    "tear": -0.7, "delayed": -0.6, "late": -0.6, "damaged": -0.8,
    "frustrating": -0.8, "slow": -0.5, "unresponsive": -0.7,
    "hurt": -0.8, "pain": -0.8, "cramped": -0.7, "blisters": -0.8,
    "faded": -0.6, "pilled": -0.6, "stiff": -0.5, "hard": -0.4,
    "narrow": -0.5, "wrong": -0.6, "overpriced": -0.7, "basic": -0.3,
    "scuff": -0.4, "issue": -0.5, "problem": -0.6, "hassle": -0.6,
    "rescheduled": -0.5, "misleading": -0.7, "inconsistent": -0.5,
    "ache": -0.7, "aches": -0.7, "thin": -0.4, "plain": -0.2,
}

NEGATIONS = {"not", "n't", "no", "never", "hardly", "barely"}

WORD_RE = re.compile(r"[a-zA-Z']+")


def _tokenize(text: str):
    return WORD_RE.findall(text.lower())


def _lexicon_score(text: str) -> float:
    """Compute a lexicon-weighted polarity score in roughly [-1, 1]."""
    text_lower = text.lower()
    tokens = _tokenize(text_lower)
    score = 0.0
    hits = 0

    # multi-word phrase check first
    for phrase, weight in {**POSITIVE_WORDS, **NEGATIVE_WORDS}.items():
        if " " in phrase and phrase in text_lower:
            score += weight
            hits += 1

    for i, tok in enumerate(tokens):
        weight = POSITIVE_WORDS.get(tok) or NEGATIVE_WORDS.get(tok)
        if weight is None:
            continue
        # simple negation handling: flip polarity if a negation word occurs
        # within the previous 3 tokens
        window = tokens[max(0, i - 3):i]
        if any(neg in window for neg in NEGATIONS):
            weight = -weight * 0.8
        score += weight
        hits += 1

    if hits == 0:
        return 0.0

    # average, then apply a mild damping so single strong words don't
    # saturate the score
    avg = score / max(hits, 1)
    return max(-1.0, min(1.0, avg))


def analyze_sentiment(text: str, rating: int = None) -> Tuple[str, float]:
    """
    Analyze sentiment of a review.

    Returns:
        (label, score) where label in {"Positive","Neutral","Negative"}
        and score is a float in [-1, 1].
    """
    lexicon_score = _lexicon_score(text)

    if rating is not None:
        # normalize rating (1-5) to [-1, 1]
        rating_score = (rating - 3) / 2.0
        # blend: text signal weighted slightly higher than rating,
        # mirroring how real review-analysis pipelines combine structured
        # + unstructured signals
        combined = (lexicon_score * 0.6) + (rating_score * 0.4)

        # Rating acts as a strong prior: a 1-2 star review is virtually never
        # genuinely "positive" overall even if it contains an isolated
        # positive word (e.g. "had to size up for a comfortable fit"), and a
        # 4-5 star review is virtually never genuinely "negative". This
        # mirrors how real review pipelines let structured signals bound the
        # text-derived score.
        if rating <= 2:
            combined = min(combined, 0.15)
        elif rating >= 4:
            combined = max(combined, -0.15)
    else:
        combined = lexicon_score

    combined = max(-1.0, min(1.0, round(combined, 3)))

    if combined >= 0.2:
        label = "Positive"
    elif combined <= -0.2:
        label = "Negative"
    else:
        label = "Neutral"

    return label, combined
