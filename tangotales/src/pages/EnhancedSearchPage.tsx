import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components/search';
import { AlphabetNav } from '../components/navigation';
import { AdvancedFilter, DataVisualization, PerformanceMetrics } from '../components/common';
import { useSearch } from '../hooks/useSearch';
import EnhancedSearchService, { AdvancedSearchFilters } from '../services/enhancedSearch';
import AnalyticsService from '../services/analytics';

const EnhancedSearchPage: React.FC = () => {
  const { loadSongsByLetter } = useSearch();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);

  const enhancedSearchService = EnhancedSearchService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadAnalytics();
    loadPopularTerms();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
      setPerformanceData({
        apiLatency: data.performanceMetrics.apiLatency,
        cacheHitRate: data.performanceMetrics.cacheHitRate,
        successRate: data.performanceMetrics.successRate,
        averageResponseTime: data.performanceMetrics.averageResponseTime,
        totalQueries: data.searchQueries,
        dataFreshness: 'Live'
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadPopularTerms = async () => {
    try {
      const terms = await enhancedSearchService.getPopularSearchTerms(5);
      setPopularTerms(terms);
    } catch (error) {
      console.error('Failed to load popular terms:', error);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const visualizationData = analytics ? {
    popularity: analytics.userEngagement.averageSessionTime / 60, // Convert to minutes
    searchFrequency: analytics.searchQueries,
    culturalSignificance: 7.5, // Placeholder
    musicalComplexity: 6.8, // Placeholder
    sourceReliability: analytics.performanceMetrics.successRate,
    recordingCount: analytics.researchMetrics.totalResearches,
    historicalPeriods: ['Golden Age', 'Modern Era', 'Contemporary']
  } : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold text-red-700">
                🎵 TangoTales Advanced Search
              </h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              
              <span className="text-sm text-gray-600">
                {analytics?.searchQueries || 0} total searches
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Advanced Filters */}
          <div className={`${showAdvancedFilters ? 'col-span-12 lg:col-span-3' : 'col-span-0'} transition-all duration-300`}>
            {showAdvancedFilters && (
              <div className="space-y-6">
                <AdvancedFilter
                  filters={filters}
                  onFilterChange={setFilters}
                />
                
                {performanceData && (
                  <PerformanceMetrics
                    metrics={performanceData}
                  />
                )}
              </div>
            )}
          </div>

          {/* Main Search Area */}
          <div className={`${showAdvancedFilters ? 'col-span-12 lg:col-span-9' : 'col-span-12'} transition-all duration-300`}>
            {/* Search Bar and Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <SearchBar placeholder="Search for a tango song..." />
              
              {/* Popular Search Terms */}
              {popularTerms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTerms.map((term, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        onClick={() => {
                          // This would need to be connected to the search functionality
                          console.log('Search for:', term);
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* A-Z Navigation */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Browse by Letter</h3>
                <AlphabetNav onLetterClick={loadSongsByLetter} />
              </div>

              {/* Active Filters Display */}
              {Object.keys(filters).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Active Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(filters).map(([key, value]) => (
                      value !== undefined && (
                        <span
                          key={key}
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                        >
                          {key}: {String(value)}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, [key]: undefined }))}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Visualization */}
            {analytics && Object.keys(visualizationData).length > 0 && (
              <div className="mb-6">
                <DataVisualization
                  data={visualizationData}
                />
              </div>
            )}

            {/* Search Results */}
            <SearchResults showPopularOnEmpty={false} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedSearchPage;