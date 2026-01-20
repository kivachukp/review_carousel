from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import json
from pathlib import Path

# ---------- APP ----------
app = FastAPI(
    title="Reviews API",
    version="1.0.0"
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для тестового можно *
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELS ----------
class Review(BaseModel):
    id: int
    title: str = Field(..., max_length=50)
    text: str = Field(..., max_length=300)
    rating: int = Field(..., ge=1, le=5)


class ReviewsResponse(BaseModel):
    items: List[Review]
    total: int


# ---------- LOAD DATA ----------
BASE_DIR = Path(__file__).resolve().parent
REVIEWS_FILE = BASE_DIR / "reviews.json"


def load_reviews() -> List[Review]:
    with open(REVIEWS_FILE, encoding="utf-8") as f:
        data = json.load(f)

    if "reviews" not in data or not isinstance(data["reviews"], list):
        raise ValueError("reviews.json must contain { 'reviews': [] }")

    return [Review(**item) for item in data["reviews"]]



reviews_db = load_reviews()

# ---------- ROUTES ----------
@app.get("/api/reviews", response_model=ReviewsResponse)
def get_reviews():
    return {
        "items": reviews_db,
        "total": len(reviews_db)
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
