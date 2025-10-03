import React from 'react';

interface PartialDataIndicatorProps {
  phases: string[];
  totalPhases: number;
  className?: string;
}

const PartialDataIndicator: React.FC<PartialDataIndicatorProps> = ({ 
  phases, 
  totalPhases, 
  className = "" 
}) => {
  const completionPercentage = (phases.length / totalPhases) * 100;
  
  return (
    <div className={`mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Research Progress
          </span>
        </div>
        <span className="text-sm text-blue-600 dark:text-blue-300 font-medium">
          {phases.length}/{totalPhases} phases complete
        </span>
      </div>
      
      <div className="mt-2">
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-blue-600 dark:text-blue-400">
          <span>Research in progress...</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
      </div>
      
      {phases.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {phases.map((phase, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
            >
              ✓ {phase}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartialDataIndicator;