import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Song } from '../../types/song';
import { LoadingSpinner, ErrorMessage } from '../common';
import { EnhancedSongDetail } from '../songs/EnhancedSongDetail';

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
    handleSearchSubmit 
  } = useSearch();
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

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
        <NoResultsFound query={query} onRefreshSearch={handleSearchSubmit} />
      </div>
    );
  }

  // Show search results
  if (hasSearched && results.length > 0) {
    return (
      <div className={`${className}`}>
        {selectedSong ? (
          <EnhancedSongDetail 
            song={selectedSong} 
            onClose={() => setSelectedSong(null)}
            className="max-w-4xl mx-auto"
          />
        ) : (
          <SearchResultsList 
            results={results} 
            query={query} 
            onSongClick={setSelectedSong}
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
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, query, onSongClick }) => {
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
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((song) => (
          <SongCard key={song.id} song={song} onClick={() => onSongClick(song)} />
        ))}
      </div>
    </div>
  );
};

interface SongCardProps {
  song: Song;
  onClick?: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onClick }) => {
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
          {song.averageRating > 0 && (
            <div className="flex items-center text-sm text-yellow-600">
              ⭐ {song.averageRating.toFixed(1)} ({song.totalRatings})
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
          <span className="text-sm text-red-600 font-medium hover:text-red-700">
            Click for full details →
          </span>
        </div>
      </div>
    </div>
  );
};



interface NoResultsFoundProps {
  query: string;
  onRefreshSearch: () => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ query, onRefreshSearch }) => {
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
      // Import enhanced services dynamically
      const { enhancedGeminiService } = await import('../../services/enhancedGemini');
      const { createEnhancedSong } = await import('../../services/firestore');
      
      // Research the song with enhanced AI
      const enhancedResult = await enhancedGeminiService.getEnhancedSongInformation({ 
        title: query.trim() 
      });
      
      // Create enhanced song in database
      const songId = await createEnhancedSong(
        query.trim(),
        enhancedResult,
        enhancedResult.metadata
      );
      
      console.log('Enhanced song researched and created successfully:', songId);
      
      // Refresh the search to show the new song
      onRefreshSearch();
      
    } catch (error) {
      console.error('Failed to research song with enhanced AI:', error);
      setResearchError(error instanceof Error ? error.message : 'Failed to research song');
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