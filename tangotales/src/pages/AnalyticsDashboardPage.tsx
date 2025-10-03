import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataVisualization, PerformanceMetrics } from '../components/common';
import AnalyticsService, { AnalyticsData } from '../services/analytics';
import PerformanceService from '../services/performance';

const AnalyticsDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const analyticsService = AnalyticsService.getInstance();
  const performanceService = PerformanceService.getInstance();

  useEffect(() => {
    loadAnalytics();
    loadCacheStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadAnalytics();
      loadCacheStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCacheStats = () => {
    try {
      const stats = performanceService.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      console.error('Cache stats error:', err);
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const visualizationData = analytics ? {
    popularity: analytics.userEngagement.averageSessionTime / 60,
    searchFrequency: Math.min(analytics.searchQueries / 100, 10), // Normalize to 0-10 scale
    culturalSignificance: 7.5, // Placeholder
    musicalComplexity: 6.8, // Placeholder
    sourceReliability: analytics.performanceMetrics.successRate,
    recordingCount: analytics.researchMetrics.totalResearches,
    historicalPeriods: analytics.researchMetrics.popularResearchTopics
  } : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Analytics Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAnalytics}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.searchQueries.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Searches</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.researchMetrics.totalResearches.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Research Completed</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.userEngagement.averageSessionTime / 60)}m
                </div>
                <div className="text-sm text-gray-600">Avg Session Time</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(analytics.performanceMetrics.successRate)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Charts and Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataVisualization data={visualizationData} />
              
              <PerformanceMetrics
                metrics={{
                  ...analytics.performanceMetrics,
                  totalQueries: analytics.searchQueries,
                  dataFreshness: 'Live'
                }}
              />
            </div>

            {/* Popular Songs */}
            {analytics.popularSongs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Most Popular Songs
                </h2>
                <div className="space-y-3">
                  {analytics.popularSongs.slice(0, 10).map((song: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {song.title}
                        </span>
                      </div>
                      <span className="text-blue-600 font-semibold">
                        {song.count} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Topics */}
            {analytics.researchMetrics.popularResearchTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Popular Research Topics
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analytics.researchMetrics.popularResearchTopics.map((topic: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cache Statistics */}
            {cacheStats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Cache Performance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.active}
                    </div>
                    <div className="text-sm text-gray-600">Active Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {cacheStats.expired}
                    </div>
                    <div className="text-sm text-gray-600">Expired Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(cacheStats.hitRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Hit Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {cacheStats.size}
                    </div>
                    <div className="text-sm text-gray-600">Total Size</div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                User Engagement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.userEngagement.pagesPerSession.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Pages per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(analytics.userEngagement.averageSessionTime)}s
                  </div>
                  <div className="text-sm text-gray-600">Average Session Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(analytics.userEngagement.bounceRate)}%
                  </div>
                  <div className="text-sm text-gray-600">Bounce Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboardPage;