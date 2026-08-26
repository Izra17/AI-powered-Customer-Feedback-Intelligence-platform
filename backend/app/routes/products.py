from fastapi import APIRouter, HTTPException
from typing import Optional
import pandas as pd

from app.services.data_store import get_store
from app.services.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/api", tags=["products"])


def _pct(n, d):
    if d == 0:
        return 0.0
    return round((n / d) * 100, 1)


@router.get("/products")
def list_products(category: Optional[str] = None, sort_by: str = "review_count", sort_order: str = "desc"):
    store = get_store()
    df = store.products_df.copy()
    if category:
        df = df[df["category"] == category]

    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=(sort_order == "asc"))

    return {"total": len(df), "results": df.to_dict(orient="records")}


@router.get("/products/{product_id}")
def get_product_detail(product_id: str):
    store = get_store()
    product_row = store.products_df[store.products_df["product_id"] == product_id]
    if product_row.empty:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_row.iloc[0].to_dict()

    reviews = store.reviews_df[store.reviews_df["product_id"] == product_id].copy()
    orders = store.orders_df[store.orders_df["product_id"] == product_id].copy()

    total_reviews = len(reviews)
    positive = len(reviews[reviews["sentiment"] == "Positive"])
    neutral = len(reviews[reviews["sentiment"] == "Neutral"])
    negative = len(reviews[reviews["sentiment"] == "Negative"])

    sentiment_breakdown = {
        "positive": positive, "neutral": neutral, "negative": negative,
        "positive_pct": _pct(positive, total_reviews),
        "neutral_pct": _pct(neutral, total_reviews),
        "negative_pct": _pct(negative, total_reviews),
    }

    negative_reviews = reviews[reviews["sentiment"] == "Negative"]
    top_complaints = (
        negative_reviews["topic"].value_counts().head(5)
        .reset_index().rename(columns={"index": "topic", "topic": "topic", "count": "count"})
    )
    # value_counts().reset_index() column naming can vary by pandas version; normalize:
    top_complaints.columns = ["topic", "count"]
    top_complaints_list = top_complaints.to_dict(orient="records")

    positive_reviews = reviews[reviews["sentiment"] == "Positive"]
    top_positive = positive_reviews["topic"].value_counts().head(5).reset_index()
    top_positive.columns = ["topic", "count"]
    top_positive_list = top_positive.to_dict(orient="records")

    # review trend (monthly average rating + review count)
    if not reviews.empty:
        reviews["month"] = reviews["review_date"].dt.to_period("M").apply(lambda p: p.start_time.strftime("%Y-%m"))
        trend = reviews.groupby("month").agg(
            avg_rating=("rating", "mean"),
            review_count=("rating", "count"),
            avg_sentiment=("sentiment_score", "mean"),
        ).reset_index()
        trend["avg_rating"] = trend["avg_rating"].round(2)
        trend["avg_sentiment"] = trend["avg_sentiment"].round(3)
        trend = trend.sort_values("month")
        review_trend = trend.to_dict(orient="records")
    else:
        review_trend = []

    # product-specific recommendations (reuse engine, scoped to this product's data)
    recs = generate_recommendations(reviews, orders, product_row)

    recent_reviews = reviews.sort_values("review_date", ascending=False).head(8).copy()
    recent_reviews["review_date"] = recent_reviews["review_date"].dt.strftime("%Y-%m-%d")
    recent_reviews_list = recent_reviews.to_dict(orient="records")

    return {
        "product": product,
        "sentiment_breakdown": sentiment_breakdown,
        "top_complaints": top_complaints_list,
        "top_positive_themes": top_positive_list,
        "review_trend": review_trend,
        "recommendations": recs,
        "recent_reviews": recent_reviews_list,
    }
