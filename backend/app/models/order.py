from pydantic import BaseModel
from typing import Optional


class Order(BaseModel):
    order_id: str
    customer_id: str
    product_id: str
    order_date: str
    delivery_date: Optional[str] = None
    order_status: str
    quantity: int
    order_value: float
    delivery_days: Optional[float] = None
    return_status: str
    return_reason: Optional[str] = None


class DashboardKPIs(BaseModel):
    total_reviews: int
    total_reviews_change_pct: float
    average_rating: float
    positive_sentiment_pct: float
    negative_sentiment_pct: float
    neutral_sentiment_pct: float
    return_rate_pct: float
    critical_issues: int


class Insight(BaseModel):
    id: int
    type: str
    title: str
    explanation: str
    supporting_metric: str
    impact: str
    recommended_action: str
    priority: str


class Recommendation(BaseModel):
    id: int
    title: str
    category: str
    priority: str
    reason: str
    supporting_metric: str
    recommended_action: str


class IssueSummary(BaseModel):
    issue: str
    mentions: int
    negative_pct: float
    severity: str
    trend_pct: float
    affected_products: list[str]
