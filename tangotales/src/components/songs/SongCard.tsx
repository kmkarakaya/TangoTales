import React from 'react';

interface SongCardProps {
  title: string;
  rank?: number;
  searchCount?: number;
  averageRating?: number;
  onClick?: () => void;
  className?: string;
}

export const SongCard: React.FC<SongCardProps> = ({
  title,
  rank,
  searchCount,
  averageRating,
  onClick,
  className = ""
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">⭐</span>);
    }

    while (stars.length < 5) {
      stars.push(<span key={stars.length} className="text-white/20">⭐</span>);
    }

    return stars;
  };

  return (
    <div 
      onClick={onClick}
      className={`
        glass-card p-4 cursor-pointer transition-all duration-300 hover-lift hover-glow
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {rank && (
              <span className="text-sm font-bold text-yellow-400">
                #{rank}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white text-shadow-medium truncate">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            {averageRating && (
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {renderStars(averageRating)}
                </div>
                <span className="text-white/60">({averageRating.toFixed(1)})</span>
              </div>
            )}
            
            {searchCount && (
              <div className="text-white/60">
                🔍 {searchCount} searches
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-3 text-2xl">
          🎵
        </div>
      </div>
    </div>
  );
};

export default SongCard;