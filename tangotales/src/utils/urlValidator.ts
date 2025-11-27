/**
 * URL Validation Utility
 * 
 * Validates URLs by checking:
 * - HTTP status (200/2xx)
 * - Follows redirects (with limit)
 * - Content-Type validation
 * - Extracts title and snippet for metadata matching
 */

export interface UrlValidationResult {
  isValid: boolean;
  status?: number;
  finalUrl?: string;
  title?: string;
  snippet?: string;
  contentType?: string;
  error?: string;
}

interface FetchOptions {
  maxRedirects?: number;
  maxContentLength?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: FetchOptions = {
  maxRedirects: 5,
  maxContentLength: 32 * 1024, // 32KB
  timeout: 10000, // 10 seconds
};

/**
 * Extract title from HTML content
 */
function extractTitle(html: string): string | undefined {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

/**
 * Extract snippet from HTML content (first meaningful paragraph or meta description)
 */
function extractSnippet(html: string): string | undefined {
  // Try meta description first
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (metaMatch) {
    return metaMatch[1].trim();
  }

  // Try first paragraph
  const pMatch = html.match(/<p[^>]*>([^<]{20,})<\/p>/i);
  if (pMatch) {
    // Strip HTML tags and return first 200 chars
    const text = pMatch[1].replace(/<[^>]+>/g, '').trim();
    return text.substring(0, 200);
  }

  return undefined;
}

/**
 * Perform HEAD request with fallback to GET
 */
async function fetchWithFallback(
  url: string,
  options: FetchOptions = DEFAULT_OPTIONS
): Promise<UrlValidationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);

  try {
    // Try HEAD request first
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch (headError) {
      // If HEAD fails or is not allowed, try GET
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    // Check status code
    if (!response.ok) {
      return {
        isValid: false,
        status: response.status,
        finalUrl: response.url,
        error: `HTTP ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    
    // For successful HEAD or non-HTML responses
    if (response.type === 'opaque' || !contentType.includes('text/html')) {
      // For video/audio content, just check if it's accessible
      if (contentType.includes('video') || contentType.includes('audio')) {
        return {
          isValid: true,
          status: response.status,
          finalUrl: response.url,
          contentType,
        };
      }

      // For other content types, consider valid if 2xx
      return {
        isValid: response.status >= 200 && response.status < 300,
        status: response.status,
        finalUrl: response.url,
        contentType,
      };
    }

    // For HTML, extract title and snippet
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let html = '';
      let bytesRead = 0;

      while (bytesRead < (options.maxContentLength || DEFAULT_OPTIONS.maxContentLength!)) {
        const { done, value } = await reader.read();
        if (done) break;

        html += decoder.decode(value, { stream: true });
        bytesRead += value.length;

        // Stop if we have title and snippet
        if (html.includes('</title>') && (html.includes('</p>') || html.includes('description'))) {
          break;
        }
      }

      reader.cancel();

      const title = extractTitle(html);
      const snippet = extractSnippet(html);

      return {
        isValid: true,
        status: response.status,
        finalUrl: response.url,
        title,
        snippet,
        contentType,
      };
    }

    return {
      isValid: true,
      status: response.status,
      finalUrl: response.url,
      contentType,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      return {
        isValid: false,
        error: error.name === 'AbortError' ? 'Request timeout' : error.message,
      };
    }

    return {
      isValid: false,
      error: 'Unknown error',
    };
  }
}

/**
 * Validate a URL
 * 
 * @param url - The URL to validate
 * @param options - Validation options
 * @returns Validation result with status, title, snippet, etc.
 */
export async function validateUrl(
  url: string,
  options: FetchOptions = DEFAULT_OPTIONS
): Promise<UrlValidationResult> {
  try {
    // Basic URL validation
    new URL(url);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }

  return fetchWithFallback(url, options);
}

/**
 * Validate multiple URLs in parallel with concurrency limit
 * 
 * @param urls - Array of URLs to validate
 * @param concurrency - Maximum number of concurrent requests
 * @returns Map of URL to validation result (with finalUrl after redirects)
 */
export async function validateUrls(
  urls: string[],
  concurrency: number = 3
): Promise<Map<string, UrlValidationResult>> {
  const results = new Map<string, UrlValidationResult>();
  const queue = [...urls];

  async function processUrl(url: string) {
    const result = await validateUrl(url);
    results.set(url, result);
    
    // Log redirect detection
    if (result.finalUrl && result.finalUrl !== url) {
      console.log(`🔀 REDIRECT: ${url.substring(0, 60)}... → ${result.finalUrl.substring(0, 60)}...`);
    }
  }

  // Process URLs with concurrency limit
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    await Promise.all(batch.map(processUrl));
  }

  return results;
}

/**
 * Filter URLs to only keep valid, accessible ones
 * Returns the FINAL URLs after following redirects
 * 
 * ⚠️ SPECIAL CASE: Google grounding redirect URLs cannot be validated in advance
 * because they are temporary tokens. We keep them AS-IS since they come from Gemini.
 */
export async function filterValidUrls(
  urls: string[],
  concurrency: number = 3
): Promise<string[]> {
  // Separate Google redirect URLs from normal URLs
  const googleRedirectUrls = urls.filter(url => 
    url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect/')
  );
  const normalUrls = urls.filter(url => 
    !url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect/')
  );
  
  if (googleRedirectUrls.length > 0) {
    console.warn(`⚠️ VALIDATION - Found ${googleRedirectUrls.length} Google redirect URLs`);
    console.warn(`   These are temporary tokens from Gemini's grounding and CANNOT be validated`);
    console.warn(`   Keeping them AS-IS - they will redirect when clicked by the user`);
  }
  
  // Validate only normal URLs
  const validationResults = await validateUrls(normalUrls, concurrency);
  const validUrls: string[] = [];
  
  for (const url of normalUrls) {
    const result = validationResults.get(url);
    if (result?.isValid) {
      // ✅ Use finalUrl if available (after following redirects), otherwise original URL
      validUrls.push(result.finalUrl || url);
    } else {
      console.log(`❌ VALIDATION - URL failed: ${url.substring(0, 60)}...`);
      if (result?.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log(`✅ VALIDATION - ${validUrls.length}/${normalUrls.length} normal URLs valid`);
  
  // Return Google redirect URLs AS-IS + validated normal URLs
  return [...googleRedirectUrls, ...validUrls];
}

/**
 * Check if URL format is valid (basic check without network request)
 */
export function isValidUrlFormat(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(url)) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.length > 0 && urlObj.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Categorize URL type based on domain
 */
export function categorizeUrl(url: string): 'streaming_platform' | 'discography' | 'archive' | 'music_database' | 'encyclopedia' | 'other' {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('youtube') || domain.includes('youtu.be') || 
        domain.includes('spotify') || (domain.includes('apple') && domain.includes('music')) ||
        domain.includes('soundcloud') || domain.includes('deezer')) {
      return 'streaming_platform';
    }
    
    if (domain.includes('discogs') || domain.includes('musicbrainz') ||
        domain.includes('allmusic')) {
      return 'discography';
    }
    
    if (domain.includes('tango.info') || domain.includes('todotango') ||
        domain.includes('tangoarchive') || domain.includes('library') ||
        domain.includes('archive.org')) {
      return 'archive';
    }
    
    if (domain.includes('wikipedia') || domain.includes('encyclopedia') ||
        domain.includes('britannica')) {
      return 'encyclopedia';
    }
    
    if (domain.includes('music') || domain.includes('song') ||
        domain.includes('lyrics') || domain.includes('database')) {
      return 'music_database';
    }
    
    return 'other';
  } catch {
    return 'other';
  }
}
