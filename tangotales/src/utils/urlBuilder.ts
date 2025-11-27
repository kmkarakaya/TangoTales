/**
 * URL Builder for Grounding Results
 * 
 * Google's Gemini grounding API returns temporary redirect URLs that expire quickly.
 * The redirect URLs look like: https://vertexaisearch.cloud.google.com/grounding-api-redirect/TOKEN
 * 
 * These URLs are meant for immediate use in citations but DO NOT work for long-term storage.
 * 
 * Solution: Build real searchable URLs from the domain name + song title
 */

/**
 * Build a real searchable URL from domain and search context
 */
export function buildSearchableUrl(domain: string, songTitle: string, artistOrContext?: string): string {
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
  const searchTerm = artistOrContext 
    ? `${songTitle} ${artistOrContext}`.trim()
    : songTitle;
  
  const encodedSearch = encodeURIComponent(searchTerm);
  
  // Build appropriate search URL for each platform
  if (cleanDomain.includes('youtube.com')) {
    return `https://www.youtube.com/results?search_query=${encodedSearch}`;
  }
  
  if (cleanDomain.includes('spotify.com')) {
    return `https://open.spotify.com/search/${encodedSearch}`;
  }
  
  if (cleanDomain.includes('discogs.com')) {
    return `https://www.discogs.com/search/?q=${encodedSearch}&type=all`;
  }
  
  if (cleanDomain.includes('deezer.com')) {
    return `https://www.deezer.com/search/${encodedSearch}`;
  }
  
  if (cleanDomain.includes('apple.com') && cleanDomain.includes('music')) {
    return `https://music.apple.com/us/search?term=${encodedSearch}`;
  }
  
  if (cleanDomain.includes('soundcloud.com')) {
    return `https://soundcloud.com/search?q=${encodedSearch}`;
  }
  
  if (cleanDomain.includes('tango.info') || cleanDomain.includes('todotango')) {
    return `https://www.${cleanDomain}/search?q=${encodedSearch}`;
  }
  
  if (cleanDomain.includes('wikipedia.org')) {
    return `https://en.wikipedia.org/w/index.php?search=${encodedSearch}`;
  }
  
  // For unknown domains, build a Google search URL as fallback
  return `https://www.google.com/search?q=site:${cleanDomain}+${encodedSearch}`;
}

/**
 * Check if a URL is a Google grounding redirect URL
 */
export function isGoogleRedirectUrl(url: string): boolean {
  return url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect/');
}

/**
 * Extract domain from Google redirect URL title field
 * The title field in grounding chunks may contain page titles like:
 * - "youtube.com" (simple domain)
 * - "Carlos Gardel - La Cumparsita - YouTube" (page title with platform)
 * - "La Cumparsita | Spotify" (title with platform)
 */
export function extractDomainFromTitle(title: string | undefined): string | null {
  if (!title) return null;
  
  const lowerTitle = title.trim().toLowerCase();
  
  // Priority 1: Simple domain format (no spaces, has dot, no slashes)
  if (lowerTitle.includes('.') && !lowerTitle.includes(' ') && !lowerTitle.includes('/')) {
    return lowerTitle;
  }
  
  // Priority 2: Extract from page titles using comprehensive patterns
  const platformPatterns: Record<string, string[]> = {
    'youtube.com': ['youtube', 'youtu.be'],
    'open.spotify.com': ['open.spotify'],
    'spotify.com': ['spotify'],
    'discogs.com': ['discogs'],
    'deezer.com': ['deezer'],
    'music.apple.com': ['apple music', 'itunes'],
    'soundcloud.com': ['soundcloud'],
    'tango.info': ['tango.info', 'tangoinfo'],
    'todotango.com': ['todotango', 'todo tango'],
    'wikipedia.org': ['wikipedia'],
    'musicbrainz.org': ['musicbrainz', 'music brainz'],
    'allmusic.com': ['allmusic', 'all music']
  };
  
  for (const [domain, patterns] of Object.entries(platformPatterns)) {
    if (patterns.some(pattern => lowerTitle.includes(pattern))) {
      return domain;
    }
  }
  
  // Priority 3: Try to extract domain from URL-like strings in title
  const urlMatch = lowerTitle.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,})/i);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  console.warn(`⚠️ Could not extract domain from title: "${title}"`);
  return null;
}

/**
 * Replace Google redirect URLs with real searchable URLs
 * 
 * @param groundingSources - Sources extracted from grounding metadata
 * @param songTitle - Song title for context
 * @param artistOrContext - Optional artist name or additional context
 * @returns Updated sources with real URLs instead of redirect URLs
 */
export function replaceRedirectUrls(
  groundingSources: Array<{ url: string; title?: string; type: string; domain: string }>,
  songTitle: string,
  artistOrContext?: string
): Array<{ url: string; title?: string; type: string; domain: string }> {
  return groundingSources.map(source => {
    if (!isGoogleRedirectUrl(source.url)) {
      // Not a redirect URL, keep as-is
      return source;
    }
    
    console.warn(`⚠️ REDIRECT DETECTED: ${source.url.substring(0, 80)}...`);
    console.warn(`   Title: ${source.title}`);
    console.warn(`   Domain: ${source.domain}`);
    
    // Extract domain from title (Gemini puts domain name in title field)
    const domain = extractDomainFromTitle(source.title) || source.domain;
    
    if (!domain || domain === 'unknown' || domain.includes('vertexaisearch')) {
      console.error(`❌ FAILED TO EXTRACT DOMAIN - KEEPING ORIGINAL URL AS FALLBACK`);
      console.error(`   Title was: ${source.title}`);
      console.error(`   Fallback domain was: ${source.domain}`);
      console.error(`   Original URL: ${source.url.substring(0, 100)}...`);
      // Keep original redirect URL as fallback - validator will catch it later
      return source;
    }
    
    // Build a real searchable URL
    const realUrl = buildSearchableUrl(domain, songTitle, artistOrContext);
    
    console.log(`✅ REPLACED: ${domain} → ${realUrl}`);
    
    return {
      ...source,
      url: realUrl,
      domain: domain.replace(/^www\./, ''),
    };
  });
}

/**
 * Get platform-specific label for a URL
 */
export function getPlatformLabel(domain: string): string {
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
  
  if (cleanDomain.includes('youtube')) return 'YouTube';
  if (cleanDomain.includes('spotify')) return 'Spotify';
  if (cleanDomain.includes('discogs')) return 'Discogs';
  if (cleanDomain.includes('deezer')) return 'Deezer';
  if (cleanDomain.includes('apple') && cleanDomain.includes('music')) return 'Apple Music';
  if (cleanDomain.includes('soundcloud')) return 'SoundCloud';
  if (cleanDomain.includes('tango.info')) return 'Tango.info';
  if (cleanDomain.includes('todotango')) return 'Todo Tango';
  if (cleanDomain.includes('wikipedia')) return 'Wikipedia';
  if (cleanDomain.includes('musicbrainz')) return 'MusicBrainz';
  if (cleanDomain.includes('allmusic')) return 'AllMusic';
  
  // Return domain as-is if unknown
  return cleanDomain;
}
