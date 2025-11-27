/**
 * Utility for extracting real URLs from Gemini API Google Search grounding metadata
 * 
 * According to Google's documentation:
 * - URLs are NOT in response.text (those are AI-generated and often fake)
 * - Real search results are in response.candidates[0].groundingMetadata.groundingChunks[]
 * - Each chunk has web.uri (the actual URL) and web.title (page title)
 */

import { isValidUrlFormat, categorizeUrl } from './urlValidator';

export interface GroundingSource {
  url: string;
  title?: string;
  type: 'streaming_platform' | 'discography' | 'archive' | 'music_database' | 'encyclopedia' | 'other';
  domain: string;
}

/**
 * Extract real URLs from Gemini API response grounding metadata
 * 
 * @param response - The complete Gemini API response object
 * @returns Array of grounding sources with URLs, titles, and types
 */
export function extractGroundingUrls(response: any): GroundingSource[] {
  const sources: GroundingSource[] = [];
  
  try {
    // Check if response has candidates
    if (!response.candidates || !Array.isArray(response.candidates) || response.candidates.length === 0) {
      console.log('⚠️ GROUNDING - No candidates in response');
      return sources;
    }
    
    const firstCandidate = response.candidates[0];
    
    // Try both snake_case and camelCase (API can return either)
    const groundingMetadata = firstCandidate?.grounding_metadata || firstCandidate?.groundingMetadata;
    
    if (!groundingMetadata) {
      console.log('⚠️ GROUNDING - No grounding metadata found');
      return sources;
    }
    
    // Extract search queries used (useful for debugging)
    const searchQueries = groundingMetadata.web_search_queries || groundingMetadata.webSearchQueries || [];
    if (searchQueries.length > 0) {
      console.log(`🔍 GROUNDING - Search queries used: ${searchQueries.join(', ')}`);
    }
    
    // Extract grounding chunks (the actual search results)
    const chunks = groundingMetadata.grounding_chunks || groundingMetadata.groundingChunks;
    
    if (!Array.isArray(chunks) || chunks.length === 0) {
      console.log('⚠️ GROUNDING - No grounding chunks found');
      return sources;
    }
    
    console.log(`✅ GROUNDING - Found ${chunks.length} grounding chunks`);
    
    // Extract URLs from each chunk
    for (const chunk of chunks) {
      if (!chunk) continue;
      
      // Try both chunk.web.uri and chunk.uri formats
      const uri = chunk.web?.uri || chunk.uri;
      const title = chunk.web?.title || chunk.title;
      
      if (!uri) {
        console.log('⚠️ GROUNDING - Chunk has no URI');
        continue;
      }
      
      // Validate URL format before adding
      if (!isValidUrlFormat(uri)) {
        console.log(`⚠️ GROUNDING - Invalid URL format: ${uri}`);
        continue;
      }
      
      // Extract domain for logging
      let domain = 'unknown';
      try {
        domain = new URL(uri).hostname.replace(/^www\./, '');
      } catch {
        // Keep 'unknown'
      }
      
      // Categorize the URL type
      const type = categorizeUrl(uri);
      
      sources.push({
        url: uri,
        title: title || undefined,
        type,
        domain
      });
    }
    
    console.log(`✅ GROUNDING - Extracted ${sources.length} valid URLs`);
    console.log(`📊 GROUNDING - Sources by type:`, 
      sources.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );
    
  } catch (error) {
    console.error('❌ GROUNDING - Error extracting URLs:', error);
  }
  
  return sources;
}

/**
 * Extract just the URLs (strings only) from grounding metadata
 */
export function extractGroundingUrlStrings(response: any): string[] {
  const sources = extractGroundingUrls(response);
  return sources.map(s => s.url);
}

/**
 * Extract grounding supports (text segments linked to sources)
 * Useful for inline citations
 */
export function extractGroundingSupports(response: any): Array<{
  text: string;
  startIndex: number;
  endIndex: number;
  sourceIndices: number[];
}> {
  const supports: Array<{
    text: string;
    startIndex: number;
    endIndex: number;
    sourceIndices: number[];
  }> = [];
  
  try {
    if (!response.candidates || response.candidates.length === 0) {
      return supports;
    }
    
    const firstCandidate = response.candidates[0];
    const groundingMetadata = firstCandidate?.grounding_metadata || firstCandidate?.groundingMetadata;
    
    if (!groundingMetadata) {
      return supports;
    }
    
    const groundingSupports = groundingMetadata.grounding_supports || groundingMetadata.groundingSupports;
    
    if (!Array.isArray(groundingSupports)) {
      return supports;
    }
    
    for (const support of groundingSupports) {
      if (!support || !support.segment) continue;
      
      supports.push({
        text: support.segment.text || '',
        startIndex: support.segment.startIndex || support.segment.start_index || 0,
        endIndex: support.segment.endIndex || support.segment.end_index || 0,
        sourceIndices: support.groundingChunkIndices || support.grounding_chunk_indices || []
      });
    }
    
    console.log(`✅ GROUNDING - Extracted ${supports.length} grounding supports`);
    
  } catch (error) {
    console.error('❌ GROUNDING - Error extracting supports:', error);
  }
  
  return supports;
}

/**
 * Check if response has grounding metadata
 */
export function hasGroundingMetadata(response: any): boolean {
  try {
    if (!response.candidates || response.candidates.length === 0) {
      return false;
    }
    
    const firstCandidate = response.candidates[0];
    const groundingMetadata = firstCandidate?.grounding_metadata || firstCandidate?.groundingMetadata;
    
    return !!groundingMetadata;
  } catch {
    return false;
  }
}

const groundingExtractor = {
  extractGroundingUrls,
  extractGroundingUrlStrings,
  extractGroundingSupports,
  hasGroundingMetadata
};

export default groundingExtractor;
