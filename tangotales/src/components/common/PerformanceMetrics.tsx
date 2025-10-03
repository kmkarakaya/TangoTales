import React from 'react';

interface PerformanceMetricsProps {
  metrics: {
    apiLatency?: number;
    cacheHitRate?: number;
    totalQueries?: number;
    successRate?: number;
    averageResponseTime?: number;
    dataFreshness?: string;
  };
  className?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  metrics, 
  className = "" 
}) => {
  const formatLatency = (ms?: number) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return 'text-green-600 dark:text-green-400';
    if (value >= thresholds.fair) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const metricItems = [
    {
      label: 'API Latency',
      value: formatLatency(metrics.apiLatency),
      status: metrics.apiLatency ? getStatusColor(
        metrics.apiLatency <= 2000 ? 100 : metrics.apiLatency <= 5000 ? 50 : 0,
        { good: 80, fair: 50 }
      ) : 'text-gray-500'
    },
    {
      label: 'Cache Hit Rate',
      value: metrics.cacheHitRate ? `${Math.round(metrics.cacheHitRate)}%` : 'N/A',
      status: metrics.cacheHitRate ? getStatusColor(metrics.cacheHitRate, { good: 80, fair: 60 }) : 'text-gray-500'
    },
    {
      label: 'Success Rate',
      value: metrics.successRate ? `${Math.round(metrics.successRate)}%` : 'N/A',
      status: metrics.successRate ? getStatusColor(metrics.successRate, { good: 95, fair: 85 }) : 'text-gray-500'
    },
    {
      label: 'Avg Response Time',
      value: formatLatency(metrics.averageResponseTime),
      status: metrics.averageResponseTime ? getStatusColor(
        metrics.averageResponseTime <= 1500 ? 100 : metrics.averageResponseTime <= 3000 ? 50 : 0,
        { good: 80, fair: 50 }
      ) : 'text-gray-500'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Performance Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metricItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${item.status}`}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total Queries:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metrics.totalQueries?.toLocaleString() || 'N/A'}
          </span>
        </div>
        
        {metrics.dataFreshness && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">
              Data Freshness:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {metrics.dataFreshness}
            </span>
          </div>
        )}
      </div>

      {/* Performance Indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Performance
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {(() => {
              const avgScore = (
                (metrics.cacheHitRate || 0) +
                (metrics.successRate || 0) +
                ((metrics.apiLatency && metrics.apiLatency <= 2000) ? 100 : 
                 (metrics.apiLatency && metrics.apiLatency <= 5000) ? 70 : 30)
              ) / 3;
              
              if (avgScore >= 85) return 'Excellent';
              if (avgScore >= 70) return 'Good';
              if (avgScore >= 50) return 'Fair';
              return 'Needs Improvement';
            })()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              (() => {
                const avgScore = (
                  (metrics.cacheHitRate || 0) +
                  (metrics.successRate || 0) +
                  ((metrics.apiLatency && metrics.apiLatency <= 2000) ? 100 : 
                   (metrics.apiLatency && metrics.apiLatency <= 5000) ? 70 : 30)
                ) / 3;
                
                if (avgScore >= 85) return 'bg-green-500';
                if (avgScore >= 70) return 'bg-blue-500';
                if (avgScore >= 50) return 'bg-yellow-500';
                return 'bg-red-500';
              })()
            }`}
            style={{
              width: `${Math.max((
                (metrics.cacheHitRate || 0) +
                (metrics.successRate || 0) +
                ((metrics.apiLatency && metrics.apiLatency <= 2000) ? 100 : 
                 (metrics.apiLatency && metrics.apiLatency <= 5000) ? 70 : 30)
              ) / 3, 5)}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;