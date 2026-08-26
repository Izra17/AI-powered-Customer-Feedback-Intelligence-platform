# Neeman's Feedback Intelligence

**AI-powered customer feedback & order intelligence** — an internal business intelligence tool for Neeman's product, customer experience, marketing, and operations teams.

---

## Overview

### The business problem

Neeman's receives thousands of customer reviews across its footwear catalog, but internal teams struggle to answer basic questions from that raw data:

- What are customers actually happy with?
- What are the recurring complaints, and which products drive them?
- Are negative reviews about sizing, comfort, quality, durability, or delivery?
- Which issues are getting *worse* over time, not just present?
- Which products need product, marketing, or operations attention — and why?

Reading through thousands of free-text reviews manually doesn't scale. Star ratings alone don't explain *why* customers are unhappy or *what to do about it*.

### The solution

**Neeman's Feedback Intelligence** combines three data sources — **customer reviews**, **order/return data**, and **product data** — and runs them through a deterministic, rule-based AI analysis pipeline that:

1. Scores the **sentiment** of every review (Positive / Neutral / Negative, with a -1 to +1 score)
2. Classifies each review into a **topic** (Size & Fit, Comfort, Quality, Durability, Delivery, Return Experience, Design, Price & Value, Material, Packaging, Other)
3. Flags **issue severity** (Low / Medium / High / Critical) for negative reviews
4. Aggregates all of this into **AI-generated insights** (emerging issues, product opportunities, CX risks, marketing opportunities)
5. Produces prioritized, actionable **recommendations** across Product, Marketing, and Operations

Everything shown in the dashboard — KPIs, charts, issue lists, insights, recommendations — is computed live from the underlying dataset by the backend. Nothing is hardcoded in the frontend.

---

## Features

- 📊 **Interactive dashboard** — KPIs, sentiment distribution, sentiment trend, topic breakdown, rating distribution, and AI-detected issues
- 💬 **Customer review analysis** — sentiment, topic, and severity computed per review
- 🔍 **Review Explorer** — full-text search plus filters for product, category, rating, sentiment, topic, date range, and verified purchase
- 📦 **Product Intelligence** — sortable product comparison table and a full per-product deep-dive page (sentiment breakdown, top complaints, top positive themes, review trend, recommendations, recent reviews)
- 🧠 **AI Insights page** — auto-generated insights (Emerging Issue, Product Opportunity, Customer Experience Risk, Marketing Opportunity), each with explanation, supporting data, impact, and recommended action
- ✅ **AI Recommendations page** — prioritized Product / Marketing / Operations recommendations, filterable by category
- 🔁 **Return-rate analysis** — return rate and return reasons tied back into product and issue-level analytics
- 🌍 **Global filtering** — date range, product, category, rating, sentiment, topic, and order status filters that actually query the backend
- ⚠️ **Graceful loading & error states** — skeleton loaders, empty states, and a friendly "backend unavailable" message

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS (custom Neeman's brand theme)
- Recharts (donut, line, bar charts)
- Lucide React (icons)
- React Router (client-side routing)
- Axios (API communication)

### Backend
- Python 3.10+
- FastAPI
- Pydantic (response models)
- Pandas (data aggregation)
- Uvicorn (ASGI server)

No database is required — the backend loads CSV files into memory on startup and serves everything through REST APIs. No paid AI API is required either; the analysis engine is fully self-contained (see [AI Approach](#ai-approach) below).

---

## Project Structure

```text
neemans-feedback-intelligence/
│
├── frontend/                       # React + Vite single-page app
│   ├── src/
│   │   ├── components/             # Sidebar, Header, KPICard, ChartCard, ReviewTable, InsightCard, FilterBar, etc.
│   │   ├── pages/                  # Dashboard, Reviews, Products, ProductDetail, Insights, Recommendations
│   │   ├── context/                # FilterContext (global filter state)
│   │   ├── services/api.js         # Axios client -- all backend calls live here
│   │   ├── utils/display.js        # Formatting + color-mapping helpers
│   │   ├── App.jsx / main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.js / tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, router registration
│   │   ├── routes/                 # dashboard.py, reviews.py, products.py, insights.py
│   │   ├── services/                # sentiment.py, topic_analysis.py, review_analyzer.py,
│   │   │                            # data_store.py, insight_engine.py, recommendation_engine.py
│   │   ├── models/                 # Pydantic models: review.py, product.py, order.py
│   │   └── data/                   # products.csv, orders.csv, reviews.csv (generated dummy data)
│   ├── generate_data.py            # Script that generated the dummy datasets
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

Frontend and backend are fully independent -- the frontend is a static SPA that talks to the backend purely over HTTP.

---

## Installation

### 1. Clone the project

```bash
git clone <repository-url>
cd neemans-feedback-intelligence
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

Install dependencies and run the server:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**, with interactive docs at **http://localhost:8000/docs**.

> The dummy datasets in `backend/app/data/` are already generated and committed, so the app runs immediately. If you want to regenerate them (e.g. with a different random seed or larger volume), run `python generate_data.py` from inside `backend/` before starting the server.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Open the app

Visit `http://localhost:5173` in your browser. The frontend is pre-configured to call the backend at `http://localhost:8000`.

---

## Environment Variables

### Backend
No environment variables are required to run the backend. It reads CSV files bundled in `backend/app/data/` and serves everything in-memory.

### Frontend
One optional variable, set via `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

If not set, the frontend defaults to `http://localhost:8000`, so **no `.env` file is required for local development** with the default setup.

### Optional: integrating a real LLM later
No API key is required to run this project as-is. If you want to swap the deterministic analysis engine for a real LLM provider (OpenAI, Anthropic, etc.), you would add your provider's API key as an environment variable in the backend (e.g. `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) and implement the call inside `app/services/review_analyzer.py`, `insight_engine.py`, and `recommendation_engine.py` -- see [AI Approach](#ai-approach) for how these are structured to make that swap straightforward.

---

## API Documentation

FastAPI automatically generates interactive API documentation once the backend is running:

- Swagger UI: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

### Key endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | KPI summary (total reviews, avg rating, sentiment %, return rate, critical issues) |
| GET | `/api/sentiment-trend` | Weekly sentiment trend (for line chart) |
| GET | `/api/topic-distribution` | Mentions per topic, total + negative (for bar chart) |
| GET | `/api/rating-distribution` | Review count per star rating |
| GET | `/api/issues` | AI-detected recurring issues with mentions, severity, trend, affected products |
| GET | `/api/reviews` | Paginated, filterable, searchable review list |
| GET | `/api/reviews/{review_id}` | Single review with full AI analysis + explanation |
| GET | `/api/products` | Product list with computed metrics (rating, returns, negative %, main issue) |
| GET | `/api/products/{product_id}` | Full product deep-dive (sentiment breakdown, complaints, trend, recommendations, recent reviews) |
| GET | `/api/insights` | AI-generated business insights |
| GET | `/api/recommendations` | AI-generated Product/Marketing/Operations recommendations |
| GET | `/api/meta/filters` | Available filter values (products, categories, topics, date range) used to populate dropdowns |

All list endpoints accept query parameters for filtering, e.g.:

```
GET /api/reviews?sentiment=negative&product_id=P002
GET /api/reviews?search=uncomfortable&rating=1
GET /api/dashboard?category=Running&date_from=2026-06-01&date_to=2026-08-01
```

---

## AI Approach

This project intentionally avoids requiring a paid external AI API so it runs out of the box. Instead, it implements a **deterministic, explainable, rule-based analysis pipeline** that mimics what an LLM-based pipeline would produce -- while making the code structure ready for a real LLM to be swapped in later.

### Pipeline

```
review text
     |
sentiment.py        -> lexicon-weighted polarity score, blended with star rating
     |
topic_analysis.py   -> keyword/phrase matching -> topic classification
     |
topic_analysis.py   -> severity detection (Low/Medium/High/Critical) for negative reviews
     |
review_analyzer.py  -> analyze_review() orchestrates the above into one result
     |
data_store.py       -> runs analyze_review() once per review at startup, caches results
     |
insight_engine.py   -> generate_insights() aggregates reviews+orders+products into insights
     |
recommendation_engine.py -> generate_recommendations() turns aggregated issues into actions
```

### How each stage works

- **Sentiment** (`services/sentiment.py`): A curated lexicon of positive/negative words and phrases (with simple negation handling) produces a text-derived polarity score. This is blended with the review's star rating (a strong real-world signal), and bounded so that, e.g., a 1-star review can never be classified as genuinely "Positive" even if it contains an isolated positive word -- mirroring how production review-analysis systems combine structured and unstructured signals.
- **Topic classification** (`services/topic_analysis.py`): Each topic (Size & Fit, Comfort, Quality, Durability, Delivery, Return Experience, Design, Price & Value, Material, Packaging) has a curated keyword/phrase set. The topic with the most keyword matches wins, with a fixed priority order for tie-breaks.
- **Severity** (`services/topic_analysis.py`): Negative reviews are scored against critical/high/medium keyword tiers, combined with sentiment score and rating, to assign Low/Medium/High/Critical severity.
- **Insights** (`services/insight_engine.py`): Computes things like "which topic drives the most negative feedback, and in which category," "which high-rated product has a surprisingly high return rate, and why," and "is delivery sentiment trending worse in the last 30 days vs. the prior 30 days" -- entirely from live aggregation of the dataset, not hardcoded strings.
- **Recommendations** (`services/recommendation_engine.py`): Turns the same aggregated signals into concrete, prioritized actions split into Product / Marketing / Operations categories, each with a reason and a supporting metric pulled from the data.

### Designed for a future real-LLM swap

The public function signatures are intentionally minimal and stable:

```python
analyze_review(review_text, rating) -> dict        # sentiment, topic, severity
generate_insights(reviews_df, orders_df, products_df) -> list[dict]
generate_recommendations(reviews_df, orders_df, products_df) -> list[dict]
```

To integrate a real LLM later, you would replace the internals of these three functions (e.g., call OpenAI/Anthropic with the review text and a structured-output prompt) without needing to touch any route, model, or frontend code -- every consumer of these functions only depends on the shape of the returned dict/list, not on how it's computed.

---

## Frontend/Backend Independence

The frontend and backend are two completely separate applications:

- **Backend**: a standalone FastAPI service exposing JSON REST APIs on port `8000`. It can be started, tested, and used independently (e.g. via `/docs` or `curl`) with no frontend running at all.
- **Frontend**: a standalone Vite/React SPA on port `5173` that only talks to the backend over HTTP (via `VITE_API_BASE_URL`). It has no server-side code and no direct access to the CSV data -- every number rendered comes from an API call.

They communicate exclusively over REST/JSON and can be deployed to entirely separate hosts.

---

## Future Improvements

- Real LLM integration (OpenAI/Anthropic) for sentiment, topic, and insight generation, replacing/augmenting the deterministic engine
- Real-time review ingestion (webhooks from review platforms / marketplaces)
- Real database integration (PostgreSQL) instead of in-memory CSV loading
- Authentication & role-based access (Product / CX / Marketing / Ops views)
- Advanced NLP (aspect-based sentiment, embeddings-based topic clustering, multi-language support)
- Automated alerts when an issue crosses a severity/volume threshold
- Slack/email digest reporting of weekly AI insights
- Predictive return-risk scoring at the order level

---

## Final Checklist

- [x] Separate `frontend/` and `backend/` folders, full-stack, not a static mockup
- [x] React + Vite + Tailwind + Recharts + Lucide + Axios frontend
- [x] FastAPI + Pydantic + Pandas + Uvicorn backend
- [x] Realistic dummy data: 12 products, 1,400 orders, 900 reviews
- [x] Deterministic sentiment scoring (-1 to +1), topic classification, and severity detection -- no random values
- [x] AI Insight Engine generating data-derived insights (not hardcoded)
- [x] AI Recommendation Engine generating Product/Marketing/Operations recommendations
- [x] Feedback Overview dashboard with 6 backend-driven KPI cards
- [x] Sentiment Distribution, Sentiment Trend, Issues by Topic, Rating Distribution, Product Performance charts
- [x] AI Detected Issues section with mentions, severity, trend, affected products
- [x] Product Intelligence list + detail page with full breakdown
- [x] Review Explorer with search + 7 filter dimensions
- [x] AI Insights page with typed insight cards
- [x] AI Recommendations page with category filtering
- [x] Global filters that call the backend (not client-side-only filtering)
- [x] Loading skeletons, inline loaders, empty states, and friendly error states
- [x] All 11+ REST endpoints implemented with query-parameter filtering
- [x] Modular backend (`routes/`, `services/`, `models/`, `data/`) -- nothing crammed into `main.py`
- [x] Modular frontend (`components/`, `pages/`, `context/`, `services/`, `utils/`)
- [x] Comprehensive README with setup, API docs, and AI approach
- [x] Frontend and backend verified to run and communicate independently
