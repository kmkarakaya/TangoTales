/**
 * Metadata Matching Utility
 * 
 * Compares landing page content (title, snippet) to expected metadata
 * to verify that the link content matches what's displayed to users.
 */

export interface MetadataTokens {
  artist?: string;
  orchestra?: string;
  title?: string;
  album?: string;
  year?: string | number;
  composer?: string;
  lyricist?: string;
}

export interface MatchResult {
  isVerified: boolean;
  matchedTokens: string[];
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
}

/**
 * Normalize text for comparison (lowercase, remove punctuation, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract tokens from metadata
 */
function extractTokens(metadata: MetadataTokens): string[] {
  const tokens: string[] = [];
  
  if (metadata.artist) tokens.push(normalizeText(metadata.artist));
  if (metadata.orchestra) tokens.push(normalizeText(metadata.orchestra));
  if (metadata.title) tokens.push(normalizeText(metadata.title));
  if (metadata.album) tokens.push(normalizeText(metadata.album));
  if (metadata.composer) tokens.push(normalizeText(metadata.composer));
  if (metadata.lyricist) tokens.push(normalizeText(metadata.lyricist));
  if (metadata.year) tokens.push(String(metadata.year));
  
  return tokens.filter(Boolean);
}

/**
 * Check if a token matches in the text (handles partial matches)
 */
function tokenMatches(token: string, text: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedToken = normalizeText(token);
  
  // Check for exact match
  if (normalizedText.includes(normalizedToken)) {
    return true;
  }
  
  // Check for word-by-word match for multi-word tokens
  const tokenWords = normalizedToken.split(' ');
  if (tokenWords.length > 1) {
    // At least 2/3 of words should match for multi-word tokens
    const matchedWords = tokenWords.filter(word => 
      word.length > 2 && normalizedText.includes(word)
    );
    return matchedWords.length >= Math.ceil(tokenWords.length * 0.66);
  }
  
  return false;
}

/**
 * Match landing page content to expected metadata
 * 
 * @param landingPageTitle - Title extracted from the landing page
 * @param landingPageSnippet - Text snippet extracted from landing page
 * @param expectedMetadata - Expected metadata tokens to match
 * @returns Match result with verification status and confidence
 */
export function matchMetadata(
  landingPageTitle: string | undefined,
  landingPageSnippet: string | undefined,
  expectedMetadata: MetadataTokens
): MatchResult {
  const tokens = extractTokens(expectedMetadata);
  const matchedTokens: string[] = [];
  
  if (!landingPageTitle && !landingPageSnippet) {
    return {
      isVerified: false,
      matchedTokens: [],
      confidence: 'low',
      reason: 'No content extracted from landing page',
    };
  }
  
  const combinedContent = `${landingPageTitle || ''} ${landingPageSnippet || ''}`;
  
  // Strong matches (artist, orchestra, title, composer)
  const strongTokens = [
    expectedMetadata.artist,
    expectedMetadata.orchestra,
    expectedMetadata.title,
    expectedMetadata.composer,
  ].filter(Boolean);
  
  const strongMatches = strongTokens.filter(token => 
    token && tokenMatches(token, combinedContent)
  ) as string[];
  
  if (strongMatches.length > 0) {
    matchedTokens.push(...strongMatches);
  }
  
  // Weak matches (album, year, lyricist)
  const weakTokens = [
    expectedMetadata.album,
    expectedMetadata.year ? String(expectedMetadata.year) : undefined,
    expectedMetadata.lyricist,
  ].filter(Boolean);
  
  const weakMatches = weakTokens.filter(token => 
    token && tokenMatches(token, combinedContent)
  ) as string[];
  
  if (weakMatches.length > 0) {
    matchedTokens.push(...weakMatches);
  }
  
  // Determine verification status and confidence
  if (strongMatches.length >= 2) {
    return {
      isVerified: true,
      matchedTokens,
      confidence: 'high',
    };
  }
  
  if (strongMatches.length === 1 && weakMatches.length >= 1) {
    return {
      isVerified: true,
      matchedTokens,
      confidence: 'medium',
    };
  }
  
  if (strongMatches.length === 1) {
    return {
      isVerified: true,
      matchedTokens,
      confidence: 'medium',
    };
  }
  
  if (weakMatches.length >= 2) {
    return {
      isVerified: false,
      matchedTokens,
      confidence: 'low',
      reason: 'Only weak token matches (album/year); no strong matches found',
    };
  }
  
  return {
    isVerified: false,
    matchedTokens,
    confidence: 'low',
    reason: 'No significant token matches found',
  };
}

/**
 * Helper to create metadata tokens from common data structures
 */
export function createMetadataTokens(data: {
  artist?: string;
  orchestra?: string;
  title?: string;
  album?: string;
  year?: string | number;
  composer?: string;
  lyricist?: string;
  performer?: string;
}): MetadataTokens {
  return {
    artist: data.artist || data.performer,
    orchestra: data.orchestra,
    title: data.title,
    album: data.album,
    year: data.year,
    composer: data.composer,
    lyricist: data.lyricist,
  };
}
