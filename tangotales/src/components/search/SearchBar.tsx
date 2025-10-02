import React, { useRef } from 'react';
import { searchSongsByTitle } from '../../services/firestore';
import { Song } from '../../types/song';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showButton?: boolean;
  onSearch?: (query: string) => void;
  onSearchPerformed?: (query: string, results: Song[], error: string | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search for a tango song...", 
  className = "",
  showButton = true,
  onSearch,
  onSearchPerformed
}) => {

  
  // No React state for input value or loading - let DOM handle input naturally
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Perform the actual search - no state updates to prevent re-renders during typing
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const searchResults = await searchSongsByTitle(searchQuery.trim());
      
      // Notify parent via callback - this happens outside the component
      if (onSearchPerformed) {
        onSearchPerformed(searchQuery, searchResults, null);
      }
      
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search songs';
      
      // Notify parent of error via callback
      if (onSearchPerformed) {
        onSearchPerformed(searchQuery, [], errorMessage);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is empty
    if (!newValue.trim()) {
      return;
    }

    // Set new timeout for debounced search - NO state updates here
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newValue);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear timeout and search immediately
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Get current value from ref
    const currentValue = inputRef.current?.value || '';
    performSearch(currentValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      <div className={`
        bg-white/10 rounded-lg shadow-md border border-white/20 transition-all duration-300 
        focus-within:ring-2 focus-within:ring-yellow-400/50 focus-within:scale-105
      `}>
        <div className="flex items-center p-4">
          <div className="text-2xl mr-3">🎵</div>
          <input
            ref={inputRef}
            type="text"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none font-body text-lg"
          />
          <button 
            type="submit"
            onClick={handleSubmit}
            className="ml-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">🔍</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
