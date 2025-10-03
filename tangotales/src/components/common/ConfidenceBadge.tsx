import React from 'react';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  className?: string;
}

const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, className = "" }) => {
  const badgeStyles = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const icons = {
    high: '✓',
    medium: '⚠',
    low: '!'
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[confidence]} ${className}`}
      title={`Confidence level: ${confidence}`}
    >
      <span className="mr-1">{icons[confidence]}</span>
      {confidence.toUpperCase()}
    </span>
  );
};

export default ConfidenceBadge;