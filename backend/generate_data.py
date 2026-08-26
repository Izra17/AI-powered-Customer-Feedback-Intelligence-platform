"""
Data generation script for Neeman's Feedback Intelligence demo.
Generates realistic dummy products.csv, orders.csv, and reviews.csv
into backend/app/data/

Run: python generate_data.py
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(42)

OUT_DIR = "app/data"

# ---------------------------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------------------------
PRODUCTS = [
    {"product_id": "P001", "product_name": "Everyday Sneakers", "category": "Sneakers", "price": 2499, "color": "Charcoal Grey"},
    {"product_id": "P002", "product_name": "Runner Pro", "category": "Running", "price": 3199, "color": "Jet Black"},
    {"product_id": "P003", "product_name": "Daily Walk", "category": "Casual", "price": 1999, "color": "Stone Beige"},
    {"product_id": "P004", "product_name": "City Slip-On", "category": "Casual", "price": 2299, "color": "Navy Blue"},
    {"product_id": "P005", "product_name": "Wool Runner", "category": "Running", "price": 3499, "color": "Heather Grey"},
    {"product_id": "P006", "product_name": "Active Knit", "category": "Sneakers", "price": 2799, "color": "Forest Green"},
    {"product_id": "P007", "product_name": "Comfort Sandal", "category": "Sandals", "price": 1499, "color": "Tan Brown"},
    {"product_id": "P008", "product_name": "Trail Blazer", "category": "Outdoor", "price": 3699, "color": "Olive Green"},
    {"product_id": "P009", "product_name": "Classic Loafer", "category": "Formal", "price": 2899, "color": "Espresso Brown"},
    {"product_id": "P010", "product_name": "Flex Trainer", "category": "Sneakers", "price": 2599, "color": "White"},
    {"product_id": "P011", "product_name": "Cloud Step", "category": "Casual", "price": 2199, "color": "Sky Blue"},
    {"product_id": "P012", "product_name": "Urban Hi-Top", "category": "Sneakers", "price": 2999, "color": "Black/White"},
]

# Deliberately bias some products toward specific issue patterns so the
# analysis engine surfaces meaningful, believable insights.
# 'issue_bias' skews which negative themes appear more for that product.
PRODUCT_BIAS = {
    "P001": {"quality": 0.10},
    "P002": {"size": 0.30, "delivery": 0.05},   # Runner Pro: great product, high size-related returns
    "P003": {"comfort": 0.05},
    "P004": {"delivery": 0.20},
    "P005": {"durability": 0.15},
    "P006": {"quality": 0.15},
    "P007": {"comfort": 0.10, "durability": 0.10},
    "P008": {"durability": 0.20},
    "P009": {"size": 0.15},
    "P010": {},
    "P011": {"delivery": 0.10},
    "P012": {"quality": 0.10},
}

# ---------------------------------------------------------------------------
# REVIEW TEXT BANKS
# ---------------------------------------------------------------------------

POSITIVE_TEMPLATES = [
    "These {product} are incredibly comfortable, I can wear them all day without any pain.",
    "Super lightweight and stylish. Get compliments every time I wear my {product}.",
    "Great quality for the price. My {product} still look brand new after months of use.",
    "Very easy to wear, true to size, and the {color} colour looks amazing in person.",
    "Perfect for daily walks. The cushioning on the {product} is fantastic.",
    "I was skeptical but the {product} exceeded my expectations. Extremely comfortable fit.",
    "Good value for money. The {product} feel premium and well made.",
    "Loved the design and the fit was spot on. Would definitely recommend the {product}.",
    "Breathable material and lightweight - ideal for long office days.",
    "My third pair from Neeman's, and the {product} might be my favourite so far.",
    "Stylish look, comfortable sole, and delivery was quick too. Very happy overall.",
    "The {product} are so soft and comfortable, feels like walking on clouds.",
    "Excellent build quality, the stitching and finish look premium.",
    "Fits true to size and the arch support is great for standing all day.",
    "Bought as a gift, and the packaging plus quality really impressed my friend.",
]

NEUTRAL_TEMPLATES = [
    "The {product} are okay, nothing special but does the job.",
    "Decent shoes for the price, though I expected slightly better cushioning.",
    "Average experience. Comfortable but the {color} colour looked a bit different than the photos.",
    "It's a fine pair of {product}, does what it says, no major complaints.",
    "Comfort is fine but I'm still deciding if I like the overall look.",
    "Good for casual use, not something I'd wear for long walks though.",
    "Reasonable quality, delivery took a bit longer than expected but shoes are fine.",
    "Fit is okay, needed a few days to break in before it felt normal.",
]

NEGATIVE_TEMPLATES = {
    "size": [
        "The {product} run really small, had to return and get a bigger size.",
        "Size guide is misleading, ordered my usual size but the {product} were too tight.",
        "Sizing is inconsistent - my other Neeman's shoes fit fine but these {product} don't.",
        "Had to size up two sizes to get a comfortable fit on the {product}.",
        "The {product} fit narrow, my toes felt cramped within an hour of wearing them.",
    ],
    "comfort": [
        "The {product} feel stiff and uncomfortable, especially around the heel area.",
        "Expected more cushioning, my feet hurt after just an hour of wearing the {product}.",
        "Not comfortable at all for daily wear, the sole feels too hard.",
        "The insole is too thin, no arch support, my feet ache by evening.",
        "Uncomfortable fit around the ankle, kept rubbing and causing blisters.",
    ],
    "quality": [
        "The material quality of the {product} feels cheap compared to the price.",
        "Stitching came undone within two weeks of regular use.",
        "The {color} colour started fading after just a few washes.",
        "Build quality is disappointing, doesn't feel like a premium product.",
        "The fabric on the {product} pilled and looked worn out very quickly.",
    ],
    "durability": [
        "Sole started wearing out after only a month of regular use.",
        "The {product} developed cracks in the sole much sooner than expected.",
        "Poor durability, the stitching on the sides is already coming apart.",
        "Bought these two months ago and the sole has already worn thin.",
        "Not built to last, the outer material tore within weeks.",
    ],
    "delivery": [
        "Delivery was delayed by over a week, no proper updates on tracking.",
        "The {product} arrived quite late, would have appreciated better communication.",
        "Order took much longer than the estimated delivery window.",
        "Delivery partner mishandled the package, box arrived damaged.",
        "Late delivery ruined the surprise, had ordered these for an event.",
    ],
    "return": [
        "Return process was frustrating, took over two weeks to get my refund.",
        "Had a difficult time initiating the return for my {product}, support was slow to respond.",
        "Return pickup got rescheduled three times, very inconvenient experience.",
        "Refund took much longer than promised after returning the {product}.",
        "Customer support was unresponsive when I tried to exchange my order.",
    ],
    "design": [
        "The {color} colour looked very different from the pictures on the site.",
        "Design looks nice in photos but feels a bit plain in person.",
        "Wish there were more colour options available for the {product}.",
        "The design shows the logo too prominently, not a fan of the branding placement.",
    ],
    "price": [
        "Overpriced for the quality you actually get with the {product}.",
        "Expected more for this price point, similar shoes elsewhere are better value.",
        "Value for money isn't great, quality doesn't quite match the price tag.",
    ],
    "packaging": [
        "The {product} arrived in a damaged box, packaging could be much better.",
        "No proper protective packaging inside the box, shoes had a scuff on arrival.",
        "Packaging felt very basic for the price point of these shoes.",
    ],
    "wrong_product": [
        "Received the wrong colour, ordered {color} but got a completely different shade.",
        "Wrong size was shipped, had to go through the hassle of exchanging it.",
    ],
}

POS_MIX = [t for t in POSITIVE_TEMPLATES]

CUSTOMER_FIRST = ["Aarav","Vivaan","Aditya","Ishaan","Kabir","Arjun","Sai","Rohan","Ananya","Diya",
                  "Priya","Isha","Meera","Kavya","Neha","Riya","Simran","Tanvi","Zara","Aisha",
                  "Rahul","Karan","Nikhil","Varun","Sanjay","Pooja","Anjali","Divya","Shreya","Ritu"]
CUSTOMER_LAST = ["Sharma","Verma","Gupta","Patel","Reddy","Nair","Iyer","Singh","Kumar","Rao",
                  "Mehta","Joshi","Kapoor","Malhotra","Chatterjee","Bose","Menon","Pillai","Desai","Agarwal"]


def rand_date(start, end):
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days), seconds=random.randint(0, 86399))


def generate_products():
    rows = []
    for p in PRODUCTS:
        rows.append(p)
    return rows


def weighted_choice(options_weights):
    options, weights = zip(*options_weights)
    return random.choices(options, weights=weights, k=1)[0]


def generate_orders(products, num_orders=1400):
    rows = []
    today = datetime(2026, 8, 26)
    start_date = today - timedelta(days=365)
    order_id_counter = 1
    customers = [f"C{1000+i}" for i in range(500)]

    for _ in range(num_orders):
        product = random.choice(products)
        pid = product["product_id"]
        order_date = rand_date(start_date, today - timedelta(days=1))
        delivery_days = max(1, int(random.gauss(4.5, 2.2)))
        bias = PRODUCT_BIAS.get(pid, {})
        # Delivery delay bias
        if "delivery" in bias:
            if random.random() < bias["delivery"] * 1.5:
                delivery_days += random.randint(4, 10)
        delivery_date = order_date + timedelta(days=delivery_days)

        status = weighted_choice([
            ("Delivered", 0.80),
            ("Returned", 0.13),
            ("Cancelled", 0.05),
            ("In Transit", 0.02),
        ])

        return_reason = ""
        if status == "Returned":
            reason_weights = [
                ("Size issue", 0.30 + bias.get("size", 0) * 2),
                ("Comfort issue", 0.15 + bias.get("comfort", 0) * 2),
                ("Quality issue", 0.15 + bias.get("quality", 0) * 2),
                ("Changed mind", 0.15),
                ("Wrong product", 0.10),
                ("Late delivery", 0.10 + bias.get("delivery", 0) * 2),
            ]
            return_reason = weighted_choice(reason_weights)

        quantity = weighted_choice([(1, 0.78), (2, 0.17), (3, 0.05)])
        order_value = product["price"] * quantity

        rows.append({
            "order_id": f"ORD{order_id_counter:05d}",
            "customer_id": random.choice(customers),
            "product_id": pid,
            "order_date": order_date.strftime("%Y-%m-%d"),
            "delivery_date": delivery_date.strftime("%Y-%m-%d") if status != "Cancelled" else "",
            "order_status": status,
            "quantity": quantity,
            "order_value": order_value,
            "delivery_days": delivery_days if status != "Cancelled" else "",
            "return_status": "Returned" if status == "Returned" else "Not Returned",
            "return_reason": return_reason,
        })
        order_id_counter += 1
    return rows


def fill_template(template, product_name, color):
    return template.format(product=product_name, color=color)


def generate_reviews(products, orders, num_reviews=850):
    rows = []
    review_id_counter = 1
    product_map = {p["product_id"]: p for p in products}

    # Only generate reviews tied to Delivered / Returned orders (realistic - can't review cancelled)
    eligible_orders = [o for o in orders if o["order_status"] in ("Delivered", "Returned")]
    random.shuffle(eligible_orders)
    sample_orders = eligible_orders[:num_reviews] if len(eligible_orders) >= num_reviews else eligible_orders

    today = datetime(2026, 8, 26)

    for order in sample_orders:
        pid = order["product_id"]
        product = product_map[pid]
        bias = PRODUCT_BIAS.get(pid, {})

        # Determine base sentiment distribution, skewed by whether order was returned
        if order["order_status"] == "Returned":
            sentiment_type = weighted_choice([("negative", 0.65), ("neutral", 0.20), ("positive", 0.15)])
        else:
            sentiment_type = weighted_choice([("positive", 0.62), ("neutral", 0.20), ("negative", 0.18)])

        review_date = datetime.strptime(order["delivery_date"], "%Y-%m-%d") + timedelta(days=random.randint(1, 25))
        if review_date > today:
            review_date = today - timedelta(days=random.randint(0, 5))

        # Recent months get slightly elevated size & delivery negativity (for trend insights)
        days_ago = (today - review_date).days
        recent_boost = days_ago < 30

        if sentiment_type == "positive":
            template = random.choice(POS_MIX)
            text = fill_template(template, product["product_name"], product["color"])
            rating = weighted_choice([(5, 0.65), (4, 0.35)])
        elif sentiment_type == "neutral":
            template = random.choice(NEUTRAL_TEMPLATES)
            text = fill_template(template, product["product_name"], product["color"])
            rating = 3
        else:
            # choose negative theme, weighted by product bias + recent boost
            theme_weights = [
                ("size", 0.22 + bias.get("size", 0) * 2 + (0.08 if recent_boost else 0)),
                ("comfort", 0.16 + bias.get("comfort", 0) * 2),
                ("quality", 0.16 + bias.get("quality", 0) * 2),
                ("durability", 0.13 + bias.get("durability", 0) * 2),
                ("delivery", 0.13 + bias.get("delivery", 0) * 2 + (0.10 if recent_boost else 0)),
                ("return", 0.08),
                ("design", 0.05),
                ("price", 0.04),
                ("packaging", 0.02),
                ("wrong_product", 0.01),
            ]
            theme = weighted_choice(theme_weights)
            template = random.choice(NEGATIVE_TEMPLATES[theme])
            text = fill_template(template, product["product_name"], product["color"])
            rating = weighted_choice([(1, 0.45), (2, 0.55)])

        # Occasionally combine two sentences for realism
        if random.random() < 0.25:
            extra_pool = POS_MIX if sentiment_type == "positive" else (
                NEUTRAL_TEMPLATES if sentiment_type == "neutral" else
                random.choice(list(NEGATIVE_TEMPLATES.values())))
            extra_template = random.choice(extra_pool)
            extra_text = fill_template(extra_template, product["product_name"], product["color"])
            if extra_text != text:
                text = text + " " + extra_text

        rows.append({
            "review_id": f"REV{review_id_counter:05d}",
            "order_id": order["order_id"],
            "customer_id": order["customer_id"],
            "product_id": pid,
            "rating": rating,
            "review_text": text,
            "review_date": review_date.strftime("%Y-%m-%d"),
            "verified_purchase": True if random.random() < 0.92 else False,
        })
        review_id_counter += 1

    return rows


def write_csv(rows, filename, fieldnames):
    path = f"{OUT_DIR}/{filename}"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {path}")


if __name__ == "__main__":
    products = generate_products()
    orders = generate_orders(products, num_orders=1400)
    reviews = generate_reviews(products, orders, num_reviews=900)

    write_csv(products, "products.csv",
              ["product_id", "product_name", "category", "price", "color"])
    write_csv(orders, "orders.csv",
              ["order_id", "customer_id", "product_id", "order_date", "delivery_date",
               "order_status", "quantity", "order_value", "delivery_days",
               "return_status", "return_reason"])
    write_csv(reviews, "reviews.csv",
              ["review_id", "order_id", "customer_id", "product_id", "rating",
               "review_text", "review_date", "verified_purchase"])

    print("Data generation complete.")
