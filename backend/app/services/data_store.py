"""
data_store.py
-------------
Loads the CSV datasets (products, orders, reviews), enriches every review
with the deterministic AI analysis pipeline, and exposes them as pandas
DataFrames cached in memory for the lifetime of the process.

This acts as the demo's "database layer". Swapping this for a real DB
would only require changing the `load_*` functions.
"""
import os
import pandas as pd

from app.services.review_analyzer import analyze_review

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class DataStore:
    _instance = None

    def __init__(self):
        self.products_df = None
        self.orders_df = None
        self.reviews_df = None
        self._load_all()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataStore()
        return cls._instance

    def _load_all(self):
        self.products_df = pd.read_csv(os.path.join(DATA_DIR, "products.csv"))
        self.orders_df = pd.read_csv(os.path.join(DATA_DIR, "orders.csv"))
        reviews_df = pd.read_csv(os.path.join(DATA_DIR, "reviews.csv"))

        reviews_df["review_date"] = pd.to_datetime(reviews_df["review_date"])

        # Run the AI analysis pipeline once per review, cache results as columns
        analyses = reviews_df.apply(
            lambda row: analyze_review(row["review_text"], row["rating"]), axis=1
        )
        reviews_df["sentiment"] = analyses.apply(lambda a: a["sentiment"])
        reviews_df["sentiment_score"] = analyses.apply(lambda a: a["sentiment_score"])
        reviews_df["topic"] = analyses.apply(lambda a: a["topic"])
        reviews_df["severity"] = analyses.apply(lambda a: a["severity"])

        # Merge in product info for convenience
        reviews_df = reviews_df.merge(
            self.products_df[["product_id", "product_name", "category"]],
            on="product_id", how="left"
        )

        self.orders_df["order_date"] = pd.to_datetime(self.orders_df["order_date"])

        # Compute per-product aggregate metrics
        self.products_df = self._enrich_products(self.products_df, self.orders_df, reviews_df)

        self.reviews_df = reviews_df

    def _enrich_products(self, products_df, orders_df, reviews_df):
        products_df = products_df.copy()

        order_counts = orders_df.groupby("product_id").size().rename("total_orders")
        products_df = products_df.merge(order_counts, on="product_id", how="left")
        products_df["total_orders"] = products_df["total_orders"].fillna(0).astype(int)

        returned = orders_df[orders_df["order_status"] == "Returned"]
        return_counts = returned.groupby("product_id").size().rename("total_returns")
        products_df = products_df.merge(return_counts, on="product_id", how="left")
        products_df["total_returns"] = products_df["total_returns"].fillna(0).astype(int)
        products_df["return_rate"] = (
            products_df["total_returns"] / products_df["total_orders"].replace(0, pd.NA)
        ).fillna(0).round(4)

        avg_rating = reviews_df.groupby("product_id")["rating"].mean().rename("average_rating")
        products_df = products_df.merge(avg_rating, on="product_id", how="left")
        products_df["average_rating"] = products_df["average_rating"].fillna(0).round(2)

        review_counts = reviews_df.groupby("product_id").size().rename("review_count")
        products_df = products_df.merge(review_counts, on="product_id", how="left")
        products_df["review_count"] = products_df["review_count"].fillna(0).astype(int)

        neg_counts = (
            reviews_df[reviews_df["sentiment"] == "Negative"]
            .groupby("product_id").size().rename("negative_count")
        )
        products_df = products_df.merge(neg_counts, on="product_id", how="left")
        products_df["negative_count"] = products_df["negative_count"].fillna(0).astype(int)
        products_df["negative_pct"] = (
            products_df["negative_count"] / products_df["review_count"].replace(0, pd.NA)
        ).fillna(0).round(4)

        # main issue = most common topic among negative reviews for this product
        def main_issue(pid):
            subset = reviews_df[(reviews_df["product_id"] == pid) & (reviews_df["sentiment"] == "Negative")]
            if subset.empty:
                return "None"
            return subset["topic"].value_counts().idxmax()

        products_df["main_issue"] = products_df["product_id"].apply(main_issue)

        return products_df

    def refresh(self):
        """Reload all data from disk (useful if CSVs are regenerated)."""
        self._load_all()


def get_store() -> DataStore:
    return DataStore.get_instance()
