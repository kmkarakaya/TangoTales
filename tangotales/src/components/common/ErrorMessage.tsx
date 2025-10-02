import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`content-overlay p-8 text-center ${className}`}>
      <div className="text-red-400 text-sm mb-4">
        <svg className="w-3 h-3 mx-auto" style={{width: '12px', height: '12px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold mb-4 text-shadow-strong force-yellow-text">
        Something Went Wrong
      </h3>
      
      <p className="mb-6 max-w-md mx-auto text-shadow-medium force-white-text">
        {message}
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;