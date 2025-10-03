import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Song } from '../../types/song';
import { LoadingSpinner, ErrorMessage, StarRating } from '../common';
import { EnhancedSongDetail } from '../songs/EnhancedSongDetail';
import { addRating } from '../../services/firestore';

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
  
  const handleEnhanceWithAI = async () => {
    if (songs.length === 0) return;
    
    setIsEnhancing(true);
    setEnhancementError(null);

    try {
      // Import enhanced services dynamically
      const { songInformationService } = await import('../../services/enhancedGemini');
      const { updateSongWithEnhancedData } = await import('../../services/firestore');
      
      // Process each song
      for (const song of songs) {
        try {
          console.log(`🤖 Enhancing song: "${song.title}"`);
          
          // Research the song with enhanced AI
          const enhancedResult = await songInformationService.getEnhancedSongInformation({ 
            title: song.title 
          });
          
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
      
      // Refresh the page to show enhanced results
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
          <>
            <LoadingSpinner size="sm" className="inline mr-2" />
            🤖 Enhancing...
          </>
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
    handleSearchSubmit,
    handleSearchChange
  } = useSearch();
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [enhancingSong, setEnhancingSong] = useState<string | null>(null);
  const [enhancedSongs, setEnhancedSongs] = useState<Map<string, Song>>(new Map());

  // Handle enhancement that keeps modal open and updates content
  const handleEnhanceSongInModal = async (song: Song) => {
    setEnhancingSong(song.id);
    
    try {
      // Import enhanced services dynamically
      const { songInformationService } = await import('../../services/enhancedGemini');
      const { updateSongWithEnhancedData, getSongById } = await import('../../services/firestore');
      
      console.log(`🤖 Enhancing song: "${song.title}"`);
      
      // Research the song with enhanced AI
      const enhancedResult = await songInformationService.getEnhancedSongInformation({ 
        title: song.title 
      });
      
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
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Searching tango songs...</p>
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

  // Show search results
  if (hasSearched && results.length > 0) {
    return (
      <div className={`${className}`}>
        {selectedSong ? (
          <EnhancedSongDetail 
            song={enhancedSongs.get(selectedSong.id) || selectedSong} 
            onClose={() => setSelectedSong(null)}
            onEnhance={() => handleEnhanceSongInModal(selectedSong)}
            isEnhancing={enhancingSong === selectedSong.id}
            className="max-w-4xl mx-auto"
          />
        ) : (
          <SearchResultsList 
            results={results.map(song => enhancedSongs.get(song.id) || song)} 
            query={query} 
            onSongClick={setSelectedSong}
            onEnhance={handleEnhanceSongInModal}
            enhancingSongId={enhancingSong}
          />
        )}
      </div>
    );
  }

  // Show popular songs when no search has been performed
  if (!hasSearched && showPopularOnEmpty) {
    return (
      <div className={`${className}`}>
        <PopularSongsSection onLoadPopular={loadPopularSongs} />
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
}

// Helper function to detect low-quality songs that need AI enhancement
const isLowQualitySong = (song: Song): boolean => {
  return (
    song.composer === 'Unknown' &&
    (!song.culturalSignificance || 
     song.culturalSignificance.includes('This tango song is part of the rich Argentine musical tradition.') ||
     song.culturalSignificance.includes('This is a traditional tango song.')) &&
    (!song.themes || song.themes.length <= 2) &&
    (!song.notableRecordings || song.notableRecordings.length === 0) &&
    (!song.notablePerformers || song.notablePerformers.length === 0)
  );
};

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, query, onSongClick, onEnhance, enhancingSongId }) => {
  const lowQualitySongs = results.filter(isLowQualitySong);
  const hasLowQualitySongs = lowQualitySongs.length > 0;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          Search Results
        </h2>
        <p className="text-gray-600">
          Found {results.length} song{results.length !== 1 ? 's' : ''} 
          {query && ` for "${query}"`}
        </p>
        
        {/* Show AI Enhancement Option for Low Quality Songs */}
        {hasLowQualitySongs && (
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

  return (
    <div 
      onClick={onClick}
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
          <span className="font-medium text-gray-700">Composer:</span> 
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
        {song.notableRecordings && song.notableRecordings.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Notable recordings:</span>
            <span className="text-gray-600 text-sm">
              {song.notableRecordings.slice(0, 2).map(r => r.artist).join(', ')}
              {song.notableRecordings.length > 2 && ` +${song.notableRecordings.length - 2} more`}
            </span>
          </div>
        )}
      </div>

      {/* Click to view more */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Added {formatDate(song.createdAt)}
          </span>
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
            <span className="text-sm text-red-600 font-medium hover:text-red-700">
              Click for full details →
            </span>
          </div>
        </div>
      </div>
    </div>
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
  
  const handleResearchWithAI = async () => {
    if (!query.trim()) {
      setResearchError('Please enter a song title to research');
      return;
    }

    setIsResearching(true);
    setResearchError(null);

    try {
      // Import the new user-controlled AI creation function
      const { createSongWithAI } = await import('../../services/firestore');
      
      // Create song with AI using the new user-controlled approach
      const resultSong = await createSongWithAI(query.trim());
      
      console.log('Song researched and created successfully with AI:', resultSong);
      
      // If we got a song result and it has a different title than what user searched for,
      // update the search query to the corrected title so user sees the correct results
      if (resultSong && resultSong.title && resultSong.title.toLowerCase() !== query.trim().toLowerCase()) {
        console.log(`🔄 Updating search query from "${query}" to corrected title "${resultSong.title}"`);
        onQueryChange(resultSong.title);
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <h3 className="text-2xl font-bold text-red-700 mb-4">
        No Songs Found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {query 
          ? `We couldn't find any tango songs matching "${query}" in our database.`
          : "No songs found in our database."
        }
      </p>
      
      {/* AI Research Button */}
      <div className="space-y-3">
        <p className="text-gray-500 text-sm">
          {query ? "Would you like me to research this song for you?" : "Enter a song title to research with AI."}
        </p>
        
        {researchError && (
          <div className="text-red-600 text-sm mb-3">
            {researchError}
          </div>
        )}
        
        <button 
          onClick={handleResearchWithAI}
          disabled={isResearching || !query.trim()}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isResearching || !query.trim()
              ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg'
          }`}
        >
          {isResearching ? (
            <>
              <LoadingSpinner size="sm" className="inline mr-2" />
              🤖 Researching...
            </>
          ) : (
            '🤖 Research with AI'
          )}
        </button>
      </div>
    </div>
  );
};

interface PopularSongsSectionProps {
  onLoadPopular: (limit?: number) => Promise<void>;
}

const PopularSongsSection: React.FC<PopularSongsSectionProps> = ({ onLoadPopular }) => {
  const handleLoadPopular = () => {
    onLoadPopular(10);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <h3 className="text-2xl font-bold text-red-700 mb-4">
        Discover Popular Tango Songs
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start by exploring our most searched tango songs, or use the search bar above to find a specific song.
      </p>
      
      <button 
        onClick={handleLoadPopular}
        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
      >
        🎵 Show Popular Songs
      </button>
    </div>
  );
};

export default SearchResults;