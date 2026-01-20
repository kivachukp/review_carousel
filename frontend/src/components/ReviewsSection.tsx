// ReviewsSection.tsx
import { useEffect, useState } from "react";
import "./ReviewsSection.css";
import { ReviewsHeader } from "./ReviewsHeader";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { Review, fetchReviews } from "../api";

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await fetchReviews();
        setReviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading) {
    return (
      <section className="reviews-section">
        <ReviewsHeader />
        <div className="loading">Loading reviews...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="reviews-section">
        <ReviewsHeader />
        <div className="error">Error: {error}</div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="reviews-section">
        <ReviewsHeader />
        <div className="no-reviews">No reviews available</div>
      </section>
    );
  }

  return (
    <section className="reviews-section">
      <ReviewsHeader />
      <ReviewsCarousel reviews={reviews} />
    </section>
  );
};