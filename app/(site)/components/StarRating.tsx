type StarRatingProps = {
    rating: number;     
    className?: string; 
  };
  


  const StarRating = ({ rating, className = '' }: StarRatingProps) => {
    return (
      <span className={`text-red-500 flex gap-0.5 text-sm sm:text-base ${className}`}>
        {[...Array(5)].map((_, i) => {
          if (rating >= i + 1) {
            return <i key={i} className="fa-solid fa-star text-xs sm:text-sm"></i>;
          } else {
            return <i key={i} className="fa-regular fa-star text-xs sm:text-sm"></i>; 
          }
        })}
      </span>
    );
  };
  
  export default StarRating;
  