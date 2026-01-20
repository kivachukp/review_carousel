import "./ReviewsHeader.css";
import featuredL from "../../assets/featured-l.png";
import featuredR from "../../assets/featured-r.png";
import ratingBars from "../../assets/rating.png";

export const ReviewsHeader = () => {
  return (
    <div className="reviews-header">
      <h2 className="reviews-title">Ratings & Reviews</h2>

      <div className="reviews-info">
        <div className="reviews-info__left">
          More than 53k positive reviews and ratings in the App Store
        </div>

        <div className="reviews-info__center">
          <div className="featured-app">
            <img src={featuredL} alt="laurel left" className="featured-laurel" />
            <div className="featured-app-content">
              <strong>Featured App</strong>
              <span>in 100+ countries</span>
            </div>
            <img src={featuredR} alt="laurel right" className="featured-laurel" />
          </div>
        </div>

        <div className="reviews-info__right">
          <div className="rating-container">
            <img src={ratingBars} alt="ratings chart" className="rating-bars" />
            <div className="rating-score">
              <strong>4.9</strong>
              <span>out of 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};