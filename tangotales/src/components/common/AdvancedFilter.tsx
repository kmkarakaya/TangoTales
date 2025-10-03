import React from 'react';

interface AdvancedFilterProps {
  filters: {
    sourceReliability?: number;
    culturalPeriod?: string;
    popularity?: number;
    hasRecordings?: boolean;
    completedResearch?: boolean;
  };
  onFilterChange: (filters: any) => void;
  className?: string;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ 
  filters, 
  onFilterChange, 
  className = "" 
}) => {
  const culturalPeriods = [
    'Golden Age (1935-1952)',
    'Post-Golden Age (1953-1970s)',
    'Traditional (Pre-1935)',
    'Modern (1980s-Present)',
    'Neo-Tango (2000s-Present)'
  ];

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Advanced Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Source Reliability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Source Reliability
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sourceReliability || 0}
            onChange={(e) => handleFilterChange('sourceReliability', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span className="font-medium">{filters.sourceReliability || 0}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Cultural Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cultural Period
          </label>
          <select
            value={filters.culturalPeriod || ''}
            onChange={(e) => handleFilterChange('culturalPeriod', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Periods</option>
            {culturalPeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        {/* Popularity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Popularity Score
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={filters.popularity || 0}
            onChange={(e) => handleFilterChange('popularity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0</span>
            <span className="font-medium">{(filters.popularity || 0).toFixed(1)}</span>
            <span>10</span>
          </div>
        </div>

        {/* Boolean Filters */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasRecordings || false}
              onChange={(e) => handleFilterChange('hasRecordings', e.target.checked || undefined)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Has recordings available
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.completedResearch || false}
              onChange={(e) => handleFilterChange('completedResearch', e.target.checked || undefined)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Research completed
            </span>
          </label>
        </div>

        {/* Active Filters Summary */}
        {Object.keys(filters).length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(filters).length} filter{Object.keys(filters).length !== 1 ? 's' : ''} active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilter;