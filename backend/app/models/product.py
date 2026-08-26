from pydantic import BaseModel
from typing import Optional, List


class Product(BaseModel):
    product_id: str
    product_name: str
    category: str
    price: float
    color: str
    average_rating: float
    total_orders: int
    review_count: int
    return_rate: float
    negative_pct: float
    main_issue: str


class SentimentBreakdown(BaseModel):
    positive: int
    neutral: int
    negative: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float


class TopIssue(BaseModel):
    topic: str
    count: int


class ProductDetail(BaseModel):
    product: Product
    sentiment_breakdown: SentimentBreakdown
    top_complaints: List[TopIssue]
    top_positive_themes: List[TopIssue]
    review_trend: list
    recommendations: list
    recent_reviews: list
