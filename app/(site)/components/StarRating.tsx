type StarRatingProps = {
    rating: number;      // Ví dụ: 4.5
    className?: string;  // Tùy chọn: thêm class nếu cần
  };
  
  const StarRating = ({ rating, className = '' }: StarRatingProps) => {
    return (
      <span className={`text-red-500 flex gap-0.5 ${className}`}>
        {[...Array(5)].map((_, i) => {
          if (rating >= i + 1) {
            return <i key={i} className="fa-solid fa-star"></i>; // sao đầy
          } else {
            return <i key={i} className="fa-regular fa-star"></i>; // sao rỗng
          }
        })}
      </span>
    );
  };
  
  export default StarRating;
  