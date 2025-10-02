import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search for a tango song...", 
  className = "",
  showButton = true 
}) => {
  const { query, loading, handleSearchChange, handleSearchSubmit } = useSearch();
  const [localQuery, setLocalQuery] = useState(query);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    handleSearchChange(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    handleSearchChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon - FORCED SMALL SIZE */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg 
              width="16" 
              height="16" 
              style={{width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px'}}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className="w-full pl-12 pr-24 py-4 text-lg rounded-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500 force-black-text"
          />

          {/* Clear Button - FORCED SMALL SIZE */}
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg 
                width="16" 
                height="16" 
                style={{width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px'}}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search Button */}
          {showButton && (
            <button
              type="submit"
              disabled={loading || !localQuery.trim()}
              className={`absolute right-2 top-2 bottom-2 px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed force-black-text ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg 
                    width="12" 
                    height="12" 
                    style={{width: '12px', height: '12px', minWidth: '12px', minHeight: '12px', maxWidth: '12px', maxHeight: '12px', marginRight: '8px'}}
                    className="animate-spin" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline force-black-text">Searching...</span>
                </div>
              ) : (
                'Search'
              )}
            </button>
          )}
        </div>
      </form>

      {/* Loading Indicator - FORCED SMALL SIZE */}
      {loading && (
        <div className="absolute left-0 right-0 top-full mt-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex items-center justify-center text-gray-600">
              <svg 
                width="12" 
                height="12" 
                style={{width: '12px', height: '12px', minWidth: '12px', minHeight: '12px', maxWidth: '12px', maxHeight: '12px', marginRight: '8px'}}
                className="animate-spin" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Searching database...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;