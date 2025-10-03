import React from 'react';
import { SearchBar, SearchResults } from '../components/search';
import { AlphabetNav } from '../components/navigation';
import { useSearchContext } from '../contexts/SearchContext';
import { getSongsByLetter, getPopularSongs } from '../services/firestore';
import { Song } from '../types/song';

const HomePage: React.FC = () => {
  const { setQuery, setResults, setLoading, setError, setHasSearched } = useSearchContext();

  React.useEffect(() => {
    // Load popular songs on initial mount
    const loadInitialSongs = async () => {
      try {
        const songs = await getPopularSongs(10);
        setResults(songs);
        // We loaded popular songs for the landing page; do not mark this as a user search
        setHasSearched(false);
      } catch (error) {
        console.error('Failed to load popular songs:', error);
      }
    };
    loadInitialSongs();
  }, [setResults, setHasSearched]);

  const handleSearchPerformed = React.useCallback((query: string, results: Song[], error: string | null) => {
    setQuery(query);
    setResults(results);
    setError(error);
    setHasSearched(true);
  }, [setQuery, setResults, setError, setHasSearched]);

  const handleLetterClick = React.useCallback(async (letter: string) => {
    try {
      setLoading(true);
      const songs = await getSongsByLetter(letter);
      setResults(songs);
      setQuery(`Songs starting with "${letter}"`);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to load songs by letter:', error);
      setError(error instanceof Error ? error.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setResults, setQuery, setHasSearched, setError]);

  const handleLoadPopularSongs = React.useCallback(async () => {
    try {
      setLoading(true);
      const songs = await getPopularSongs(10);
      setResults(songs);
      setQuery('');
      // Loading popular songs is not a text search — keep hasSearched false so the UI shows
      // a neutral popular list instead of a "Search Results" header.
      setHasSearched(false);
    } catch (error) {
      console.error('Failed to load popular songs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setResults, setQuery, setHasSearched, setError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      {/* Header - Unicode search fix deployed */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-red-700">
                🎵 TangoTales
              </h1>
              <p className="text-gray-600 mt-1">
                Discover the stories behind classic tango songs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - A-Z Navigation (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Browse by Letter
              </h3>
              <AlphabetNav onLetterClick={handleLetterClick} />
            </div>
          </aside>

          {/* Center Content - Search & Results */}
          <section className="lg:col-span-7">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <SearchBar 
                placeholder="Search for a tango song..." 
                onSearchPerformed={handleSearchPerformed}
              />
            </div>

            {/* Results */}
            <SearchResults showPopularOnEmpty={true} />
          </section>

          {/* Right Sidebar - Popular Songs */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔥 Popular Songs
              </h3>
              
              <button
                onClick={handleLoadPopularSongs}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Show Popular Songs
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Click to see trending tango songs
              </p>
            </div>
          </aside>
        </div>

        {/* Feature Cards - Below Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search Songs
            </h3>
            <p className="text-sm text-gray-600">
              Find tango songs by title or browse alphabetically
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Research
            </h3>
            <p className="text-sm text-gray-600">
              Get detailed explanations powered by Gemini AI
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rate & Review
            </h3>
            <p className="text-sm text-gray-600">
              Share your thoughts and help others discover great songs
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-600">
            © 2025 TangoTales. Discover the stories behind tango music.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
