from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd

from app.services.data_store import get_store

router = APIRouter(prefix="/api", tags=["reviews"])


def apply_review_filters(
    df: pd.DataFrame,
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    topic: Optional[str] = None,
    rating: Optional[int] = None,
    verified_purchase: Optional[bool] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
) -> pd.DataFrame:
    result = df.copy()

    if product_id:
        result = result[result["product_id"] == product_id]
    if category:
        result = result[result["category"] == category]
    if sentiment:
        result = result[result["sentiment"].str.lower() == sentiment.lower()]
    if topic:
        result = result[result["topic"] == topic]
    if rating is not None:
        result = result[result["rating"] == rating]
    if verified_purchase is not None:
        result = result[result["verified_purchase"] == verified_purchase]
    if date_from:
        result = result[result["review_date"] >= pd.to_datetime(date_from)]
    if date_to:
        result = result[result["review_date"] <= pd.to_datetime(date_to)]
    if search:
        result = result[result["review_text"].str.contains(search, case=False, na=False)]

    return result


@router.get("/reviews")
def list_reviews(
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    topic: Optional[str] = None,
    rating: Optional[int] = None,
    verified_purchase: Optional[bool] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "review_date",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20,
):
    store = get_store()
    filtered = apply_review_filters(
        store.reviews_df,
        product_id=product_id, category=category, sentiment=sentiment,
        topic=topic, rating=rating, verified_purchase=verified_purchase,
        date_from=date_from, date_to=date_to, search=search,
    )

    if sort_by in filtered.columns:
        filtered = filtered.sort_values(sort_by, ascending=(sort_order == "asc"))

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = filtered.iloc[start:end].copy()
    page_data["review_date"] = page_data["review_date"].dt.strftime("%Y-%m-%d")

    results = page_data.to_dict(orient="records")

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": results,
    }


@router.get("/reviews/{review_id}")
def get_review(review_id: str):
    store = get_store()
    row = store.reviews_df[store.reviews_df["review_id"] == review_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Review not found")

    r = row.iloc[0].to_dict()
    r["review_date"] = pd.to_datetime(r["review_date"]).strftime("%Y-%m-%d")

    # Build a short AI explanation describing how the analysis was derived
    explanation_parts = [
        f"This review was classified as {r['sentiment']} with a sentiment score of {r['sentiment_score']} "
        f"(range -1 to +1), derived from a blend of review-text language and the {r['rating']}-star rating."
    ]
    explanation_parts.append(f"The dominant topic detected was '{r['topic']}', identified via keyword and phrase analysis of the review text.")
    if r.get("severity"):
        explanation_parts.append(f"Because the review expresses a negative issue, it was flagged with '{r['severity']}' severity based on language intensity and rating.")
    else:
        explanation_parts.append("No negative issue severity was assigned since the review does not describe a significant problem.")

    r["ai_explanation"] = " ".join(explanation_parts)

    return r
