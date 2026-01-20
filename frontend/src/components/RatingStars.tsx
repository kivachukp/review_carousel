export const RatingStars = ({ value }: { value: number }) => {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? "filled" : ""}>
          ★
        </span>
      ))}
    </div>
  );
};
