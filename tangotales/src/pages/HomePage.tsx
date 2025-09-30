import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tango-red to-red-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-8">
            🎵 TangoTales
          </h1>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Discover the stories behind Argentine Tango songs with AI-powered explanations
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a tango song..."
                className="w-full px-6 py-4 text-lg rounded-lg text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-tango-gold"
              />
              <button className="absolute right-2 top-2 bg-tango-gold text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                Search
              </button>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-semibold mb-2">Search</h3>
                <p>Enter the name of any tango song</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-semibold mb-2">AI Research</h3>
                <p>Our AI finds and explains the song's history</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-semibold mb-2">Learn</h3>
                <p>Discover the stories and cultural significance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;