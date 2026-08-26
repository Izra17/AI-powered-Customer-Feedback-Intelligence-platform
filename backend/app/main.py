from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import dashboard, reviews, products, insights
from app.services.data_store import get_store

app = FastAPI(
    title="Neeman's Feedback Intelligence API",
    description="AI-powered customer feedback & order intelligence backend for Neeman's internal teams.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Warm the in-memory data store (loads CSVs + runs AI analysis pipeline once)
    get_store()


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred.", "error": str(exc)},
    )


app.include_router(dashboard.router)
app.include_router(reviews.router)
app.include_router(products.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {
        "service": "Neeman's Feedback Intelligence API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/meta/filters")
def get_filter_options():
    """Returns the available values for global filters (products, categories, topics, etc.)"""
    store = get_store()
    products_df = store.products_df
    reviews_df = store.reviews_df
    orders_df = store.orders_df

    return {
        "products": products_df[["product_id", "product_name"]].to_dict(orient="records"),
        "categories": sorted(products_df["category"].unique().tolist()),
        "topics": sorted(reviews_df["topic"].unique().tolist()),
        "sentiments": ["Positive", "Neutral", "Negative"],
        "ratings": [1, 2, 3, 4, 5],
        "order_statuses": sorted(orders_df["order_status"].unique().tolist()),
        "date_min": reviews_df["review_date"].min().strftime("%Y-%m-%d"),
        "date_max": reviews_df["review_date"].max().strftime("%Y-%m-%d"),
    }
