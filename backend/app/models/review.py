from pydantic import BaseModel
from typing import Optional


class Review(BaseModel):
    review_id: str
    order_id: str
    customer_id: str
    product_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    rating: int
    review_text: str
    review_date: str
    verified_purchase: bool
    sentiment: str
    sentiment_score: float
    topic: str
    severity: Optional[str] = None


class ReviewListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[Review]


class ReviewDetail(Review):
    ai_explanation: str
