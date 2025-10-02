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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => handleLetterClick(letter)}
          className={`
            w-10 h-10 rounded-lg font-semibold transition-all duration-200
            ${activeLetter === letter 
              ? 'bg-red-600 text-white ring-2 ring-red-400' 
              : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
            }
          `}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetNav;