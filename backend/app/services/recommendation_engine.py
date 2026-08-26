"""
recommendation_engine.py
-------------------------
Generates actionable recommendations across Product, Marketing, and
Operations categories, derived from the underlying review/order dataset.

Public interface:
    generate_recommendations(reviews_df, orders_df, products_df) -> List[dict]

Each recommendation: title, category, priority, reason, supporting_metric,
recommended_action
"""
import pandas as pd


def _pct(n, d):
    if d == 0:
        return 0.0
    return round((n / d) * 100, 1)


def generate_recommendations(reviews_df: pd.DataFrame, orders_df: pd.DataFrame, products_df: pd.DataFrame):
    recs = []
    rec_id = 1

    negative = reviews_df[reviews_df["sentiment"] == "Negative"]
    total_negative = len(negative)
    total_reviews = len(reviews_df)

    topic_counts = negative["topic"].value_counts() if total_negative else pd.Series(dtype=int)

    # ---------------- PRODUCT RECOMMENDATIONS ----------------
    if "Size & Fit" in topic_counts:
        count = int(topic_counts["Size & Fit"])
        pct = _pct(count, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Review sizing consistency across product line",
            "category": "Product",
            "priority": "High" if pct > 20 else "Medium",
            "reason": f"Size & Fit complaints make up {pct}% of negative reviews, indicating a systemic sizing issue rather than isolated incidents.",
            "supporting_metric": f"{count} size-related negative reviews ({pct}% of negative feedback)",
            "recommended_action": "Conduct a sizing audit against manufacturing tolerances and update size charts per product line.",
        })
        rec_id += 1

    if "Durability" in topic_counts:
        count = int(topic_counts["Durability"])
        pct = _pct(count, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Improve sole and material durability",
            "category": "Product",
            "priority": "High" if pct > 15 else "Medium",
            "reason": f"Durability-related complaints account for {pct}% of negative feedback, often citing early sole wear or cracking.",
            "supporting_metric": f"{count} durability complaints ({pct}% of negative feedback)",
            "recommended_action": "Engage manufacturing/QA to evaluate sole compound and stitching specifications for affected product lines.",
        })
        rec_id += 1

    if "Comfort" in topic_counts:
        count = int(topic_counts["Comfort"])
        pct = _pct(count, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Enhance cushioning and arch support",
            "category": "Product",
            "priority": "Medium",
            "reason": f"Comfort-related issues represent {pct}% of negative feedback, commonly referencing insufficient cushioning or arch support.",
            "supporting_metric": f"{count} comfort complaints ({pct}% of negative feedback)",
            "recommended_action": "Pilot an updated insole/midsole design for the most-affected SKUs and gather comfort-focused customer feedback.",
        })
        rec_id += 1

    if "Quality" in topic_counts:
        count = int(topic_counts["Quality"])
        pct = _pct(count, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Strengthen material and build quality checks",
            "category": "Product",
            "priority": "Medium" if pct < 20 else "High",
            "reason": f"Quality-related complaints make up {pct}% of negative feedback, including stitching and fading issues.",
            "supporting_metric": f"{count} quality complaints ({pct}% of negative feedback)",
            "recommended_action": "Introduce stricter QA sampling on incoming batches and review supplier material specifications.",
        })
        rec_id += 1

    # ---------------- MARKETING RECOMMENDATIONS ----------------
    positive = reviews_df[reviews_df["sentiment"] == "Positive"]
    if not positive.empty:
        pos_topic_counts = positive["topic"].value_counts()
        if "Comfort" in pos_topic_counts:
            count = int(pos_topic_counts["Comfort"])
            pct = _pct(count, len(positive))
            recs.append({
                "id": rec_id,
                "title": "Highlight comfort benefits in marketing",
                "category": "Marketing",
                "priority": "Low",
                "reason": f"Comfort is praised in {pct}% of positive reviews, making it a strong, authentic marketing angle.",
                "supporting_metric": f"{count} positive comfort mentions ({pct}% of positive feedback)",
                "recommended_action": "Feature comfort-focused testimonials and imagery in product pages and ad creative.",
            })
            rec_id += 1

    if "Size & Fit" in topic_counts:
        count = int(topic_counts["Size & Fit"])
        pct = _pct(count, total_negative)
        if pct > 15:
            recs.append({
                "id": rec_id,
                "title": "Improve size-guide messaging on product pages",
                "category": "Marketing",
                "priority": "High" if pct > 20 else "Medium",
                "reason": f"With {pct}% of negative reviews citing sizing issues, clearer on-page sizing guidance could reduce pre-purchase uncertainty and returns.",
                "supporting_metric": f"{pct}% of negative reviews mention sizing",
                "recommended_action": "Add a fit-confidence widget and clearer size conversion charts to product detail pages.",
            })
            rec_id += 1

    design_neg = topic_counts.get("Design", 0)
    if design_neg > 0:
        pct = _pct(design_neg, total_negative)
        if pct > 5:
            recs.append({
                "id": rec_id,
                "title": "Refresh product photography for color accuracy",
                "category": "Marketing",
                "priority": "Low",
                "reason": f"{pct}% of negative reviews mention color or appearance differing from what was shown online.",
                "supporting_metric": f"{int(design_neg)} design/color related complaints",
                "recommended_action": "Re-shoot product photography under standardized lighting and add customer photo galleries.",
            })
            rec_id += 1

    # ---------------- OPERATIONS RECOMMENDATIONS ----------------
    delivery_neg = topic_counts.get("Delivery", 0)
    if delivery_neg > 0:
        pct = _pct(delivery_neg, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Investigate delivery delays with logistics partners",
            "category": "Operations",
            "priority": "High" if pct > 15 else "Medium",
            "reason": f"Delivery-related complaints account for {pct}% of negative feedback, frequently citing delays and poor tracking updates.",
            "supporting_metric": f"{int(delivery_neg)} delivery complaints ({pct}% of negative feedback)",
            "recommended_action": "Audit carrier SLAs, set proactive delay notifications, and review last-mile delivery performance by region.",
        })
        rec_id += 1

    packaging_neg = topic_counts.get("Packaging", 0)
    if packaging_neg > 0:
        pct = _pct(packaging_neg, total_negative)
        recs.append({
            "id": rec_id,
            "title": "Improve protective packaging",
            "category": "Operations",
            "priority": "Low" if pct < 5 else "Medium",
            "reason": f"{pct}% of negative reviews mention damaged packaging or products arriving with scuffs.",
            "supporting_metric": f"{int(packaging_neg)} packaging-related complaints",
            "recommended_action": "Introduce reinforced protective packaging for footwear boxes, particularly for long-distance shipments.",
        })
        rec_id += 1

    return_neg = topic_counts.get("Return Experience", 0)
    total_orders = len(orders_df)
    total_returns = len(orders_df[orders_df["order_status"] == "Returned"])
    return_rate = _pct(total_returns, total_orders)
    if return_neg > 0 or return_rate > 8:
        recs.append({
            "id": rec_id,
            "title": "Streamline the returns and refund process",
            "category": "Operations",
            "priority": "High" if return_rate > 10 else "Medium",
            "reason": f"Overall return rate is {return_rate}%, and customers report slow refunds and rescheduled pickups.",
            "supporting_metric": f"{return_rate}% overall return rate, {int(return_neg)} return-experience complaints",
            "recommended_action": "Set SLA targets for refund processing time and automate return-status notifications to customers.",
        })
        rec_id += 1

    # sort by priority (High > Medium > Low)
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recs.sort(key=lambda r: priority_order.get(r["priority"], 3))
    return recs
