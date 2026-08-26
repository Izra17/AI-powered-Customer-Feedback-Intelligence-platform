"""
insight_engine.py
------------------
The AI Insight Engine analyzes aggregated review + order data and produces
natural-language business insights, entirely derived from the underlying
dataset (no hardcoded sentences).

Public interface:
    generate_insights(reviews_df, orders_df, products_df) -> List[dict]

Each insight has: id, type, title, explanation, supporting_metric,
impact, recommended_action, priority
"""
import pandas as pd
from datetime import timedelta


def _pct(n, d):
    if d == 0:
        return 0.0
    return round((n / d) * 100, 1)


def generate_insights(reviews_df: pd.DataFrame, orders_df: pd.DataFrame, products_df: pd.DataFrame):
    insights = []
    insight_id = 1

    negative = reviews_df[reviews_df["sentiment"] == "Negative"]
    total_negative = len(negative)

    # ------------------------------------------------------------------
    # 1. Most frequent negative topic overall (Emerging Issue)
    # ------------------------------------------------------------------
    if total_negative > 0:
        topic_counts = negative["topic"].value_counts()
        top_topic = topic_counts.idxmax()
        top_topic_count = int(topic_counts.max())
        top_topic_pct = _pct(top_topic_count, total_negative)

        # find product category with highest concentration of this topic
        topic_subset = negative[negative["topic"] == top_topic]
        cat_counts = topic_subset["category"].value_counts()
        top_category = cat_counts.idxmax() if not cat_counts.empty else "several categories"

        insights.append({
            "id": insight_id,
            "type": "Emerging Issue",
            "title": f"{top_topic} is the leading driver of negative feedback",
            "explanation": (
                f"{top_topic} is the most frequently mentioned negative issue, accounting for "
                f"{top_topic_pct}% of all negative feedback. Products in the {top_category} "
                f"category show the highest concentration of related complaints."
            ),
            "supporting_metric": f"{top_topic_count} mentions ({top_topic_pct}% of negative reviews)",
            "impact": "High" if top_topic_pct > 25 else "Medium",
            "recommended_action": f"Prioritize a root-cause review of {top_topic.lower()} complaints, starting with {top_category} products.",
            "priority": "High" if top_topic_pct > 25 else "Medium",
        })
        insight_id += 1

    # ------------------------------------------------------------------
    # 2. Product opportunity: high rating but high return rate
    # ------------------------------------------------------------------
    candidates = products_df[
        (products_df["average_rating"] >= 4.0) & (products_df["return_rate"] >= 0.10)
    ].sort_values("return_rate", ascending=False)

    if not candidates.empty:
        prod = candidates.iloc[0]
        # find dominant return reason for this product
        prod_orders = orders_df[
            (orders_df["product_id"] == prod["product_id"]) & (orders_df["return_status"] == "Returned")
        ]
        reason = "size mismatch"
        if not prod_orders.empty and prod_orders["return_reason"].notna().any():
            top_reason = prod_orders["return_reason"].value_counts().idxmax()
            reason = top_reason.lower()

        insights.append({
            "id": insight_id,
            "type": "Product Opportunity",
            "title": f"{prod['product_name']} has strong ratings but elevated returns",
            "explanation": (
                f"{prod['product_name']} has a high average rating of {prod['average_rating']}/5 "
                f"but an unusually high return rate of {round(prod['return_rate']*100,1)}%. "
                f"The main return reason is {reason}, suggesting an opportunity to improve "
                f"sizing guidance or product descriptions."
            ),
            "supporting_metric": f"{round(prod['return_rate']*100,1)}% return rate, {prod['average_rating']}/5 rating",
            "impact": "High",
            "recommended_action": f"Improve the size guide and product description for {prod['product_name']} to reduce {reason}-driven returns.",
            "priority": "High",
        })
        insight_id += 1

    # ------------------------------------------------------------------
    # 3. Delivery sentiment trend over last 30 days vs prior period
    # ------------------------------------------------------------------
    if not reviews_df.empty:
        max_date = reviews_df["review_date"].max()
        last_30_start = max_date - timedelta(days=30)
        prev_30_start = max_date - timedelta(days=60)

        recent = reviews_df[(reviews_df["review_date"] > last_30_start) & (reviews_df["topic"] == "Delivery")]
        prior = reviews_df[
            (reviews_df["review_date"] > prev_30_start) &
            (reviews_df["review_date"] <= last_30_start) &
            (reviews_df["topic"] == "Delivery")
        ]

        recent_neg_pct = _pct(len(recent[recent["sentiment"] == "Negative"]), len(recent)) if len(recent) else 0
        prior_neg_pct = _pct(len(prior[prior["sentiment"] == "Negative"]), len(prior)) if len(prior) else 0

        if recent_neg_pct >= prior_neg_pct and len(recent) >= 3:
            change = recent_neg_pct - prior_neg_pct
            insights.append({
                "id": insight_id,
                "type": "Customer Experience Risk",
                "title": "Delivery-related negative sentiment is increasing",
                "explanation": (
                    f"Negative sentiment around delivery increased during the last 30 days, "
                    f"from {prior_neg_pct}% to {recent_neg_pct}% of delivery-related reviews "
                    f"({'+' if change >= 0 else ''}{round(change,1)} points)."
                ),
                "supporting_metric": f"{recent_neg_pct}% negative in last 30 days vs {prior_neg_pct}% prior period",
                "impact": "Medium",
                "recommended_action": "Investigate carrier performance and delivery SLAs for recent shipments; consider proactive tracking updates.",
                "priority": "Medium",
            })
            insight_id += 1

    # ------------------------------------------------------------------
    # 4. Marketing opportunity: frequently mentioned positive theme
    # ------------------------------------------------------------------
    positive = reviews_df[reviews_df["sentiment"] == "Positive"]
    if not positive.empty:
        pos_topic_counts = positive["topic"].value_counts()
        top_pos_topic = pos_topic_counts.idxmax()
        top_pos_count = int(pos_topic_counts.max())
        top_pos_pct = _pct(top_pos_count, len(positive))

        insights.append({
            "id": insight_id,
            "type": "Marketing Opportunity",
            "title": f"Customers consistently highlight {top_pos_topic.lower()} as a strength",
            "explanation": (
                f"Customers frequently mention {top_pos_topic.lower()} in positive reviews "
                f"({top_pos_pct}% of positive feedback). Consider emphasizing this benefit "
                f"more prominently in product messaging and marketing creative."
            ),
            "supporting_metric": f"{top_pos_count} positive mentions ({top_pos_pct}% of positive reviews)",
            "impact": "Medium",
            "recommended_action": f"Update product descriptions and marketing creative to emphasize {top_pos_topic.lower()}.",
            "priority": "Low",
        })
        insight_id += 1

    # ------------------------------------------------------------------
    # 5. Size & Fit trend (explicit, since it's commonly the biggest driver)
    # ------------------------------------------------------------------
    size_reviews = reviews_df[reviews_df["topic"] == "Size & Fit"]
    if not size_reviews.empty and not reviews_df.empty:
        max_date = reviews_df["review_date"].max()
        last_30 = size_reviews[size_reviews["review_date"] > max_date - timedelta(days=30)]
        prev_30 = size_reviews[
            (size_reviews["review_date"] > max_date - timedelta(days=60)) &
            (size_reviews["review_date"] <= max_date - timedelta(days=30))
        ]
        if len(prev_30) > 0:
            change_pct = round(((len(last_30) - len(prev_30)) / len(prev_30)) * 100, 1)
        else:
            change_pct = 100.0 if len(last_30) > 0 else 0.0

        if len(last_30) >= 3:
            insights.append({
                "id": insight_id,
                "type": "Emerging Issue",
                "title": "Size complaints trending upward this month",
                "explanation": (
                    f"Size & Fit related complaints changed by {'+' if change_pct >= 0 else ''}{change_pct}% "
                    f"in the last 30 days compared to the previous 30-day period, with {len(last_30)} "
                    f"mentions recently."
                ),
                "supporting_metric": f"{len(last_30)} mentions in last 30 days ({'+' if change_pct>=0 else ''}{change_pct}% vs prior period)",
                "impact": "High" if change_pct > 15 else "Medium",
                "recommended_action": "Audit the size guide accuracy across top-selling products and add fit-confidence messaging at checkout.",
                "priority": "High" if change_pct > 15 else "Medium",
            })
            insight_id += 1

    return insights
