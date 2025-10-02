import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components/search';
import { AlphabetNav } from '../components/navigation';
import { useSearch } from '../hooks/useSearch';

const SearchPage: React.FC = () => {
  const { loadSongsByLetter } = useSearch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-red-700">
              🎵 TangoTales Search
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <SearchBar placeholder="Search for a tango song..." />
          
          {/* A-Z Navigation */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Browse by Letter</h3>
            <AlphabetNav onLetterClick={loadSongsByLetter} />
          </div>
        </div>

        {/* Results */}
        <SearchResults showPopularOnEmpty={false} />
      </main>
    </div>
  );
};

export default SearchPage;