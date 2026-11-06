import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onChange = null
}) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center space-x-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(activeRating);

        return (
          <button
            key={starValue}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-colors duration-150 ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
