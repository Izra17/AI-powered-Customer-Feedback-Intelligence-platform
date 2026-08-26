from fastapi import APIRouter
from typing import Optional

from app.services.data_store import get_store
from app.services.insight_engine import generate_insights
from app.services.recommendation_engine import generate_recommendations
from app.routes.reviews import apply_review_filters

router = APIRouter(prefix="/api", tags=["insights"])


@router.get("/insights")
def get_insights(product_id: Optional[str] = None, category: Optional[str] = None):
    store = get_store()
    reviews = apply_review_filters(store.reviews_df, product_id=product_id, category=category)
    orders = store.orders_df.copy()
    if product_id:
        orders = orders[orders["product_id"] == product_id]

    products = store.products_df.copy()
    if category:
        products = products[products["category"] == category]

    insights = generate_insights(reviews, orders, products)
    return {"insights": insights}


@router.get("/recommendations")
def get_recommendations(product_id: Optional[str] = None, category: Optional[str] = None):
    store = get_store()
    reviews = apply_review_filters(store.reviews_df, product_id=product_id, category=category)
    orders = store.orders_df.copy()
    if product_id:
        orders = orders[orders["product_id"] == product_id]

    products = store.products_df.copy()
    if category:
        products = products[products["category"] == category]

    recs = generate_recommendations(reviews, orders, products)
    return {"recommendations": recs}
