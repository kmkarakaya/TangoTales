import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Song } from '../types/song';

interface SearchContextType {
  query: string;
  results: Song[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  setQuery: (query: string) => void;
  setResults: (results: Song[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasSearched: (searched: boolean) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  };

  const value: SearchContextType = {
    query,
    results,
    loading,
    error,
    hasSearched,
    setQuery,
    setResults,
    setLoading,
    setError,
    setHasSearched,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};