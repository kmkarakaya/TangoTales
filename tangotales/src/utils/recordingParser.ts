/**
 * Utility for parsing recording metadata from grounding chunk titles
 * 
 * Grounding titles from music services typically contain:
 * - Artist/Orchestra name
 * - Song title
 * - Album name
 * - Year
 * - Platform info (YouTube, Spotify, etc.)
 * 
 * Examples:
 * - "La Cumparsita - Carlos Gardel (1924) - YouTube"
 * - "Juan D'Arienzo - La Cumparsita [1937] | Spotify"
 * - "Osvaldo Pugliese Orchestra - La Cumparsita (1959)"
 */

export interface RecordingMetadata {
  artist: string;
  year?: number;
  album?: string;
  style?: string;
  platform?: string;
  rawTitle: string;
}

/**
 * Extract year from text (4-digit number, typically in parentheses or brackets)
 */
function extractYear(text: string): number | undefined {
  // eslint-disable-next-line no-useless-escape
  const yearMatch = text.match(/[([(\[]?(\d{4})[)\]]?/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    // Reasonable range for tango recordings
    if (year >= 1900 && year <= new Date().getFullYear()) {
      return year;
    }
  }
  return undefined;
}

/**
 * Extract platform name from title or domain
 */
function extractPlatform(text: string, url: string): string | undefined {
  const platforms = ['YouTube', 'Spotify', 'Deezer', 'Apple Music', 'SoundCloud', 'Discogs', 'Tango.info'];
  
  for (const platform of platforms) {
    if (text.toLowerCase().includes(platform.toLowerCase()) || 
        url.toLowerCase().includes(platform.toLowerCase())) {
      return platform;
    }
  }
  
  return undefined;
}

/**
 * Extract album name (typically in quotes or after "Album:")
 */
function extractAlbum(text: string): string | undefined {
  // Pattern: Album: Name or "Album Name"
  const albumMatch = text.match(/Album:\s*([^|\-(]+)|["']([^"']+)["']/i);
  if (albumMatch) {
    return (albumMatch[1] || albumMatch[2]).trim();
  }
  return undefined;
}

/**
 * Clean artist name by removing common noise
 */
function cleanArtistName(name: string): string {
  return name
    .replace(/\s*[-–—]\s*(Official|Video|Audio|Topic|VEVO).*$/i, '')
    // eslint-disable-next-line no-useless-escape
    .replace(/\s*[([\[].*?[)\]]/g, '') // Remove parentheses/brackets
    .replace(/\s*[-–—]\s*YouTube.*$/i, '')
    .replace(/\s*[-–—]\s*Spotify.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse recording metadata from a grounding chunk title
 * 
 * Common patterns:
 * 1. "Artist - Song Title (Year)" 
 * 2. "Song Title - Artist [Year]"
 * 3. "Artist: Song Title | Platform"
 * 4. "Song Title by Artist (Year)"
 * 
 * @param title - The grounding chunk title
 * @param url - The URL (helps identify platform)
 * @param songTitle - The expected song title (for validation)
 * @returns Parsed recording metadata
 */
export function parseRecordingMetadata(
  title: string,
  url: string,
  songTitle: string
): RecordingMetadata | null {
  if (!title) {
    return null;
  }

  const year = extractYear(title);
  const platform = extractPlatform(title, url);
  const album = extractAlbum(title);
  
  // Remove year, album, platform info from title to isolate artist
  let cleanTitle = title
    // eslint-disable-next-line no-useless-escape
    .replace(/[([\[]?\d{4}[)\]]?/g, '') // Remove year
    .replace(/Album:\s*[^|\-(]+/gi, '') // Remove "Album: Name"
    .replace(/["'][^"']+["']/g, '') // Remove quoted text
    .replace(/[-–—]\s*(YouTube|Spotify|Deezer|Apple Music|SoundCloud|Discogs|Official|Video|Audio|Topic|VEVO).*/gi, '') // Remove platform suffix
    .replace(/\s*[|\-–—]\s*$/g, '') // Remove trailing separators
    .trim();

  // Try to extract artist name
  let artist = '';
  
  // Pattern 1: "Artist - Song" or "Song - Artist"
  const dashParts = cleanTitle.split(/\s*[-–—]\s+/);
  if (dashParts.length >= 2) {
    // Check which part is more likely the artist (usually longer and contains "Orchestra", "y su", etc.)
    const firstPart = dashParts[0].trim();
    const secondPart = dashParts[1].trim();
    
    const firstIsArtist = ((firstPart.toLowerCase().includes('orchestra') || 
                          firstPart.toLowerCase().includes('orquesta') ||
                          firstPart.toLowerCase().includes('y su') ||
                          firstPart.toLowerCase().includes('quinteto') ||
                          firstPart.toLowerCase().includes('sexteto')) ||
                          !secondPart.toLowerCase().includes(songTitle.toLowerCase().substring(0, 8)));
    
    artist = firstIsArtist ? firstPart : secondPart;
  } else {
    // No dash separator, use the whole title
    artist = cleanTitle;
  }
  
  artist = cleanArtistName(artist);
  
  // If artist is empty or too short, return null
  if (!artist || artist.length < 3) {
    return null;
  }
  
  // Detect style from artist name
  let style: string | undefined;
  const lowerArtist = artist.toLowerCase();
  if (lowerArtist.includes('traditional') || (year && year < 1930)) {
    style = 'Traditional';
  } else if (lowerArtist.includes('nuevo') || lowerArtist.includes('piazzolla')) {
    style = 'Nuevo Tango';
  } else if (year && year >= 1930 && year <= 1955) {
    style = 'Golden Age';
  } else if (year && year > 1990) {
    style = 'Modern';
  }

  return {
    artist,
    year,
    album,
    style,
    platform,
    rawTitle: title,
  };
}

/**
 * Parse multiple grounding sources and group by artist
 * 
 * @param sources - Array of grounding sources with titles and URLs
 * @param songTitle - The song title for context
 * @returns Map of artist to their recordings
 */
export function groupRecordingsByArtist(
  sources: Array<{ url: string; title?: string; type: string; domain: string }>,
  songTitle: string
): Map<string, Array<{ url: string; metadata: RecordingMetadata }>> {
  const recordings = new Map<string, Array<{ url: string; metadata: RecordingMetadata }>>();
  
  for (const source of sources) {
    if (!source.title) continue;
    
    const metadata = parseRecordingMetadata(source.title, source.url, songTitle);
    if (!metadata) continue;
    
    // Group by artist
    if (!recordings.has(metadata.artist)) {
      recordings.set(metadata.artist, []);
    }
    
    recordings.get(metadata.artist)!.push({
      url: source.url,
      metadata,
    });
  }
  
  return recordings;
}

/**
 * Create notable recording entry from parsed metadata
 */
export function createNotableRecording(
  metadata: RecordingMetadata,
  urls: Array<{ url: string; type: string; domain: string }>
): any {
  return {
    artist: metadata.artist,
    year: metadata.year,
    album: metadata.album,
    style: metadata.style || 'Traditional',
    availability: 'Available',
    links: urls.map(urlData => ({
      label: urlData.domain.replace(/^www\./, ''),
      url: urlData.url,
      type: urlData.type,
    })),
  };
}
