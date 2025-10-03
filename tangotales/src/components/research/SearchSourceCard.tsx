import React from 'react';
import { SearchSource } from '../../types/song';

interface SearchSourceCardProps {
  source: SearchSource;
  className?: string;
}

const SearchSourceCard: React.FC<SearchSourceCardProps> = ({ source, className = "" }) => {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="break-words"
            >
              {source.title}
            </a>
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
            {source.snippet}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Query: "{source.searchQuery}"
            </span>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Source →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSourceCard;