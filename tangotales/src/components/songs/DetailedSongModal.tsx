import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../../types/song';
import ConfidenceBadge from '../common/ConfidenceBadge';
import SearchSourceCard from '../research/SearchSourceCard';
import { useRouteChangeEffect } from '../../hooks/useRouteChangeEffect';

interface DetailedSongModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

interface TabInfo {
  id: string;
  label: string;
  icon: string;
}

const DetailedSongModal: React.FC<DetailedSongModalProps> = ({ song, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const modalContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-close modal when navigating to a different route
  useRouteChangeEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [isOpen]);

  // Handle ESC key press and body scroll locking
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      
      // Store original body overflow and prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscKey);
        // Restore original overflow value
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  // Reset scroll position when modal opens
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click on backdrop/overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tabs: TabInfo[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'cultural', label: 'Cultural Context', icon: '🏛️' },
    { id: 'musical', label: 'Musical Analysis', icon: '🎵' },
    { id: 'recordings', label: 'Notable Recordings', icon: '🎼' },
    { id: 'availability', label: 'Listen Now', icon: '🎧' },
    { id: 'research', label: 'Research Sources', icon: '🔍' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Title Validation Status */}
      {song.titleValidation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Title Validation</h3>
            <ConfidenceBadge confidence={song.titleValidation.confidence} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700 dark:text-blue-300">Verified:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {song.titleValidation.isValid ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            {song.titleValidation.alternativeTitles && song.titleValidation.alternativeTitles.length > 0 && (
              <div>
                <span className="font-medium text-blue-700 dark:text-blue-300">Alternative Names:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {song.titleValidation.alternativeTitles.map((alt, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Composers */}
          {((song.basicInfo?.composers && song.basicInfo.composers.length > 0) || song.composer) && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Composers:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {song.basicInfo?.composers?.join(', ') || song.composer}
              </span>
            </div>
          )}

          {/* Lyricists */}
          {((song.basicInfo?.lyricists && song.basicInfo.lyricists.length > 0) || song.lyricist) && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Lyricists:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {song.basicInfo?.lyricists?.join(', ') || song.lyricist}
              </span>
            </div>
          )}

          {/* Year Composed */}
          {(song.basicInfo?.yearComposed || song.yearComposed) && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Year Composed:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {song.basicInfo?.yearComposed || song.yearComposed}
              </span>
            </div>
          )}

          {/* Period */}
          {(song.basicInfo?.period || song.period) && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Period:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {song.basicInfo?.period || song.period}
              </span>
            </div>
          )}

          {/* Musical Form */}
          {song.musicalForm && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Musical Form:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{song.musicalForm}</span>
            </div>
          )}

          {/* Original Key */}
          {song.basicInfo?.originalKey && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Original Key:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{song.basicInfo.originalKey}</span>
            </div>
          )}
        </div>
      </div>

      {/* Themes */}
      {song.themes && song.themes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Themes</h3>
          <div className="flex flex-wrap gap-2">
            {song.themes.map((theme, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dance Information */}
      {(song.recommendedForDancing !== undefined || song.danceStyle?.length || song.danceRecommendations) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Dance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {song.recommendedForDancing !== undefined && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Recommended for Dancing:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {song.recommendedForDancing ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            )}
            {song.danceStyle && song.danceStyle.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Dance Styles:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {song.danceStyle.map((style, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {song.danceRecommendations && (
            <div className="mt-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">Dance Recommendations:</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{song.danceRecommendations}</p>
            </div>
          )}
        </div>
      )}

      {/* Story and Inspiration */}
      {(song.story || song.inspiration) && (
        <div className="space-y-4">
          {song.story && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Story</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.story}</p>
            </div>
          )}
          {song.inspiration && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Inspiration</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.inspiration}</p>
            </div>
          )}
        </div>
      )}

      {/* Title Validation */}
      {song.titleValidation && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Title Validation</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Validated:</span>
              <span className="ml-2">{song.titleValidation.isValid ? '✅ Yes' : '❌ No'}</span>
              <ConfidenceBadge confidence={song.titleValidation.confidence} className="ml-2" />
            </div>
            {song.titleValidation.alternativeTitles && song.titleValidation.alternativeTitles.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Alternative Titles:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{song.titleValidation.alternativeTitles.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Explanation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Overview</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.explanation}</p>
      </div>
    </div>
  );

  const renderCulturalTab = () => (
    <div className="space-y-6">
      {song.culturalContext ? (
        <>
          {song.culturalContext.historicalContext && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Historical Context</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.culturalContext.historicalContext}</p>
            </div>
          )}
          {song.culturalContext.culturalSignificance && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Cultural Significance</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.culturalContext.culturalSignificance}</p>
            </div>
          )}
          {song.culturalContext.socialContext && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Social Context</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.culturalContext.socialContext}</p>
            </div>
          )}
          {song.culturalContext.geographicalOrigins && song.culturalContext.geographicalOrigins.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Geographical Origins</h3>
              <div className="flex flex-wrap gap-2">
                {song.culturalContext.geographicalOrigins.map((origin, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {origin}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Cultural context information not yet available.</p>
          <p className="text-sm mt-2">This data will be added when the song is researched with our AI system.</p>
        </div>
      )}
    </div>
  );

  const renderMusicalTab = () => (
    <div className="space-y-6">
      {song.musicalAnalysis ? (
        <>
          {song.musicalAnalysis.musicalForm && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Musical Form</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.musicalAnalysis.musicalForm}</p>
            </div>
          )}
          {song.musicalAnalysis.rhythmicCharacteristics && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Rhythmic Characteristics</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.musicalAnalysis.rhythmicCharacteristics}</p>
            </div>
          )}
          {song.musicalAnalysis.harmonicStructure && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Harmonic Structure</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.musicalAnalysis.harmonicStructure}</p>
            </div>
          )}
          {song.musicalAnalysis.melodicFeatures && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Melodic Features</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.musicalAnalysis.melodicFeatures}</p>
            </div>
          )}
          {song.musicalAnalysis.instrumentationNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Instrumentation Notes</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{song.musicalAnalysis.instrumentationNotes}</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Musical analysis not yet available.</p>
          <p className="text-sm mt-2">This data will be added when the song is researched with our AI system.</p>
        </div>
      )}
    </div>
  );

  const renderRecordingsTab = () => (
    <div className="space-y-6">
      {song.notableRecordings?.recordings && song.notableRecordings.recordings.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Notable Recordings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {song.notableRecordings.recordings.map((recording, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">{recording.artist}</div>
                {recording.year && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">{recording.year}</div>
                )}
                {recording.label && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">{recording.label}</div>
                )}
                {recording.significance && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{recording.significance}</div>
                )}
                {recording.availability && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">{recording.availability}</div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Notable recordings information not yet available.</p>
          <p className="text-sm mt-2">This data will be added when the song is researched with our AI system.</p>
        </div>
      )}
    </div>
  );

  const renderAvailabilityTab = () => (
    <div className="space-y-6">
      {song.currentAvailability ? (
        <>
          {song.currentAvailability.streamingPlatforms && song.currentAvailability.streamingPlatforms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Streaming Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {song.currentAvailability.streamingPlatforms.map((platform, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}
          {song.currentAvailability.purchaseLinks && song.currentAvailability.purchaseLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Purchase Links</h3>
              <div className="flex flex-wrap gap-2">
                {song.currentAvailability.purchaseLinks.map((link, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {link}
                  </span>
                ))}
              </div>
            </div>
          )}
          {song.currentAvailability.freeResources && song.currentAvailability.freeResources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Free Resources</h3>
              <div className="flex flex-wrap gap-2">
                {song.currentAvailability.freeResources.map((resource, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Availability information not yet available.</p>
          <p className="text-sm mt-2">This data will be added when the song is researched with our AI system.</p>
        </div>
      )}
    </div>
  );

  const renderResearchTab = () => (
    <div className="space-y-6">
      {song.allSearchFindings && song.allSearchFindings.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Research Sources</h3>
          <div className="space-y-4">
            {song.allSearchFindings.map((finding, index) => (
              <div key={index}>
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Phase: {finding.phase}</h4>
                  <ConfidenceBadge confidence={finding.confidence} className="ml-2" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Query: "{finding.query}"</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{finding.findings}</p>
                <div className="space-y-2">
                  {finding.sources.map((source, sourceIndex) => (
                    <SearchSourceCard key={sourceIndex} source={source} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Research Metadata */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Research Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {song.researchCompleted ? '✅ Complete' : '⏳ In Progress'}
                </span>
              </div>
              {song.researchPhases && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Phases Completed:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{song.researchPhases.length}</span>
                </div>
              )}
              {song.lastResearchUpdate && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {song.lastResearchUpdate.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Research sources not yet available.</p>
          <p className="text-sm mt-2">This data will be added when the song is researched with our AI system.</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'cultural':
        return renderCulturalTab();
      case 'musical':
        return renderMusicalTab();
      case 'recordings':
        return renderRecordingsTab();
      case 'availability':
        return renderAvailabilityTab();
      case 'research':
        return renderResearchTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{song.title}</h2>
            {song.composer && (
              <p className="text-gray-600 dark:text-gray-400">by {song.composer}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DetailedSongModal;