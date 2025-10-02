import React from 'react';
import { Song, Recording, Performer } from '../../types/song';

interface EnhancedSongDetailProps {
  song: Song;
  onClose?: () => void;
  onEnhance?: () => void;
  isEnhancing?: boolean;
  className?: string;
}

export const EnhancedSongDetail: React.FC<EnhancedSongDetailProps> = ({
  song,
  onClose,
  onEnhance,
  isEnhancing = false,
  className = ""
}) => {
  const renderRecording = (recording: Recording, index: number) => (
    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="font-medium text-white/90">{recording.artist}</div>
      {recording.orchestra && (
        <div className="text-sm text-white/70">{recording.orchestra}</div>
      )}
      {recording.year && (
        <div className="text-sm text-white/60">{recording.year}</div>
      )}
      {recording.significance && (
        <div className="text-sm text-white/80 mt-1">{recording.significance}</div>
      )}
    </div>
  );

  const renderPerformer = (performer: Performer, index: number) => (
    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="font-medium text-white/90">{performer.name}</div>
      <div className="text-sm text-white/70">{performer.role}</div>
      {performer.period && (
        <div className="text-sm text-white/60">{performer.period}</div>
      )}
      {performer.significance && (
        <div className="text-sm text-white/80 mt-1">{performer.significance}</div>
      )}
    </div>
  );

  const renderSection = (title: string, content: React.ReactNode, show: boolean = true) => {
    if (!show) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white/90 mb-3 border-b border-white/20 pb-2">
          {title}
        </h3>
        {content}
      </div>
    );
  };

  const formatPeriod = (period: string) => {
    const periodColors = {
      'Pre-Golden Age': 'text-amber-400',
      'Golden Age': 'text-yellow-400',
      'Post-Golden Age': 'text-orange-400',
      'Contemporary': 'text-blue-400'
    };
    
    return (
      <span className={periodColors[period as keyof typeof periodColors] || 'text-white/70'}>
        {period}
      </span>
    );
  };

  const formatMusicalForm = (form: string) => {
    const formColors = {
      'Tango': 'bg-red-500/20 text-red-300',
      'Vals': 'bg-blue-500/20 text-blue-300',
      'Milonga': 'bg-green-500/20 text-green-300',
      'Candombe': 'bg-purple-500/20 text-purple-300',
      'Other': 'bg-gray-500/20 text-gray-300'
    };
    
    const colorClass = formColors[form as keyof typeof formColors] || 'bg-gray-500/20 text-gray-300';
    
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${colorClass}`}>
        {form}
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border border-white/20 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{song.title}</h1>
            {song.originalTitle && song.originalTitle !== song.title && (
              <p className="text-white/70 mb-2">Original: {song.originalTitle}</p>
            )}
            {song.alternativeTitles && song.alternativeTitles.length > 0 && (
              <p className="text-white/60 text-sm">
                Also known as: {song.alternativeTitles.join(', ')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onEnhance && (
              <button 
                onClick={onEnhance}
                disabled={isEnhancing}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  isEnhancing
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                }`}
              >
                {isEnhancing ? '🤖 Enhancing...' : '🤖 Enhance with AI'}
              </button>
            )}
            {onClose && (
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Basic Info Tags */}
        <div className="flex flex-wrap gap-3 mt-4">
          {formatMusicalForm(song.musicalForm)}
          {formatPeriod(song.period)}
          {song.yearComposed && (
            <span className="px-2 py-1 bg-white/10 text-white/80 rounded-full text-sm">
              {song.yearComposed}
            </span>
          )}
          {song.recommendedForDancing && (
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              ♪ Dance Recommended
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Composer & Lyricist */}
        {renderSection(
          "Composers & Creators",
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-white/60 uppercase tracking-wide">Composer</div>
              <div className="text-white/90 font-medium">{song.composer}</div>
            </div>
            {song.lyricist && (
              <div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Lyricist</div>
                <div className="text-white/90 font-medium">{song.lyricist}</div>
              </div>
            )}
          </div>
        )}

        {/* Cultural Significance */}
        {renderSection(
          "Cultural Significance",
          <p className="text-white/80 leading-relaxed">{song.culturalSignificance}</p>,
          !!song.culturalSignificance
        )}

        {/* Historical Context */}
        {renderSection(
          "Historical Context",
          <p className="text-white/80 leading-relaxed">{song.historicalContext}</p>,
          !!song.historicalContext
        )}

        {/* Story */}
        {renderSection(
          "Story",
          <p className="text-white/80 leading-relaxed">{song.story}</p>,
          !!song.story
        )}

        {/* Musical Characteristics */}
        {renderSection(
          "Musical Characteristics",
          <div className="space-y-3">
            {song.musicalCharacteristics.length > 0 && (
              <div>
                <div className="text-sm text-white/60 uppercase tracking-wide mb-2">Style Features</div>
                <div className="flex flex-wrap gap-2">
                  {song.musicalCharacteristics.map((characteristic, index) => (
                    <span key={index} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                      {characteristic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(song.keySignature || song.tempo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {song.keySignature && (
                  <div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Key</div>
                    <div className="text-white/90">{song.keySignature}</div>
                  </div>
                )}
                {song.tempo && (
                  <div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Tempo</div>
                    <div className="text-white/90">{song.tempo}</div>
                  </div>
                )}
              </div>
            )}
          </div>,
          song.musicalCharacteristics.length > 0 || !!song.keySignature || !!song.tempo
        )}

        {/* Dance Style */}
        {renderSection(
          "Dance Style",
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {song.danceStyle.map((style, index) => (
                <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {style}
                </span>
              ))}
            </div>
            {song.danceRecommendations && (
              <p className="text-white/70 text-sm mt-2">{song.danceRecommendations}</p>
            )}
          </div>,
          song.danceStyle.length > 0 || !!song.danceRecommendations
        )}

        {/* Themes */}
        {renderSection(
          "Themes",
          <div className="flex flex-wrap gap-2">
            {song.themes.map((theme, index) => (
              <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {theme}
              </span>
            ))}
          </div>,
          song.themes.length > 0
        )}

        {/* Notable Recordings */}
        {renderSection(
          "Notable Recordings",
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {song.notableRecordings.map(renderRecording)}
          </div>,
          song.notableRecordings.length > 0
        )}

        {/* Notable Performers */}
        {renderSection(
          "Notable Performers",
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {song.notablePerformers.map(renderPerformer)}
          </div>,
          song.notablePerformers.length > 0
        )}

        {/* Inspiration */}
        {renderSection(
          "Inspiration",
          <p className="text-white/80 leading-relaxed">{song.inspiration}</p>,
          !!song.inspiration
        )}

        {/* Full Explanation */}
        {renderSection(
          "Overview",
          <div className="prose prose-invert">
            <p className="text-white/80 leading-relaxed whitespace-pre-line">{song.explanation}</p>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="border-t border-white/20 pt-4 text-xs text-white/50">
          <div className="flex justify-between items-center">
            <div>
              Searched {song.searchCount} times
              {song.averageRating > 0 && (
                <span className="ml-3">
                  Rating: {song.averageRating.toFixed(1)}/5 ({song.totalRatings} reviews)
                </span>
              )}
            </div>
            {song.metadata?.aiResponseQuality && (
              <div className={`px-2 py-1 rounded text-xs ${
                song.metadata.aiResponseQuality === 'excellent' ? 'bg-green-500/20 text-green-300' :
                song.metadata.aiResponseQuality === 'good' ? 'bg-blue-500/20 text-blue-300' :
                song.metadata.aiResponseQuality === 'partial' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {song.metadata.aiResponseQuality}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSongDetail;