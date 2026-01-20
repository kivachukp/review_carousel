import "./ReviewCard.css";
import { Review } from "../api";

interface Props {
  review: Review;
}

export const ReviewCard = ({ review }: Props) => {
  const { title, text, rating } = review;

  return (
    <div className="review-card">
      <h3>{title}</h3>
      <div className="stars">{"★".repeat(rating)}</div>
      <p>{text}</p>
    </div>
  );
};
