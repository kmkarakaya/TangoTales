import React from 'react';

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-tango-red">TangoTales</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search for a tango song..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tango-red"
            />
          </div>
          
          <div className="text-center">
            <p className="force-white-text">Enter a song name to search our database or discover new songs with AI</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;