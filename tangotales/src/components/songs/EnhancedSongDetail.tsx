import React from 'react';
import { Song, Performer } from '../../types/song';
import NotableRecordingLinks from '../common/NotableRecordingLinks';

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

  // Normalize notable recordings shape: accept either { recordings: [...] } or plain array
  const notableRecordingsList: any[] = Array.isArray((song as any).notableRecordings)
    ? (song as any).notableRecordings
    : (song as any).notableRecordings?.recordings || [];



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

        {/* Notable Recordings */}
        {renderSection(
          "Notable Recordings",
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notableRecordingsList.length > 0 ? (
              notableRecordingsList.map((recording: any, index: number) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-medium text-white/90">{recording.artist}</div>
                  {recording.year && (
                    <div className="text-sm text-white/70">Year: {recording.year}</div>
                  )}
                  {recording.album && (
                    <div className="text-sm text-white/70">Album: {recording.album}</div>
                  )}
                  {recording.style && (
                    <div className="text-sm text-white/60">Style: {recording.style}</div>
                  )}
                  {recording.availability && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className={`text-sm ${
                        recording.availability === 'currently_available' 
                          ? 'text-green-400' 
                          : recording.availability === 'historical' 
                          ? 'text-amber-400' 
                          : 'text-white/60'
                      }`}>
                        {recording.availability === 'currently_available' ? '✅ Available' : 
                         recording.availability === 'historical' ? '📜 Historical' : 
                         recording.availability}
                      </div>
                      {/* Render links adjacent to availability */}
                      {recording.links && recording.links.length > 0 && (
                        <div className="ml-3">
                          <NotableRecordingLinks links={recording.links} songId={(song as any).id} recordingIndex={index} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-white/60 italic">No notable recordings available yet.</div>
            )}
          </div>,
          notableRecordingsList.length > 0
        )}

        {/* Full Explanation */}
        {renderSection(
          "Overview",
          <div className="prose prose-invert">
            <p className="text-white/80 leading-relaxed whitespace-pre-line">{song.explanation}</p>
          </div>
        )}

        {/* Current Availability & Streaming */}
        {renderSection(
          "Listen Now",
          <div className="space-y-4">
            {/* Streaming Platforms */}
            {(song.currentAvailability as any)?.streamingPlatforms?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🎵 Streaming Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {(song.currentAvailability as any).streamingPlatforms.map((platform: string, index: number) => {
                    // Generate search URLs for each platform
                    const searchQuery = encodeURIComponent(`${song.title} tango`);
                    const getSearchUrl = (platformName: string) => {
                      switch (platformName.toLowerCase()) {
                        case 'spotify':
                          return `https://open.spotify.com/search/${searchQuery}`;
                        case 'apple music':
                          return `https://music.apple.com/search?term=${searchQuery}`;
                        case 'youtube':
                        case 'youtube music':
                          return `https://www.youtube.com/results?search_query=${searchQuery}`;
                        case 'amazon music':
                          return `https://music.amazon.com/search/${searchQuery}`;
                        default:
                          return `https://www.google.com/search?q=${searchQuery}+${encodeURIComponent(platformName)}`;
                      }
                    };

                    return (
                      <a
                        key={index}
                        href={getSearchUrl(platform)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 hover:bg-green-500/30 hover:text-green-300 transition-colors cursor-pointer"
                        title={`Search for "${song.title}" on ${platform}`}
                      >
                        {platform}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Purchase Links */}
            {(song.currentAvailability as any)?.purchaseLinks?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">💰 Purchase Options</h4>
                <div className="flex flex-wrap gap-2">
                  {(song.currentAvailability as any).purchaseLinks.map((link: string, index: number) => {
                    // Check if it's already a URL or just a platform name
                    const isUrl = link.startsWith('http');
                    const href = isUrl ? link : `https://www.google.com/search?q=${encodeURIComponent(`${song.title} tango buy ${link}`)}`;
                    const displayText = isUrl ? new URL(link).hostname.replace('www.', '') : link;
                    
                    return (
                      <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300 transition-colors cursor-pointer"
                        title={isUrl ? `Visit ${displayText}` : `Search to buy "${song.title}" on ${link}`}
                      >
                        {displayText}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Free Resources */}
            {(song.currentAvailability as any)?.freeResources?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🆓 Free Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {(song.currentAvailability as any).freeResources.map((resource: string, index: number) => {
                    // Check if it's already a URL or just a platform name
                    const isUrl = resource.startsWith('http');
                    const href = isUrl ? resource : `https://www.google.com/search?q=${encodeURIComponent(`${song.title} tango free ${resource}`)}`;
                    const displayText = isUrl ? new URL(resource).hostname.replace('www.', '') : resource;
                    
                    return (
                      <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300 transition-colors cursor-pointer"
                        title={isUrl ? `Visit ${displayText}` : `Search for free "${song.title}" on ${resource}`}
                      >
                        {displayText}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Performances */}
            {(song.currentAvailability as any)?.recentPerformances && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🎭 Recent Performances</h4>
                <div className="space-y-1">
                  {Array.isArray((song.currentAvailability as any).recentPerformances) ? (
                    (song.currentAvailability as any).recentPerformances.map((performance: string, index: number) => {
                      // Extract venue and date if available, create searchable link
                      const searchQuery = encodeURIComponent(`"${song.title}" tango performance ${performance}`);
                      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                      
                      return (
                        <div key={index} className="text-sm text-white/70 bg-white/5 rounded px-3 py-2 hover:bg-white/10 transition-colors">
                          <a 
                            href={searchUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between group"
                          >
                            <span>{performance}</span>
                            <span className="text-white/40 group-hover:text-white/60 transition-colors ml-2">
                              🔍
                            </span>
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-white/70 bg-white/5 rounded px-3 py-2 hover:bg-white/10 transition-colors">
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(`"${song.title}" tango performance ${(song.currentAvailability as any).recentPerformances}`)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between group"
                      >
                        <span>{(song.currentAvailability as any).recentPerformances}</span>
                        <span className="text-white/40 group-hover:text-white/60 transition-colors ml-2">
                          🔍
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show message if no availability data */}
            {!(song.currentAvailability as any)?.streamingPlatforms?.length && 
             !(song.currentAvailability as any)?.purchaseLinks?.length && 
             !(song.currentAvailability as any)?.freeResources?.length && 
             !(song.currentAvailability as any)?.recentPerformances && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400">🔍</span>
                  <span className="font-medium text-amber-300">Streaming & Availability Research Needed</span>
                </div>
                <p className="text-sm text-white/70">
                  Click "🤖 Enhance with AI" above to research current streaming platforms, purchase links, and availability for this song.
                </p>
              </div>
            )}
          </div>,
          true // Always show Listen Now section
        )}

        {/* Research Sources & URLs */}
        {renderSection(
          "Research Sources",
          <div className="space-y-4">
            {/* Alternative Spellings/Titles */}
            {(song as any).alternativeSpellings?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">📝 Alternative Spellings</h4>
                <div className="flex flex-wrap gap-2">
                  {(song as any).alternativeSpellings.map((spelling: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                      {spelling}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 1: Basic Information Sources */}
            {(song as any).basicInfoSources?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">📚 Historical & Biographical Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {(song as any).basicInfoSources.map((source: any, index: number) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300 transition-colors cursor-pointer"
                      title={source.content || `Visit ${source.title} - ${source.url}`}
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 2: Cultural Sources */}
            {(song as any).culturalSources?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🏛️ Cultural & Historical Context Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {(song as any).culturalSources.map((source: any, index: number) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300 transition-colors cursor-pointer"
                      title={source.content || `Visit ${source.title} - ${source.url}`}
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 4: Recording Sources with URLs */}
            {(song as any).recordingSources?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🎵 Recording & Streaming Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {(song as any).recordingSources.map((source: any, index: number) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm border border-gray-500/30 hover:bg-gray-500/30 hover:text-gray-300 transition-colors cursor-pointer"
                      title={source.content || `Visit ${source.title} - ${source.url}`}
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* All Search Findings with Confidence */}
            {(song as any).allSearchFindings?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">🔍 Research Findings</h4>
                <div className="space-y-3">
                  {(song as any).allSearchFindings.map((finding: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white/90">Phase: {finding.phase}</div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          finding.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                          finding.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {finding.confidence} confidence
                        </div>
                      </div>
                      <div className="text-sm text-white/70 mb-2">Query: "{finding.query}"</div>
                      <div className="text-sm text-white/80 mb-2">{finding.findings}</div>
                      {finding.sources?.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-white/60">Sources:</div>
                          {finding.sources.map((source: any, srcIndex: number) => (
                            <div key={srcIndex} className="text-xs text-white/60 pl-2">
                              • {source.title}: {source.snippet}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no research data */}
            {!(song as any).alternativeSpellings?.length && 
             !(song as any).basicInfoSources?.length &&
             !(song as any).culturalSources?.length &&
             !(song as any).recordingSources?.length && 
             !(song as any).allSearchFindings?.length && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400">📚</span>
                  <span className="font-medium text-blue-300">Research Sources & URLs Available Soon</span>
                </div>
                <p className="text-sm text-white/70">
                  Enhanced AI research will populate this section with alternative song titles, recording sources, and comprehensive research findings.
                </p>
              </div>
            )}
          </div>,
          true // Always show Research Sources section
        )}

        {/* AI Disclosure */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm">
          <div className="flex items-start space-x-2">
            <div className="text-amber-400 text-lg mt-0.5">🤖</div>
            <div className="text-amber-200">
              <div className="font-medium mb-1">AI-Generated Content</div>
              <div className="text-amber-300/80 text-xs leading-relaxed">
                This song information has been researched and generated using AI technology and web search results. 
                While we strive for accuracy, some details may be incomplete or require verification. 
                We encourage cross-referencing with the provided research sources for scholarly or professional use.
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="border-t border-white/20 pt-4 text-xs text-white/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div>
                Searched {song.searchCount} times
                {song.averageRating > 0 && (
                  <span className="ml-3">
                    Rating: {song.averageRating.toFixed(1)}/5 ({song.totalRatings} reviews)
                  </span>
                )}
              </div>
              {song.lastUpdated && (
                <div className="text-white/40">
                  Last Update: {new Date(song.lastUpdated).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
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