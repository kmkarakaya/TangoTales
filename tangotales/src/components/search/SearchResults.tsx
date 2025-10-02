import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Song } from '../../types/song';
import { LoadingSpinner, ErrorMessage } from '../common';

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
    loadPopularSongs 
  } = useSearch();

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
        <NoResultsFound query={query} />
      </div>
    );
  }

  // Show search results
  if (hasSearched && results.length > 0) {
    return (
      <div className={`${className}`}>
        <SearchResultsList results={results} query={query} />
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
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, query }) => {
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
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

interface SongCardProps {
  song: Song;
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200">
      {/* Song Title */}
      <h3 className="text-2xl font-bold text-red-700 mb-3">
        <span className="text-lg">🎵</span> {song.title}
      </h3>

      {/* Song Stats */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-3 h-3 mr-1" style={{width: '12px', height: '12px'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          {song.searchCount} searches
        </div>
        
        {song.averageRating > 0 && (
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-yellow-500" style={{width: '12px', height: '12px'}} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {song.averageRating.toFixed(1)} ({song.totalRatings} ratings)
          </div>
        )}
        
        <div className="text-gray-500">
          Added {formatDate(song.createdAt)}
        </div>
      </div>

      {/* Song Explanation Preview */}
      {song.explanation && (
        <p className="text-gray-700 mb-4 leading-relaxed">
          {truncateText(song.explanation)}
        </p>
      )}

      {/* Tags */}
      {song.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {song.tags.slice(0, 5).map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
          {song.tags.length > 5 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              +{song.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Sources */}
      {song.sources.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Sources:</span> {song.sources.length} reference{song.sources.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

interface NoResultsFoundProps {
  query: string;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ query }) => {
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
      
      {/* Future: Research Button (Step 5) */}
      <div className="space-y-3">
        <p className="text-gray-500 text-sm">
          Don't worry! In the next update, you'll be able to research new songs with AI.
        </p>
        <button 
          disabled
          className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
        >
          🤖 Research with AI (Coming Soon)
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