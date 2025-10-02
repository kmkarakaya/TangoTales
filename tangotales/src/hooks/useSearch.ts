import { useCallback, useMemo, useRef } from 'react';
import { useSearchContext } from '../contexts/SearchContext';
import { searchSongsByTitle, getPopularSongs, getSongsByLetter } from '../services/firestore';
import { Song } from '../types/song';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const useSearch = () => {
  const {
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
  } = useSearchContext();

  // Cache for search results to avoid redundant API calls
  const cacheRef = useRef<Map<string, Song[]>>(new Map());

  // Main search function
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = trimmedQuery.toLowerCase();
    if (cacheRef.current.has(cacheKey)) {
      setResults(cacheRef.current.get(cacheKey)!);
      setHasSearched(true);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search in Firestore database
      const searchResults = await searchSongsByTitle(trimmedQuery);
      
      // Cache the results
      cacheRef.current.set(cacheKey, searchResults);
      
      setResults(searchResults);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search songs');
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [setResults, setLoading, setError, setHasSearched]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  // Handle search input change
  const handleSearchChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [setQuery, debouncedSearch]);

  // Handle immediate search (e.g., on button click or Enter)
  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Get popular songs
  const loadPopularSongs = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const popular = await getPopularSongs(limit);
      setResults(popular);
      setHasSearched(true);
      setQuery(''); // Clear search query since this isn't a search
    } catch (err) {
      console.error('Error loading popular songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load popular songs');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults, setHasSearched, setQuery]);

  // Get songs by letter
  const loadSongsByLetter = useCallback(async (letter: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const letterSongs = await getSongsByLetter(letter);
      setResults(letterSongs);
      setHasSearched(true);
      setQuery(`Songs starting with "${letter.toUpperCase()}"`);
    } catch (err) {
      console.error('Error loading songs by letter:', err);
      setError(err instanceof Error ? err.message : `Failed to load songs starting with "${letter}"`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults, setHasSearched, setQuery]);

  return {
    // State
    query,
    results,
    loading,
    error,
    hasSearched,
    
    // Actions
    handleSearchChange,
    handleSearchSubmit,
    loadPopularSongs,
    loadSongsByLetter,
    clearSearch,
    
    // Computed
    hasResults: results.length > 0,
    showNoResults: hasSearched && !loading && results.length === 0 && !error
  };
};