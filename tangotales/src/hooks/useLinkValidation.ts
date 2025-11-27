import { useState, useEffect } from 'react';
import { validateUrl, UrlValidationResult } from '../utils/urlValidator';
import { matchMetadata, MetadataTokens } from '../utils/metadataMatching';
import { VerificationStatus } from '../components/common/VerificationBadge';

export interface LinkValidationResult {
  status: VerificationStatus;
  message: string;
  tooltip?: string;
  urlResult?: UrlValidationResult;
}

export interface UseLinkValidationOptions {
  enabled?: boolean;
  metadata?: MetadataTokens;
  debounceMs?: number;
}

/**
 * Hook to validate external links with metadata matching
 * 
 * @param url - URL to validate
 * @param options - Validation options including metadata for matching
 * @returns Validation result with status, message, and tooltip
 * 
 * @example
 * const { status, message, tooltip } = useLinkValidation(
 *   'https://youtube.com/watch?v=abc123',
 *   { metadata: { artist: 'Juan D\'Arienzo', title: 'La Cumparsita' } }
 * );
 */
export const useLinkValidation = (
  url: string,
  options: UseLinkValidationOptions = {}
): LinkValidationResult => {
  const { enabled = true, metadata, debounceMs = 500 } = options;

  const [result, setResult] = useState<LinkValidationResult>({
    status: 'unverified',
    message: 'Not validated',
  });

  useEffect(() => {
    if (!enabled || !url) {
      setResult({
        status: 'unverified',
        message: 'Not validated',
      });
      return;
    }

    // Set pending state
    setResult({
      status: 'pending',
      message: 'Checking...',
    });

    // Debounce validation
    const timeoutId = setTimeout(async () => {
      try {
        const urlResult = await validateUrl(url);

        if (!urlResult.isValid) {
          setResult({
            status: 'error',
            message: 'Link broken',
            tooltip: urlResult.error || 'Failed to validate URL',
            urlResult,
          });
          return;
        }

        // Check for metadata mismatch if metadata provided
        if (metadata && (urlResult.title || urlResult.snippet)) {
          const matchResult = matchMetadata(
            urlResult.title,
            urlResult.snippet,
            metadata
          );
          
          if (!matchResult.isVerified) {
            setResult({
              status: 'warning',
              message: 'Metadata mismatch',
              tooltip: `Expected content about ${metadata.artist || metadata.title}, but link title is "${urlResult.title}"`,
              urlResult,
            });
            return;
          }

          if (matchResult.confidence === 'low') {
            setResult({
              status: 'warning',
              message: 'Low confidence match',
              tooltip: `Link title "${urlResult.title}" may not match expected content`,
              urlResult,
            });
            return;
          }
        }

        // Check for redirect
        if (urlResult.finalUrl !== url) {
          setResult({
            status: 'warning',
            message: 'Redirected',
            tooltip: `Link redirects to: ${urlResult.finalUrl}`,
            urlResult,
          });
          return;
        }

        // All checks passed
        setResult({
          status: 'verified',
          message: 'Verified',
          tooltip: urlResult.title ? `Verified: ${urlResult.title}` : 'Link validated successfully',
          urlResult,
        });
      } catch (error) {
        setResult({
          status: 'error',
          message: 'Validation failed',
          tooltip: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [url, enabled, metadata, debounceMs]);

  return result;
};

export default useLinkValidation;
