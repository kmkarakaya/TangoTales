import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';
import LoadingSpinner from '../common/LoadingSpinner';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showButton?: boolean;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search for a tango song...", 
  className = "",
  showButton = true,
  onSearch
}) => {
  const { query, loading, handleSearchChange, handleSearchSubmit } = useSearch();
  const [localQuery, setLocalQuery] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localQuery.trim() && onSearch) {
        onSearch(localQuery.trim());
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [localQuery, onSearch]);

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

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      <div className={`
        bg-white/10 rounded-lg shadow-md border border-white/20 transition-all duration-300 
        ${isFocused ? 'ring-2 ring-yellow-400/50 scale-105' : ''}
      `}>
        <div className="flex items-center p-4">
          <div className="text-2xl mr-3">🎵</div>
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-white/60 outline-none font-body text-lg"
          />
          {loading ? (
            <LoadingSpinner size="sm" message="" />
          ) : (
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={!localQuery.trim()}
              className="ml-3 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <span className="text-xl">🔍</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Search suggestions dropdown */}
      {isFocused && localQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 rounded-lg p-4 z-50 border border-white/10 shadow-xl">
          <div className="text-sm text-white/60 font-body">
            Press Enter to search for "{localQuery}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;