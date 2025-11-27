import React, { useState, useRef, useEffect } from 'react';
import { StarRating, PartialDataIndicator, LoadingSpinner } from '../common';
import { addRating } from '../../services/firestore';
import { Song } from '../../types/song';
import DetailedSongModal from './DetailedSongModal';
import PerformanceService from '../../services/performance';
import AnalyticsService from '../../services/analytics';

interface EnhancedSongCardProps {
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
  lazyLoad?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export const EnhancedSongCard: React.FC<EnhancedSongCardProps> = ({
  song,
  title,
  rank,
  searchCount,
  averageRating,
  totalRatings,
  songId,
  onClick,
  onRatingUpdate,
  className = "",
  lazyLoad = true,
  priority = 'normal'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const performanceService = PerformanceService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isInView) return;

    const observer = performanceService.createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: priority === 'high' ? '200px' : priority === 'normal' ? '100px' : '50px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, isInView, priority, performanceService]);

  const handleCardClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Track analytics
      if (song?.id && song.title) {
        await analyticsService.trackSongView(song.id, song.title);
      }

      // Performance measurement
      const { duration } = await performanceService.measurePerformance(
        async () => {
          setShowModal(true);
        },
        `SongCard-${title}-click`
      );

      // Track performance
      await analyticsService.trackPerformance(duration, false, true);
    } catch (err) {
      setError('Failed to open song details');
      console.error('Song card click error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!songId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { duration } = await performanceService.measurePerformance(
        async () => {
          await addRating({ songId, rating });
          if (onRatingUpdate) {
            onRatingUpdate();
          }
        },
        `SongCard-${title}-rating`
      );

      await analyticsService.trackPerformance(duration, false, true);
    } catch (err) {
      setError('Failed to submit rating');
      console.error('Rating error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loader for lazy loading
  if (!isInView) {
    return (
      <div 
        ref={cardRef}
        className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          {rank && (
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          )}
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const completedPhases = song?.researchPhases || [];
  const totalPhases = 5; // phase0 through phase4
  const hasPartialData = completedPhases.length > 0 && completedPhases.length < totalPhases;

  return (
    <>
      <div 
        ref={cardRef}
        className={`
          bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 
          transition-all duration-200 cursor-pointer transform hover:scale-[1.02] p-6 
          ${isLoading ? 'opacity-75 pointer-events-none' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <LoadingSpinner size="sm" message="" className="p-0" />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Partial data indicator */}
        {hasPartialData && (
          <PartialDataIndicator
            phases={completedPhases}
            totalPhases={totalPhases}
            className="mb-4"
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
              {title}
            </h3>
            
            {/* Enhanced metadata */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
              {song?.composer && (
                <span>By {song.composer}</span>
              )}
              {song?.yearComposed && (
                <span>• {song.yearComposed}</span>
              )}
              {song?.period && (
                <span>• {song.period}</span>
              )}
            </div>

            {/* Tags */}
            {song?.tags && song.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {song.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {song.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{song.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rank badge */}
          {rank && (
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              #{rank}
            </div>
          )}
        </div>

        {/* Research status */}
        {song?.researchCompleted && (
          <div className="mb-3 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Comprehensive research completed
          </div>
        )}

        {/* Cultural context preview */}
        {song?.culturalSignificance && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {song.culturalSignificance}
          </p>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {searchCount !== undefined && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchCount.toLocaleString()}
              </span>
            )}
            
            {searchCount && searchCount > 0 && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {searchCount.toLocaleString()} views
              </span>
            )}

            {song?.notableRecordings?.recordings.length && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                {song.notableRecordings.recordings.length} recordings
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <StarRating
              rating={averageRating || 0}
              onRate={handleRating}
              readonly={isLoading}
              size="sm"
            />
            {totalRatings !== undefined && totalRatings > 0 && (
              <span className="text-xs text-gray-500">
                ({totalRatings})
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <button 
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            aria-label="View full song details"
          >
            More
          </button>
          
          {song?.currentAvailability?.streamingPlatforms.length && (
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Available to stream
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && song && (
        <DetailedSongModal
          song={song}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};