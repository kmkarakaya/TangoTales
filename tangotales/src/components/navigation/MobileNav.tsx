import React from 'react';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle, onClose }) => {
  const popularSongs = ['La Cumparsita', 'Por Una Cabeza', 'El Choclo', 'Adiós Nonino', 'Libertango'];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        onClick={onToggle}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <span className={`block h-0.5 bg-white transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 bg-white transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 bg-white transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/90">
          <div className="bg-gray-900/95 m-4 p-6 rounded-lg shadow-xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-tango font-bold text-yellow-400">Menu</h2>
              <button 
                onClick={onClose} 
                className="text-2xl text-white hover:text-yellow-400 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Mobile menu content */}
            <div className="space-y-6">
              {/* Random Button */}
              <button className="w-full bg-tango-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                🎲 Surprise Me!
              </button>
              
              {/* Popular Songs */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-4 text-yellow-400">🏆 Popular Songs</h3>
                <div className="space-y-2">
                  {popularSongs.slice(0, 5).map((song, index) => (
                    <div 
                      key={song} 
                      className="flex items-center space-x-2 p-2 rounded-lg bg-black/10 hover:bg-black/20 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-bold text-yellow-400">#{index + 1}</span>
                      <span className="text-sm text-white/80">{song}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-4 text-yellow-400">Links</h3>
                <div className="space-y-2">
                  <button className="block text-white hover:text-yellow-400 transition-colors text-left w-full">About</button>
                  <button className="block text-white hover:text-yellow-400 transition-colors text-left w-full">Contact</button>
                  <a href="https://github.com/kmkarakaya/TangoTales" className="block text-white hover:text-yellow-400 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;