import { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedSearchService, { AdvancedSearchFilters, SearchOptions, SearchResult } from '../services/enhancedSearch';
import PerformanceService from '../services/performance';
import AnalyticsService from '../services/analytics';

interface UseEnhancedSearchOptions {
  debounceMs?: number;
  cacheEnabled?: boolean;
  autoSuggest?: boolean;
}

interface UseEnhancedSearchReturn {
  // Search state
  searchResult: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  
  // Search actions
  search: (term: string, filters?: AdvancedSearchFilters, options?: SearchOptions) => Promise<void>;
  clearSearch: () => void;
  loadMore: () => Promise<void>;
  
  // Suggestions
  suggestions: string[];
  getSuggestions: (term: string) => Promise<void>;
  clearSuggestions: () => void;
  
  // Popular terms
  popularTerms: string[];
  loadPopularTerms: () => Promise<void>;
  
  // Performance
  lastSearchTime: number;
  cacheStats: any;
}

export const useEnhancedSearch = (options: UseEnhancedSearchOptions = {}): UseEnhancedSearchReturn => {
  const {
    debounceMs = 300,
    cacheEnabled = true,
    autoSuggest = true
  } = options;

  // State
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Services
  const enhancedSearchService = EnhancedSearchService.getInstance();
  const performanceService = PerformanceService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  // Refs
  const currentSearchTerm = useRef<string>('');
  const currentFilters = useRef<AdvancedSearchFilters>({});
  const currentOptions = useRef<SearchOptions>({});
  const searchAbortController = useRef<AbortController | null>(null);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    performanceService.debounce(async (
      term: string, 
      filters: AdvancedSearchFilters = {}, 
      options: SearchOptions = {}
    ) => {
      if (!term.trim()) {
        setSearchResult(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Cancel previous search
        if (searchAbortController.current) {
          searchAbortController.current.abort();
        }
        searchAbortController.current = new AbortController();

        const startTime = performance.now();
        
        const result = await enhancedSearchService.search(term, filters, options);
        
        const endTime = performance.now();
        const searchTime = endTime - startTime;

        setSearchResult(result);
        setLastSearchTime(searchTime);

        // Update current search params
        currentSearchTerm.current = term;
        currentFilters.current = filters;
        currentOptions.current = options;

        // Track analytics
        await analyticsService.trackPerformance(searchTime, cacheEnabled, true);
        
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Search failed');
          console.error('Search error:', err);
        }
      } finally {
        setIsLoading(false);
        searchAbortController.current = null;
      }
    }, debounceMs),
    [debounceMs, cacheEnabled, enhancedSearchService, performanceService, analyticsService]
  );

  // Main search function
  const search = useCallback(async (
    term: string, 
    filters: AdvancedSearchFilters = {}, 
    options: SearchOptions = {}
  ) => {
    await debouncedSearch(term, filters, options);
  }, [debouncedSearch]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!searchResult || !searchResult.hasMore || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const nextPage = Math.floor(searchResult.songs.length / 20) + 1;
      const newOptions = { ...currentOptions.current, page: nextPage };

      const result = await enhancedSearchService.search(
        currentSearchTerm.current,
        currentFilters.current,
        newOptions
      );

      // Append new results
      setSearchResult(prevResult => ({
        ...result,
        songs: [...(prevResult?.songs || []), ...result.songs]
      }));

    } catch (err: any) {
      setError(err.message || 'Failed to load more results');
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchResult, isLoading, enhancedSearchService]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setError(null);
    currentSearchTerm.current = '';
    currentFilters.current = {};
    currentOptions.current = {};
    
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
  }, []);

  // Get suggestions
  const getSuggestions = useCallback(async (term: string) => {
    if (!term.trim() || !autoSuggest) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionList = await enhancedSearchService.getSearchSuggestions(term, 5);
      setSuggestions(suggestionList);
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
    }
  }, [autoSuggest, enhancedSearchService]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Load popular terms
  const loadPopularTerms = useCallback(async () => {
    try {
      const terms = await enhancedSearchService.getPopularSearchTerms(10);
      setPopularTerms(terms);
    } catch (err) {
      console.error('Popular terms error:', err);
      setPopularTerms([]);
    }
  }, [enhancedSearchService]);

  // Load cache stats
  const loadCacheStats = useCallback(() => {
    try {
      const stats = performanceService.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      console.error('Cache stats error:', err);
    }
  }, [performanceService]);

  // Initialize popular terms on mount
  useEffect(() => {
    loadPopularTerms();
    loadCacheStats();
  }, [loadPopularTerms, loadCacheStats]);

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(loadCacheStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [loadCacheStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  return {
    // Search state
    searchResult,
    isLoading,
    error,
    
    // Search actions
    search,
    clearSearch,
    loadMore,
    
    // Suggestions
    suggestions,
    getSuggestions,
    clearSuggestions,
    
    // Popular terms
    popularTerms,
    loadPopularTerms,
    
    // Performance
    lastSearchTime,
    cacheStats
  };
};