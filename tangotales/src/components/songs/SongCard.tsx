import React, { useState } from 'react';
import { StarRating } from '../common';
import { addRating } from '../../services/firestore';
import { Song } from '../../types/song';
import DetailedSongModal from './DetailedSongModal';

interface SongCardProps {
  song?: Song;
  title: string;
  rank?: number;
  searchCount?: number;
  averageRating?: number;
  totalRatings?: number;
  songId?: string;
  onClick?: () => void;
  onRatingUpdate?: () => void;
  className?: string;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  title,
  rank,
  searchCount,
  averageRating,
  totalRatings,
  songId,
  onClick,
  onRatingUpdate,
  className = ""
}) => {
  const [submittingRating, setSubmittingRating] = useState(false);
  const [localRating, setLocalRating] = useState(averageRating || 0);
  const [localTotalRatings, setLocalTotalRatings] = useState(totalRatings || 0);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const handleRating = async (rating: number) => {
    if (submittingRating || !songId) return; // Prevent double-submission
    
    setSubmittingRating(true);
    setRatingError(null);
    
    try {
      await addRating({
        songId: songId,
        rating,
      });
      
      // Optimistic update (immediate UI feedback)
      const newTotal = localTotalRatings + 1;
      const newAverage = ((localRating * localTotalRatings) + rating) / newTotal;
      
      // Update local state
      setLocalRating(newAverage);
      setLocalTotalRatings(newTotal);
      
      // Trigger parent refresh for consistency
      onRatingUpdate?.();
      
    } catch (error) {
      console.error('Rating submission failed:', error);
      setRatingError('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCardClick = () => {
    if (song && song.id) {
      setShowDetailedModal(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className={`
          bg-white/10 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:-translate-y-1 border border-white/20
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
            <h3 className="text-lg font-semibold text-white truncate">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            {(localRating > 0 || songId) && (
              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                <StarRating 
                  rating={localRating}
                  onRate={songId ? handleRating : undefined}
                  readonly={!songId || submittingRating}
                  size="sm"
                  totalRatings={localTotalRatings}
                  showAverage={true}
                  isLoading={submittingRating}
                />
              </div>
            )}
            
            {ratingError && (
              <div className="text-red-400 text-xs">
                {ratingError}
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
    
    {song && (
      <DetailedSongModal 
        song={song}
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
      />
    )}
  </>
  );
};

export default SongCard;