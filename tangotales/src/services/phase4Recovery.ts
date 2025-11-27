export interface RecoveredLink {
  label: string;
  url: string;
  type: string;
}

/**
 * Conservative Phase 4 URL recovery and association.
 * - Extracts absolute http(s) URLs from raw LLM text
 * - Builds recovered link objects
 * - Attaches links to notableRecordings when safe (1:1 or fuzzy match by artist/album)
 * - Populates recordingSources/currentAvailability when appropriate
 */
export const recoverPhase4FromText = (rawText: string, recordingData: any): any => {
  if (!rawText || typeof rawText !== 'string') return recordingData;

  try {
    const urlRegex = /(https?:\/\/[^\s"'\],}]+)/g;
    const extractedUrls = rawText.match(urlRegex) || [];

    if (extractedUrls.length === 0) return recordingData;

    const streamingUrls = extractedUrls.filter((url: string) =>
      url.includes('spotify') || url.includes('apple') || url.includes('youtube') ||
      url.includes('amazon') || url.includes('bandcamp') || url.includes('soundcloud')
    );

    const researchUrls = extractedUrls.filter((url: string) =>
      url.includes('discogs') || url.includes('archive') || url.includes('library') ||
      url.includes('wikipedia') || url.includes('tango') || url.includes('music')
    );

    const recoveredLinks: RecoveredLink[] = extractedUrls.map((url: string) => ({
      label: url.split('/')[2] || 'Link',
      url,
      type: url.includes('spotify') || url.includes('apple') || url.includes('youtube') ? 'streaming_platform' :
            url.includes('discogs') ? 'discography' :
            url.includes('wikipedia') ? 'archive' :
            'other'
    }));

    if (streamingUrls.length > 0) {
      recordingData.currentAvailability = {
        streamingPlatforms: streamingUrls.map((url: string) => {
          if (url.includes('spotify')) return 'Spotify';
          if (url.includes('apple')) return 'Apple Music';
          if (url.includes('youtube')) return 'YouTube Music';
          if (url.includes('amazon')) return 'Amazon Music';
          return url.split('/')[2] || 'Unknown Platform';
        }),
        recentPerformances: null
      };
    }

    if (researchUrls.length > 0) {
      recordingData.recordingSources = researchUrls.map((url: string) => ({
        title: url.includes('todotango') ? 'Todo Tango' :
               url.includes('tango.info') ? 'Tango.info' :
               url.includes('wikipedia') ? 'Wikipedia' :
               url.includes('discogs') ? 'Discogs' :
               url.split('/')[2] || 'Music Database',
        url,
        type: url.includes('spotify') || url.includes('apple') || url.includes('youtube') ? 'streaming_platform' :
              url.includes('discogs') ? 'discography' :
              url.includes('wikipedia') ? 'encyclopedia' :
              'database',
        content: `Recovered link for notable recordings discovery.`
      }));
    }

    recordingData.recoveredLinks = recoveredLinks;

    // Attach to notableRecordings conservatively
    if (recordingData.notableRecordings && Array.isArray(recordingData.notableRecordings) && recordingData.notableRecordings.length > 0) {
      recordingData.notableRecordings.forEach((r: any) => { if (!r.links) r.links = []; });

      if (recoveredLinks.length === recordingData.notableRecordings.length) {
        recordingData.notableRecordings.forEach((r: any, idx: number) => {
          r.links = r.links.concat(recoveredLinks[idx] ? [recoveredLinks[idx]] : []);
        });
      } else {
        recordingData.notableRecordings.forEach((r: any) => {
          const artist = (r.artist || '').toString().toLowerCase();
          const album = (r.album || '').toString().toLowerCase();
          recoveredLinks.forEach((link: RecoveredLink) => {
            const urlLC = link.url.toLowerCase();
            if ((artist && urlLC.includes(artist.replace(/\s+/g, '-'))) ||
                (artist && urlLC.includes(artist.split(' ')[0])) ||
                (album && urlLC.includes(album.replace(/\s+/g, '-')))) {
              r.links.push(link);
            }
          });
        });
      }
    }

    return recordingData;
  } catch (err) {
    // On any error keep recordingData unchanged
    return recordingData;
  }
};
