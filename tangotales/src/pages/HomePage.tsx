import React from 'react';
import { SearchBar, SearchResults } from '../components/search';
import './HomePage.css';

const HomePage: React.FC = () => {
  const backgroundStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(161, 23, 41, 0.2)), url('/images/tango-background.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed' as const
  };

  return (
    <div className="min-h-screen tango-background" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 text-shadow-strong text-yellow-400 font-tango">
            🎵 TangoTales
          </h1>
          <p className="text-2xl mb-8 text-white text-shadow-medium font-medium max-w-3xl mx-auto">
            Discover the stories behind Argentine Tango songs with AI-powered explanations
          </p>
        </div>
        
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="search-container p-6">
            <SearchBar placeholder="Search for a tango song..." />
          </div>
        </div>
        
        {/* Search Results */}
        <div className="max-w-5xl mx-auto mb-12">
          <SearchResults showPopularOnEmpty={true} />
        </div>
        
        {/* Features Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="content-overlay p-8 mb-8">
            <h2 className="text-3xl font-bold text-yellow-400 text-shadow-strong mb-8 text-center font-tango">
              How it Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="feature-card p-6 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-yellow-400 text-shadow-medium mb-3">Search</h3>
                <p className="text-white/90 text-shadow-medium">Search our database or browse by popularity</p>
              </div>
              
              <div className="feature-card p-6 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-yellow-400 text-shadow-medium mb-3">AI Research</h3>
                <p className="text-white/90 text-shadow-medium">Get AI-powered explanations and history</p>
              </div>
              
              <div className="feature-card p-6 text-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-yellow-400 text-shadow-medium mb-3">Learn</h3>
                <p className="text-white/90 text-shadow-medium">Explore stories and cultural significance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
