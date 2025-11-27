import React, { useState, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Song } from '../../types/song';
import { LoadingSpinner, ErrorMessage, StarRating } from '../common';
import { EnhancedSongDetail } from '../songs/EnhancedSongDetail';
import DetailedSongModal from '../songs/DetailedSongModal';
import { addRating } from '../../services/firestore';
import type { ProgressUpdate } from '../../services/enhancedGeminiWithProgress';

interface EnhanceWithAIButtonProps {
  songs: Song[];
  onEnhancementComplete: () => void;
  size?: 'small' | 'large';
}

const EnhanceWithAIButton: React.FC<EnhanceWithAIButtonProps> = ({ 
  songs, 
  onEnhancementComplete,
  size = 'large' 
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<ProgressUpdate | null>(null);
  
  const handleEnhanceWithAI = async () => {
    if (songs.length === 0) return;
    
    setIsEnhancing(true);
    setEnhancementError(null);
    setCurrentProgress(null);

    try {
      // Import enhanced services dynamically
      const { songInformationService } = await import('../../services/enhancedGeminiWithProgress');
      const { updateSongWithEnhancedData } = await import('../../services/firestore');
      
      // Process each song
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        
        try {
          console.log(`🤖 Enhancing song: "${song.title}" (${i + 1}/${songs.length})`);
          
          // Research the song with enhanced AI and progress tracking
          const enhancedResult = await songInformationService.getEnhancedSongInformation(
            { title: song.title, songId: song.id }, 
            (progress: ProgressUpdate) => {
              setCurrentProgress(progress);
            }
          );
          
          // Update the song in the database
          await updateSongWithEnhancedData(song.id, enhancedResult, {
            aiResponseQuality: 'good',
            needsManualReview: false,
            lastAIUpdate: new Date(),
            retryCount: 0
          });
          
          console.log(`✅ Enhanced song: "${song.title}"`);
        } catch (songError) {
          console.error(`Failed to enhance song "${song.title}":`, songError);
          // Continue with next song even if one fails
        }
      }
      
      // Clear progress and refresh the page to show enhanced results
      setCurrentProgress(null);
      onEnhancementComplete();
      
    } catch (error) {
      console.error('Failed to enhance songs:', error);
      setEnhancementError(error instanceof Error ? error.message : 'Failed to enhance songs');
    } finally {
      setIsEnhancing(false);
    }
  };

  const buttonClasses = size === 'small' 
    ? "px-3 py-1 text-xs rounded"
    : "px-6 py-3 text-sm rounded-lg";
    
  const iconSize = size === 'small' ? '' : 'text-lg';

  return (
    <div className={size === 'small' ? 'inline-block' : 'space-y-3'}>
      {enhancementError && (
        <div className="text-red-600 text-sm">
          {enhancementError}
        </div>
      )}
      
      <button 
        onClick={handleEnhanceWithAI}
        disabled={isEnhancing}
        className={`${buttonClasses} font-semibold transition-all duration-200 ${
          isEnhancing
            ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg'
        }`}
      >
        {isEnhancing ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="inline mr-2 p-0" color="white" message="" />
              <span>{currentProgress ? 'AI Research in Progress...' : '🤖 Enhancing...'}</span>
            </div>
            {currentProgress && (
              <div className="w-full px-2">
                <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-white h-1.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((currentProgress.phase + (currentProgress.completed ? 1 : 0)) / currentProgress.totalPhases) * 100}%` 
                    }}
                    aria-label={`Progress: ${currentProgress.phase + 1} of ${currentProgress.totalPhases}`}
                    role="progressbar"
                    aria-valuenow={currentProgress.phase + 1}
                    aria-valuemin={0}
                    aria-valuemax={currentProgress.totalPhases}
                  />
                </div>
                <span className="text-xs text-white/90">
                  {currentProgress.message} ({currentProgress.phase + 1}/{currentProgress.totalPhases})
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <span className={iconSize}>🤖</span> Enhance with AI
          </>
        )}
      </button>
    </div>
  );
};

interface SearchResultsProps {
  className?: string;
  showPopularOnEmpty?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  className = "", 
  showPopularOnEmpty = true 
}) => {
  const { 
    query, 
    results, 
    loading, 
    error, 
    hasSearched, 
    showNoResults,
    loadPopularSongs,
    loadMorePopular,
    handleSearchSubmit,
    handleSearchChange
  } = useSearch();
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [enhancingSong, setEnhancingSong] = useState<string | null>(null);
  const [enhancedSongs, setEnhancedSongs] = useState<Map<string, Song>>(new Map());

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSong) {
        setSelectedSong(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedSong]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSong) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedSong]);

  // Handle clicking on a song card - fetch full data from database
  const handleSongClick = async (song: Song) => {
    try {
      // Import firestore service
      const { getSongById } = await import('../../services/firestore');
      
      console.log(`🔍 Fetching full song data for: "${song.title}" (ID: ${song.id})`);
      
      // Fetch complete song data from database
      const fullSongData = await getSongById(song.id);
      if (fullSongData) {
        console.log(`✅ Loaded complete song data:`, fullSongData);
        console.log(`🔍 DETAILED SONG DATA ANALYSIS:`);
        console.log(`- currentAvailability:`, (fullSongData as any).currentAvailability);
        console.log(`- recordingSources:`, (fullSongData as any).recordingSources);
        console.log(`- basicInfoSources:`, (fullSongData as any).basicInfoSources);
        console.log(`- culturalSources:`, (fullSongData as any).culturalSources);
        console.log(`- alternativeSpellings:`, (fullSongData as any).alternativeSpellings);
        console.log(`- allSearchFindings:`, (fullSongData as any).allSearchFindings);
        console.log(`- Has currentAvailability?`, !!(fullSongData as any).currentAvailability);
        console.log(`- Has recordingSources?`, !!(fullSongData as any).recordingSources);
        console.log(`- Has basicInfoSources?`, !!(fullSongData as any).basicInfoSources);
        console.log(`- Has culturalSources?`, !!(fullSongData as any).culturalSources);
        console.log(`- recordingSources length:`, (fullSongData as any).recordingSources?.length || 0);
        console.log(`- basicInfoSources length:`, (fullSongData as any).basicInfoSources?.length || 0);
        console.log(`- culturalSources length:`, (fullSongData as any).culturalSources?.length || 0);
        
        setSelectedSong(fullSongData);
      } else {
        console.log(`⚠️ Could not fetch full data, using search result data for: "${song.title}"`);
        setSelectedSong(song);
      }
    } catch (error) {
      console.error(`❌ Error fetching full song data for "${song.title}":`, error);
      // Fallback to search result data
      setSelectedSong(song);
    }
  };

  // Handle enhancement that keeps modal open and updates content
  const handleEnhanceSongInModal = async (song: Song) => {
    setEnhancingSong(song.id);
    
    try {
      // Import enhanced services dynamically
      const { songInformationService } = await import('../../services/enhancedGeminiWithProgress');
      const { updateSongWithEnhancedData, getSongById } = await import('../../services/firestore');
      
      console.log(`🤖 Enhancing song: "${song.title}"`);
      
      // Research the song with enhanced AI and progress tracking
      const enhancedResult = await songInformationService.getEnhancedSongInformation(
        { title: song.title, songId: song.id },
        (_progress: ProgressUpdate) => {
          // Progress callback - could be used for analytics or logging
        }
      );
      
      // Update the song in the database
      await updateSongWithEnhancedData(song.id, enhancedResult, {
        aiResponseQuality: 'good',
        needsManualReview: false,
        lastAIUpdate: new Date(),
        retryCount: 0
      });
      
      // Fetch the updated song from database
      const updatedSong = await getSongById(song.id);
      if (updatedSong) {
        // Update local cache
        setEnhancedSongs(prev => new Map(prev).set(song.id, updatedSong));
        
        // If this song is currently selected, update the modal
        if (selectedSong?.id === song.id) {
          setSelectedSong(updatedSong);
        }
      }
      
      console.log(`✅ Enhanced song: "${song.title}"`);
    } catch (error) {
      console.error(`Failed to enhance song "${song.title}":`, error);
    } finally {
      setEnhancingSong(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <LoadingSpinner size="lg" message="Searching tango songs..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`${className}`}>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Show no results state
  if (showNoResults) {
    return (
      <div className={`${className}`}>
        <NoResultsFound 
          query={query} 
          onRefreshSearch={handleSearchSubmit}
          onQueryChange={handleSearchChange}
        />
      </div>
    );
  }

  // Show results if we have them (search results or popular list)
  if (results.length > 0) {
    return (
      <div className={`${className}`}>
        {selectedSong ? (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking the backdrop (not the content)
              if (e.target === e.currentTarget) {
                setSelectedSong(null);
              }
            }}
          >
            <div className="w-full max-w-4xl my-8">
              <EnhancedSongDetail 
                song={enhancedSongs.get(selectedSong.id) || selectedSong} 
                onClose={() => setSelectedSong(null)}
                onEnhance={() => handleEnhanceSongInModal(selectedSong)}
                isEnhancing={enhancingSong === selectedSong.id}
                className=""
              />
            </div>
          </div>
        ) : (
          <SearchResultsList 
            results={results.map(song => enhancedSongs.get(song.id) || song)} 
            query={query} 
            onSongClick={handleSongClick}
            onEnhance={handleEnhanceSongInModal}
            enhancingSongId={enhancingSong}
            onLoadMore={loadMorePopular}
            currentCount={results.length}
          />
        )}
      </div>
    );
  }
  // Show popular songs when no search has been performed AND there are no results to show
  if (!hasSearched && showPopularOnEmpty && results.length === 0) {
    return (
      <div className={`${className}`}>
  <PopularSongsSection onLoadPopular={loadPopularSongs} onLoadMore={loadMorePopular} currentCount={results.length} />
      </div>
    );
  }

  return null;
};

interface SearchResultsListProps {
  results: Song[];
  query: string;
  onSongClick: (song: Song) => void;
  onEnhance?: (song: Song) => void;
  enhancingSongId?: string | null;
  onLoadMore?: (pageSize?: number) => Promise<void>;
  currentCount?: number;
}

// Helper function to detect low-quality songs that need AI enhancement
const isLowQualitySong = (song: Song): boolean => {
  return (
    song.composer === 'Unknown' &&
    (!song.culturalSignificance || 
     song.culturalSignificance.includes('This tango song is part of the rich Argentine musical tradition.') ||
     song.culturalSignificance.includes('This is a traditional tango song.')) &&
    (!song.themes || song.themes.length <= 2) &&
    (!song.notableRecordings || !song.notableRecordings.recordings || song.notableRecordings.recordings.length === 0) &&
    (!song.notablePerformers || song.notablePerformers.length === 0)
  );
};

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, query, onSongClick, onEnhance, enhancingSongId, onLoadMore, currentCount }) => {
  const lowQualitySongs = results.filter(isLowQualitySong);
  const hasLowQualitySongs = lowQualitySongs.length > 0;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {(() => {
          const hasQuery = !!query && query.trim() !== '';
          
          if (hasQuery) {
            // Search results
            const title = 'Search Results';
            const countText = `Found ${results.length} song${results.length !== 1 ? 's' : ''}`;
            const subtitle = `${countText} for "${query}"`;
            
            return (
              <>
                <h2 className="text-2xl font-bold text-red-700 mb-2">
                  {title}
                </h2>
                <p className="text-gray-600">{subtitle}</p>
              </>
            );
          } else {
            // Popular songs browsing
            const title = 'Popular Songs';
            const subtitle = results.length === 10 ? 'Top Ten' : `Top ${results.length}`;
            
            return (
              <>
                <h2 className="text-2xl font-bold text-red-700 mb-2">
                  {title}
                </h2>
                <p className="text-gray-600">{subtitle}</p>
              </>
            );
          }
        })()}
        
        {/* Show AI Enhancement Option for Low Quality Songs - only for actual searches */}
        {hasLowQualitySongs && query && query.trim() !== '' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 text-sm">
                💡 Some results have limited information. 
              </div>
            </div>
            <EnhanceWithAIButton 
              songs={lowQualitySongs} 
              onEnhancementComplete={() => window.location.reload()} 
            />
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((song) => (
          <SongCard 
            key={song.id} 
            song={song} 
            onClick={() => onSongClick(song)}
            showEnhanceButton={isLowQualitySong(song)}
            onEnhance={onEnhance}
            isEnhancing={enhancingSongId === song.id}
          />
        ))}
      </div>

      {/* Load More Button for Popular Songs (when no search query) */}
      {!query && onLoadMore && (
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <button 
            onClick={() => onLoadMore(10)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-all duration-150"
          >
            ➕ Load more popular songs
          </button>
        </div>
      )}
    </div>
  );
};

interface SongCardProps {
  song: Song;
  onClick?: () => void;
  showEnhanceButton?: boolean;
  onEnhance?: (song: Song) => void;
  isEnhancing?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick, showEnhanceButton = false, onEnhance, isEnhancing = false }) => {
  const [submittingRating, setSubmittingRating] = useState(false);
  const [localRating, setLocalRating] = useState(song.averageRating || 0);
  const [localTotalRatings, setLocalTotalRatings] = useState(song.totalRatings || 0);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const handleRating = async (rating: number) => {
    if (submittingRating) return; // Prevent double-submission
    
    setSubmittingRating(true);
    setRatingError(null);
    
    try {
      await addRating({
        songId: song.id,
        rating,
      });
      
      // Optimistic update (immediate UI feedback)
      const newTotal = localTotalRatings + 1;
      const newAverage = ((localRating * localTotalRatings) + rating) / newTotal;
      
      // Update local state
      setLocalRating(newAverage);
      setLocalTotalRatings(newTotal);
      
    } catch (error) {
      console.error('Rating submission failed:', error);
      setRatingError('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Truncate explanation
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Enhanced info display
  const formatPeriod = (period: string) => {
    const periodColors = {
      'Pre-Golden Age': 'bg-amber-100 text-amber-800',
      'Golden Age': 'bg-yellow-100 text-yellow-800',
      'Post-Golden Age': 'bg-orange-100 text-orange-800',
      'Contemporary': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${periodColors[period as keyof typeof periodColors] || 'bg-gray-100 text-gray-800'}`}>
        {period}
      </span>
    );
  };

  const formatMusicalForm = (form: string) => {
    const formColors = {
      'Tango': 'bg-red-100 text-red-800',
      'Vals': 'bg-blue-100 text-blue-800',
      'Milonga': 'bg-green-100 text-green-800',
      'Candombe': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${formColors[form as keyof typeof formColors] || 'bg-gray-100 text-gray-800'}`}>
        {form}
      </span>
    );
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetailedModal(true);
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border-l-4 border-red-500"
      >
      {/* Header with Title and Tags */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-red-700 mb-2">
            🎵 {song.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {formatMusicalForm(song.musicalForm)}
            {formatPeriod(song.period)}
            {song.yearComposed && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {song.yearComposed}
              </span>
            )}
            {song.recommendedForDancing && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                ♪ Dance
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">
            {song.searchCount} searches
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <StarRating 
              rating={localRating}
              onRate={handleRating}
              readonly={submittingRating}
              size="sm"
              totalRatings={localTotalRatings}
              showAverage={true}
              isLoading={submittingRating}
            />
          </div>
          {ratingError && (
            <div className="text-red-500 text-xs mt-1">
              {ratingError}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Information Preview */}
      <div className="space-y-3">
        {/* Composer */}
        <div>
          <span className="text-gray-600 ml-2">{song.composer}</span>
          {song.lyricist && song.lyricist !== song.composer && (
            <span className="text-gray-600"> • <span className="font-medium">Lyricist:</span> {song.lyricist}</span>
          )}
        </div>

        {/* Cultural Significance */}
        {song.culturalSignificance && (
          <p className="text-gray-700 leading-relaxed">
            {truncateText(song.culturalSignificance, 150)}
          </p>
        )}

        {/* Themes */}
        {song.themes && song.themes.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Themes:</span>
            <div className="flex flex-wrap gap-1">
              {song.themes.slice(0, 4).map((theme, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  {theme}
                </span>
              ))}
              {song.themes.length > 4 && (
                <span className="text-xs text-gray-500">+{song.themes.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Notable Recordings Preview */}
        {song.notableRecordings && song.notableRecordings.recordings && song.notableRecordings.recordings.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Notable recordings:</span>
            <span className="text-gray-600 text-sm">
              {song.notableRecordings.recordings.slice(0, 2).map((r: any) => r.artist).join(', ')}
              {song.notableRecordings.recordings.length > 2 && ` +${song.notableRecordings.recordings.length - 2} more`}
            </span>
          </div>
        )}
      </div>

      {/* Click to view more */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Added {formatDate(song.createdAt)}
            {song.lastUpdated && song.lastUpdated !== song.createdAt && (
              <span> • Last Update: {formatDate(song.lastUpdated)}</span>
            )}
            {localRating > 0 && (
              <span> • Rating: {localRating.toFixed(1)}/5 ({localTotalRatings} review{localTotalRatings !== 1 ? 's' : ''})</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {showEnhanceButton && onEnhance && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEnhance(song);
                }}
                disabled={isEnhancing}
                className={`px-3 py-1 text-xs rounded font-semibold transition-all duration-200 ${
                  isEnhancing
                    ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg'
                }`}
              >
                {isEnhancing ? '🤖 Enhancing...' : '🤖 Enhance with AI'}
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-3 py-1 text-xs rounded font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg"
              aria-label="View full song details"
            >
              More
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Detailed Song Modal */}
    {showDetailedModal && (
      <DetailedSongModal
        song={song}
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
      />
    )}
  </>
  );
};



interface NoResultsFoundProps {
  query: string;
  onRefreshSearch: () => void;
  onQueryChange: (newQuery: string) => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ query, onRefreshSearch, onQueryChange }) => {
  const [isResearching, setIsResearching] = React.useState(false);
  const [researchError, setResearchError] = React.useState<string | null>(null);
  const [researchProgress, setResearchProgress] = React.useState<ProgressUpdate | null>(null);
  
  const handleResearchWithAI = async () => {
    if (!query.trim()) {
      setResearchError('Please enter a song title to research');
      return;
    }

    setIsResearching(true);
    setResearchError(null);
    setResearchProgress(null);

    try {
      // Import the enhanced AI service with progress tracking
      const { songInformationService } = await import('../../services/enhancedGeminiWithProgress');
      const { createEnhancedSong } = await import('../../services/firestore');
      
      console.log(`🤖 Starting AI research for: "${query}"`);
      
      // Research the song with AI and progress tracking
      const aiResult = await songInformationService.getEnhancedSongInformation(
        { title: query.trim() },
        (progress: ProgressUpdate) => {
          setResearchProgress(progress);
        }
      );
      
      // Create the song in database using enhanced data
      const finalTitle = aiResult.correctedTitle || query.trim();
      console.log(`🏷️ Using title for database: "${finalTitle}" (original: "${query}")`);
      
      const songId = await createEnhancedSong(
        finalTitle,
        aiResult,
        {
          aiResponseQuality: 'good',
          needsManualReview: false,
          lastAIUpdate: new Date(),
          retryCount: 0,
          ...aiResult.metadata
        }
      );
      
      console.log('✅ Song researched and created successfully with AI:', songId);
      
      // If we got a song result and it has a different title than what user searched for,
      // update the search query to the corrected title so user sees the correct results
      if (finalTitle.toLowerCase() !== query.trim().toLowerCase()) {
        console.log(`🔄 Updating search query from "${query}" to corrected title "${finalTitle}"`);
        onQueryChange(finalTitle);
      } else {
        // Same title or no correction needed, just refresh current search
        onRefreshSearch();
      }
      
    } catch (error) {
      console.error('Failed to research song with AI:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to research song';
      
      // Check if this is a "not a tango song" error
      if (errorMessage.includes('NOT_A_TANGO_SONG')) {
        // Provide a user-friendly message for non-tango songs
        setResearchError(`"${query}" does not appear to be a tango song. Please search for actual tango compositions from the Argentine tango repertoire (1880-present).`);
      } else {
        setResearchError(errorMessage);
      }
    } finally {
      setIsResearching(false);
      setResearchProgress(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      {query ? (
        <>
          <h3 className="text-2xl font-bold text-tango-red mb-4">
            🎶 Thank you! We missed "{query}" in our collection
          </h3>
          <div className="text-gray-700 mb-6 max-w-lg mx-auto space-y-3">
            <p className="text-lg font-medium text-tango-dark-red">
              Let's research this song!
            </p>
            <p className="text-gray-600">
              This tango song isn't in our collection yet, but that's perfectly normal! 
              Our database grows through passionate tango lovers like you.
            </p>
            <p className="text-gray-600">
              I can research this song's story, lyrics meaning, and historical context using AI, 
              then save it for everyone to enjoy.
            </p>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            🎵 Ready to Discover Tango Stories
          </h3>
          <div className="text-gray-600 mb-6 max-w-lg mx-auto">
            <p>
              Enter a tango song title above to search our collection or research new songs with AI.
            </p>
          </div>
        </>
      )}
      
      {/* AI Research Button */}
      <div className="space-y-3">
        
        {researchError && (
          <div className="text-red-600 text-sm mb-3">
            {researchError}
          </div>
        )}
        
        <button 
          onClick={handleResearchWithAI}
          disabled={isResearching || !query.trim()}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isResearching || !query.trim()
              ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
              : 'bg-tango-red hover:bg-tango-dark-red text-white hover:scale-105 shadow-lg transform'
          }`}
        >
          {isResearching ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="inline mr-2" />
                <span>{researchProgress ? 'AI Research in Progress...' : '🎵 Researching...'}</span>
              </div>
              {researchProgress && (
                <div className="w-full px-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-white h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((researchProgress.phase + (researchProgress.completed ? 1 : 0)) / researchProgress.totalPhases) * 100}%` 
                      }}
                      aria-label={`Progress: ${researchProgress.phase + 1} of ${researchProgress.totalPhases}`}
                      role="progressbar"
                      aria-valuenow={researchProgress.phase + 1}
                      aria-valuemin={0}
                      aria-valuemax={researchProgress.totalPhases}
                    />
                  </div>
                  <span className="text-xs text-white/90">
                    {researchProgress.message} ({researchProgress.phase + 1}/{researchProgress.totalPhases})
                  </span>
                </div>
              )}
            </div>
          ) : (
            '🚀 Start AI Research'
          )}
        </button>
      </div>
    </div>
  );
};

interface PopularSongsSectionProps {
  onLoadPopular: (limit?: number) => Promise<void>;
  onLoadMore?: (pageSize?: number) => Promise<void>;
  currentCount?: number;
}

const PopularSongsSection: React.FC<PopularSongsSectionProps> = ({ onLoadPopular, onLoadMore, currentCount = 0 }) => {
  const handleLoadPopular = () => onLoadPopular(10);
  const handleLoadMore = () => onLoadMore ? onLoadMore(10) : onLoadPopular(20);

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <h3 className="text-2xl font-bold text-red-700 mb-4">
        Discover Popular Tango Songs
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start by exploring our most searched tango songs, or use the search bar above to find a specific song.
      </p>
      
      {currentCount === 0 ? (
        <button 
          onClick={handleLoadPopular}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
        >
          🎵 Show Popular Songs
        </button>
      ) : (
        <button 
          onClick={handleLoadMore}
          className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-lg font-medium shadow-sm transition-all duration-150"
        >
          ➕ Load more
        </button>
      )}
    </div>
  );
};

export default SearchResults;