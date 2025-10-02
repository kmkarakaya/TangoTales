import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components/search';

const SearchPage: React.FC = () => {
  const backgroundStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(161, 23, 41, 0.2)), url('/images/tango-background.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed' as const
  };

  return (
    <div className="min-h-screen tango-background" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-yellow-400 text-shadow-strong font-tango mb-2">
              🎵 TangoTales
            </h1>
          </Link>
          <p className="text-white/80 text-shadow-medium">Search Results</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="search-container p-6">
            <SearchBar placeholder="Search for a tango song..." />
          </div>
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto">
          <SearchResults showPopularOnEmpty={false} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;