from fastapi import APIRouter, Query
from datetime import timedelta
import pandas as pd

from app.services.data_store import get_store
from app.routes.reviews import apply_review_filters

router = APIRouter(prefix="/api", tags=["dashboard"])


def _pct(n, d):
    if d == 0:
        return 0.0
    return round((n / d) * 100, 1)


@router.get("/dashboard")
def get_dashboard(
    product_id: str = None,
    category: str = None,
    sentiment: str = None,
    topic: str = None,
    rating: int = None,
    order_status: str = None,
    date_from: str = None,
    date_to: str = None,
):
    store = get_store()
    reviews = apply_review_filters(
        store.reviews_df, product_id=product_id, category=category,
        sentiment=sentiment, topic=topic, rating=rating,
        date_from=date_from, date_to=date_to,
    )
    orders = store.orders_df.copy()
    if product_id:
        orders = orders[orders["product_id"] == product_id]
    if order_status:
        orders = orders[orders["order_status"] == order_status]

    total_reviews = len(reviews)

    # Change vs prior 30-day period (based on review dates)
    if not reviews.empty:
        max_date = reviews["review_date"].max()
        last_30 = reviews[reviews["review_date"] > max_date - timedelta(days=30)]
        prev_30 = reviews[
            (reviews["review_date"] > max_date - timedelta(days=60)) &
            (reviews["review_date"] <= max_date - timedelta(days=30))
        ]
        if len(prev_30) > 0:
            change_pct = round(((len(last_30) - len(prev_30)) / len(prev_30)) * 100, 1)
        else:
            change_pct = 100.0 if len(last_30) > 0 else 0.0
    else:
        change_pct = 0.0

    avg_rating = round(reviews["rating"].mean(), 2) if total_reviews else 0.0

    positive = len(reviews[reviews["sentiment"] == "Positive"])
    negative = len(reviews[reviews["sentiment"] == "Negative"])
    neutral = len(reviews[reviews["sentiment"] == "Neutral"])

    total_orders = len(orders)
    total_returns = len(orders[orders["order_status"] == "Returned"])
    return_rate = _pct(total_returns, total_orders)

    critical_issues = len(reviews[reviews["severity"] == "Critical"])

    return {
        "total_reviews": total_reviews,
        "total_reviews_change_pct": change_pct,
        "average_rating": avg_rating,
        "positive_sentiment_pct": _pct(positive, total_reviews),
        "negative_sentiment_pct": _pct(negative, total_reviews),
        "neutral_sentiment_pct": _pct(neutral, total_reviews),
        "return_rate_pct": return_rate,
        "critical_issues": critical_issues,
    }


@router.get("/sentiment-trend")
def get_sentiment_trend(
    product_id: str = None, category: str = None, topic: str = None,
    date_from: str = None, date_to: str = None,
):
    store = get_store()
    reviews = apply_review_filters(
        store.reviews_df, product_id=product_id, category=category,
        topic=topic, date_from=date_from, date_to=date_to,
    )
    if reviews.empty:
        return {"trend": []}

    reviews = reviews.copy()
    reviews["week"] = reviews["review_date"].dt.to_period("W").apply(lambda p: p.start_time.strftime("%Y-%m-%d"))

    grouped = reviews.groupby("week").agg(
        avg_sentiment_score=("sentiment_score", "mean"),
        positive=("sentiment", lambda s: (s == "Positive").sum()),
        negative=("sentiment", lambda s: (s == "Negative").sum()),
        neutral=("sentiment", lambda s: (s == "Neutral").sum()),
        total=("sentiment", "count"),
    ).reset_index()

    grouped["avg_sentiment_score"] = grouped["avg_sentiment_score"].round(3)
    grouped = grouped.sort_values("week")

    trend = grouped.to_dict(orient="records")
    return {"trend": trend}


@router.get("/topic-distribution")
def get_topic_distribution(
    product_id: str = None, category: str = None, sentiment: str = None,
    date_from: str = None, date_to: str = None,
):
    store = get_store()
    reviews = apply_review_filters(
        store.reviews_df, product_id=product_id, category=category,
        sentiment=sentiment, date_from=date_from, date_to=date_to,
    )
    negative_only = reviews[reviews["sentiment"] == "Negative"]

    all_counts = reviews["topic"].value_counts().to_dict()
    neg_counts = negative_only["topic"].value_counts().to_dict()

    topics = sorted(set(list(all_counts.keys()) + list(neg_counts.keys())))
    data = [
        {
            "topic": t,
            "total_mentions": int(all_counts.get(t, 0)),
            "negative_mentions": int(neg_counts.get(t, 0)),
        }
        for t in topics
    ]
    data.sort(key=lambda x: x["negative_mentions"], reverse=True)
    return {"distribution": data}


@router.get("/rating-distribution")
def get_rating_distribution(
    product_id: str = None, category: str = None,
    date_from: str = None, date_to: str = None,
):
    store = get_store()
    reviews = apply_review_filters(
        store.reviews_df, product_id=product_id, category=category,
        date_from=date_from, date_to=date_to,
    )
    counts = reviews["rating"].value_counts().to_dict()
    data = [{"rating": r, "count": int(counts.get(r, 0))} for r in [1, 2, 3, 4, 5]]
    return {"distribution": data}


@router.get("/issues")
def get_issues(
    product_id: str = None, category: str = None,
    date_from: str = None, date_to: str = None,
):
    store = get_store()
    reviews = apply_review_filters(
        store.reviews_df, product_id=product_id, category=category,
        date_from=date_from, date_to=date_to,
    )
    negative = reviews[reviews["sentiment"] == "Negative"]

    if negative.empty:
        return {"issues": []}

    max_date = reviews["review_date"].max()
    issues = []
    for topic, group in negative.groupby("topic"):
        mentions = len(group)
        topic_all = reviews[reviews["topic"] == topic]
        negative_pct = _pct(mentions, len(topic_all))

        # severity = most common severity among this topic's negative reviews
        severity_counts = group["severity"].value_counts()
        severity = severity_counts.idxmax() if not severity_counts.empty else "Low"

        # trend: mentions in last 30 days vs prior 30 days
        last_30 = group[group["review_date"] > max_date - timedelta(days=30)]
        prev_30 = group[
            (group["review_date"] > max_date - timedelta(days=60)) &
            (group["review_date"] <= max_date - timedelta(days=30))
        ]
        if len(prev_30) > 0:
            trend_pct = round(((len(last_30) - len(prev_30)) / len(prev_30)) * 100, 1)
        else:
            trend_pct = 100.0 if len(last_30) > 0 else 0.0

        affected_products = group["product_name"].value_counts().head(3).index.tolist()

        issues.append({
            "issue": topic,
            "mentions": mentions,
            "negative_pct": negative_pct,
            "severity": severity,
            "trend_pct": trend_pct,
            "affected_products": affected_products,
        })

    issues.sort(key=lambda x: x["mentions"], reverse=True)
    return {"issues": issues}
