import React from 'react';
import { SearchBar, SearchResults } from '../components/search';
import './HomePage.css';

const HomePage: React.FC = () => {
  // Background image from public/images folder - change filename here to update background
  const backgroundImageName = 'tango-background.jpg';
  
  const backgroundStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(161, 23, 41, 0.1)), url('/images/${backgroundImageName}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed' as const
  };

  return (
    <div className="min-h-screen tango-background" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          {/* Header Section with Maximum Readability */}
          <div className="content-overlay p-8 mb-8 mx-4">
            <h1 className="text-6xl font-bold mb-6 text-shadow-strong" style={{color: '#FFD700'}}>
              🎵 TangoTales
            </h1>
            <p className="text-2xl mb-8 max-w-3xl mx-auto text-shadow-medium font-medium" style={{color: '#FFFFFF'}}>
              Discover the stories behind Argentine Tango songs with AI-powered explanations
            </p>
          </div>
          
          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="search-container p-6">
              <SearchBar placeholder="Search for a tango song..." />
            </div>
          </div>
          
          {/* Search Results Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <SearchResults />
          </div>
          
          {/* How it Works Section */}
          <div className="content-overlay p-8 mx-4">
            <h2 className="text-3xl font-bold mb-8 text-shadow-strong" style={{color: '#FFD700'}}>
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="feature-card rounded-xl p-8 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-6">🔍</div>
                <h3 className="text-xl font-bold mb-3 text-shadow-medium" style={{color: '#FFD700'}}>Search</h3>
                <p className="text-lg text-shadow-medium" style={{color: '#FFFFFF'}}>Enter the name of any tango song</p>
              </div>
              <div className="feature-card rounded-xl p-8 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-6">🤖</div>
                <h3 className="text-xl font-bold mb-3 text-shadow-medium" style={{color: '#FFD700'}}>AI Research</h3>
                <p className="text-lg text-shadow-medium" style={{color: '#FFFFFF'}}>Our AI finds and explains the song's history</p>
              </div>
              <div className="feature-card rounded-xl p-8 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-6">📚</div>
                <h3 className="text-xl font-bold mb-3 text-shadow-medium" style={{color: '#FFD700'}}>Learn</h3>
                <p className="text-lg text-shadow-medium" style={{color: '#FFFFFF'}}>Discover the stories and cultural significance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;