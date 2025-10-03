import React from 'react';

interface ProgressStep {
  phase: number;
  totalPhases: number;
  message: string;
  icon: string;
  completed: boolean;
}

interface AIResearchProgressProps {
  currentStep?: ProgressStep;
  className?: string;
}

const AIResearchProgress: React.FC<AIResearchProgressProps> = ({ 
  currentStep, 
  className = "" 
}) => {
  if (!currentStep) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin">🤖</div>
        <span className="text-sm text-gray-600">Initializing AI research...</span>
      </div>
    );
  }

  const { phase, totalPhases, message, icon, completed } = currentStep;
  const progressPercentage = ((phase + (completed ? 1 : 0)) / totalPhases) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Current step */}
      <div className="flex items-center space-x-2">
        <span className={completed ? '' : 'animate-pulse'}>
          {completed ? '✅' : icon}
        </span>
        <span className="text-sm font-medium">
          {message}
        </span>
        <span className="text-xs text-gray-500">
          ({phase + 1}/{totalPhases})
        </span>
      </div>
    </div>
  );
};

export default AIResearchProgress;