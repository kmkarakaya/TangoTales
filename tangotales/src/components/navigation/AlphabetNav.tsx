import React from 'react';

interface AlphabetNavProps {
  onLetterClick?: (letter: string) => void;
  activeLetter?: string;
  className?: string;
}

export const AlphabetNav: React.FC<AlphabetNavProps> = ({ 
  onLetterClick, 
  activeLetter,
  className = "" 
}) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleLetterClick = (letter: string) => {
    if (onLetterClick) {
      onLetterClick(letter);
    }
  };

  return (
    <div className={`glass-card fade-in ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-shadow-medium text-yellow-400">
          Browse by Letter
        </h2>
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`
                flex-shrink-0 w-10 h-10 rounded-lg transition-all duration-200 
                font-semibold text-shadow-medium hover-lift
                ${activeLetter === letter 
                  ? 'bg-yellow-400/30 text-yellow-400 ring-2 ring-yellow-400/50' 
                  : 'bg-black/20 hover:bg-black/40 text-white'
                }
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlphabetNav;