import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;           // 0-5 (can be decimal for averages)
  onRate?: (rating: number) => void;  // Makes stars clickable when provided
  readonly?: boolean;       // true = display only, false = interactive
  size?: 'sm' | 'md';      // Size variants
  totalRatings?: number;   // For "(X ratings)" display
  showAverage?: boolean;   // Show numeric average like "4.2 (23 ratings)"
  isLoading?: boolean;     // Show loading state during submission
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  readonly = false,
  size = 'sm',
  totalRatings,
  showAverage = false,
  isLoading = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = !!onRate && !readonly && !isLoading;
  
  const displayRating = hoverRating || rating;
  const sizeClass = size === 'md' ? 'text-lg' : 'text-sm';

  // Helper function to determine star display (full, half, or empty)
  const getStarDisplay = (starPosition: number): string => {
    const diff = displayRating - starPosition;
    if (diff >= 0) {
      return '★'; // Full star
    } else if (diff > -1 && diff < 0) {
      // Half star: show when rating is between star positions (e.g., 4.3 shows half star at position 5)
      return '⯨'; // Half star character
    }
    return '☆'; // Empty star
  };

  // Helper function to get star color class
  const getStarColorClass = (starPosition: number): string => {
    const diff = displayRating - starPosition;
    if (diff >= 0) {
      return 'text-yellow-400'; // Full star
    } else if (diff > -1 && diff < 0) {
      return 'text-yellow-400'; // Half star (same color as full)
    }
    return 'text-gray-300'; // Empty star
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Star display */}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!isInteractive}
            type="button"
            className={`
              ${sizeClass} transition-colors duration-150
              ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${getStarColorClass(star)}
              ${isInteractive ? 'hover:text-yellow-300' : ''}
              ${isInteractive ? 'min-w-[32px] min-h-[32px] flex items-center justify-center' : ''}
              ${isLoading ? 'opacity-50' : ''}
            `}
            onClick={() => isInteractive && onRate(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            {getStarDisplay(star)}
          </button>
        ))}
      </div>
      
      {/* Numeric average display */}
      {showAverage && rating > 0 && (
        <span className="text-white/80 text-sm font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      
      {/* Rating count display */}
      {totalRatings !== undefined && totalRatings > 0 && (
        <span className="text-white/60 text-xs ml-1">
          ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
        </span>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <span className="text-white/60 text-xs ml-1">
          ⏳
        </span>
      )}
    </div>
  );
};

export default StarRating;
