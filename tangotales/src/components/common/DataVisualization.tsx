import React from 'react';

export interface DataVisualizationProps {
  data: {
    popularity?: number;
    searchFrequency?: number;
    culturalSignificance?: number;
    musicalComplexity?: number;
    historicalPeriods?: string[];
    recordingCount?: number;
    sourceReliability?: number;
  };
  className?: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, className = "" }) => {
  const metrics = [
    { label: 'Popularity', value: data.popularity || 0, color: 'bg-blue-500' },
    { label: 'Search Frequency', value: data.searchFrequency || 0, color: 'bg-green-500' },
    { label: 'Cultural Significance', value: data.culturalSignificance || 0, color: 'bg-purple-500' },
    { label: 'Musical Complexity', value: data.musicalComplexity || 0, color: 'bg-orange-500' },
    { label: 'Source Reliability', value: data.sourceReliability || 0, color: 'bg-red-500' },
  ];

  const maxValue = Math.max(...metrics.map(m => m.value), 1);

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Data Insights
      </h3>
      
      {/* Metrics Chart */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.label}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metric.value.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${metric.color} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${(metric.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Periods */}
      {data.historicalPeriods && data.historicalPeriods.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Historical Periods
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.historicalPeriods.map((period, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full"
              >
                {period}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recording Count */}
      {data.recordingCount && data.recordingCount > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Recordings Found
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {data.recordingCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;