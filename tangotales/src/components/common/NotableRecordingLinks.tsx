import React from 'react';
import { NotableRecordingLink } from '../../types/song';

type Props = {
  links: NotableRecordingLink[];
  songId?: string;
  recordingIndex?: number;
};

const inferProvider = (url: string, label?: string) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    // Direct URL detection
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('spotify.com') || hostname.includes('open.spotify.com')) return 'Spotify';
    if (hostname.includes('archive.org')) return 'Archive.org';
    if (hostname.includes('soundcloud.com')) return 'SoundCloud';
    if (hostname.includes('apple.com')) return 'Apple Music';
    if (hostname.includes('discogs.com')) return 'Discogs';
    if (hostname.includes('wikipedia.org')) return 'Wikipedia';
    if (hostname.includes('tango.info')) return 'Tango.info';
    if (hostname.includes('todotango.com')) return 'Todo Tango';
    if (hostname.includes('secondhandsongs.com')) return 'SecondHandSongs';
    
    // Fallback: Use label for provider detection if hostname doesn't match
    if (label) {
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('youtube')) return 'YouTube';
      if (lowerLabel.includes('spotify')) return 'Spotify';
      if (lowerLabel.includes('apple')) return 'Apple Music';
      if (lowerLabel.includes('soundcloud')) return 'SoundCloud';
      if (lowerLabel.includes('discogs')) return 'Discogs';
      if (lowerLabel.includes('wikipedia')) return 'Wikipedia';
      if (lowerLabel.includes('tango.info')) return 'Tango.info';
      if (lowerLabel.includes('todotango')) return 'Todo Tango';
    }
    
    return 'Link';
  } catch (e) {
    return 'Link';
  }
};

const getProviderColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'youtube':
      return 'bg-red-600/20 text-red-300 border-red-500/30';
    case 'spotify':
      return 'bg-green-600/20 text-green-300 border-green-500/30';
    case 'apple music':
      return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
    case 'soundcloud':
      return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
    case 'archive.org':
      return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    case 'discogs':
      return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
    case 'wikipedia':
      return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
    case 'tango.info':
    case 'todo tango':
    case 'tangodc':
      return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
    case 'secondhandsongs':
      return 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30';
    default:
      return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  }
};

const NotableRecordingLinks: React.FC<Props> = ({ links, songId, recordingIndex }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2">
      {links.map((link, i) => {
        const url = (link.url || '').trim();
        // Smart provider detection: prefer inferring from URL+label, but use type if it's meaningful
        const inferredProvider = inferProvider(url, link.label);
        const provider = inferredProvider !== 'Link' ? inferredProvider : (link.type && link.type !== 'other' ? link.type : 'Link');
        const providerColors = getProviderColor(provider);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${provider} recording`}
            aria-label={`Open ${provider} recording in new tab`}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 hover:shadow-sm ${providerColors}`}
          >
            {provider}
          </a>
        );
      })}
    </div>
  );
};

export default NotableRecordingLinks;
