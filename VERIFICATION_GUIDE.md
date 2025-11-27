# Link Verification Quick Start Guide

## Overview

The TangoTales app now includes comprehensive link validation with visual verification badges. This guide shows how to use the new verification features.

---

## Components

### 1. VerificationBadge

Visual indicator showing link validation status.

**Import**:
```typescript
import { VerificationBadge } from './components/common';
```

**Usage**:
```tsx
<VerificationBadge
  status="verified"    // verified | warning | error | pending | unverified
  message="Verified"   // Optional custom message
  tooltip="Link validated successfully" // Hover text
  compact={false}      // true = icon only, false = icon + text
/>
```

**Status Types**:
- ✅ `verified` - Green badge, link works and metadata matches
- ⚠️ `warning` - Yellow badge, link works but has issues (redirect, metadata mismatch)
- ✕ `error` - Red badge, link broken (404, timeout, invalid URL)
- ⏳ `pending` - Blue badge, validation in progress
- ? `unverified` - Gray badge, not yet validated

---

### 2. VerifiedLink

Automatic link validation with embedded badge.

**Import**:
```typescript
import { VerifiedLink } from './components/common';
```

**Basic Usage**:
```tsx
<VerifiedLink href="https://youtube.com/watch?v=abc123">
  Watch on YouTube
</VerifiedLink>
```

**With Metadata Validation**:
```tsx
<VerifiedLink
  href="https://youtube.com/watch?v=abc123"
  metadata={{
    artist: 'Juan D\'Arienzo',
    title: 'La Cumparsita',
    year: 1937
  }}
  showBadge={true}
  badgePosition="inline"  // before | after | inline
>
  Juan D'Arienzo - La Cumparsita
</VerifiedLink>
```

**Props**:
```typescript
interface VerifiedLinkProps {
  href: string;                    // Required: URL to validate
  children: React.ReactNode;       // Required: Link text
  metadata?: MetadataTokens;       // Optional: Expected metadata
  showBadge?: boolean;             // Default: true
  badgePosition?: 'before' | 'after' | 'inline'; // Default: inline
  enabled?: boolean;               // Default: true
  debounceMs?: number;             // Default: 500
  className?: string;              // Additional CSS classes
  target?: string;                 // Default: _blank
  rel?: string;                    // Default: noopener noreferrer
}
```

---

### 3. useLinkValidation Hook

Custom React hook for manual validation control.

**Import**:
```typescript
import { useLinkValidation } from './hooks/useLinkValidation';
```

**Usage**:
```tsx
function MyComponent() {
  const { status, message, tooltip, urlResult } = useLinkValidation(
    'https://youtube.com/watch?v=abc123',
    {
      enabled: true,
      metadata: {
        artist: 'Juan D\'Arienzo',
        title: 'La Cumparsita'
      },
      debounceMs: 500
    }
  );

  return (
    <div>
      <a href="https://youtube.com/watch?v=abc123">Watch Video</a>
      <VerificationBadge status={status} message={message} tooltip={tooltip} />
    </div>
  );
}
```

**Return Value**:
```typescript
interface LinkValidationResult {
  status: VerificationStatus;      // verified | warning | error | pending | unverified
  message: string;                 // User-friendly status message
  tooltip?: string;                // Detailed information for hover
  urlResult?: UrlValidationResult; // Full validation details
}
```

---

## Utilities

### 1. URL Validator

Validates URLs with HEAD/GET requests and HTML parsing.

**Import**:
```typescript
import { validateUrl, validateUrls } from './utils/urlValidator';
```

**Single URL**:
```typescript
const result = await validateUrl('https://youtube.com/watch?v=abc123');

console.log(result);
// {
//   isValid: true,
//   status: 200,
//   finalUrl: 'https://youtube.com/watch?v=abc123',
//   title: 'Juan D\'Arienzo - La Cumparsita',
//   snippet: 'Classic tango performance...',
//   contentType: 'text/html'
// }
```

**Multiple URLs** (batch processing):
```typescript
const results = await validateUrls([
  'https://youtube.com/watch?v=abc123',
  'https://apple.com/music/album/xyz'
]);

// Returns array of UrlValidationResult
// Processes 5 concurrent requests with 100ms delay between batches
```

**Result Interface**:
```typescript
interface UrlValidationResult {
  isValid: boolean;        // true if HTTP 200-299
  status: number;          // HTTP status code
  finalUrl: string;        // Final URL after redirects
  title?: string;          // Extracted from <title> tag
  snippet?: string;        // From meta description or first <p>
  contentType?: string;    // MIME type
  error?: string;          // Error message if validation failed
}
```

---

### 2. Metadata Matcher

Compares landing page content to expected metadata.

**Import**:
```typescript
import { matchMetadata } from './utils/metadataMatching';
```

**Usage**:
```typescript
const matchResult = matchMetadata(
  'Juan D\'Arienzo - La Cumparsita (1937)',  // landingPageTitle
  'Classic tango performance by the King of Beat', // landingPageSnippet
  {
    artist: 'Juan D\'Arienzo',
    title: 'La Cumparsita',
    year: 1937
  }
);

console.log(matchResult);
// {
//   isVerified: true,
//   matchedTokens: ['juan d arienzo', 'la cumparsita', '1937'],
//   confidence: 'high',
//   reason: undefined
// }
```

**Metadata Interface**:
```typescript
interface MetadataTokens {
  artist?: string;         // Performer/singer name
  orchestra?: string;      // Orchestra name
  title?: string;          // Song/composition title
  album?: string;          // Album name
  year?: string | number;  // Year of recording/composition
  composer?: string;       // Composer name
  lyricist?: string;       // Lyricist name
}
```

**Match Result**:
```typescript
interface MatchResult {
  isVerified: boolean;           // true if sufficient matches found
  matchedTokens: string[];       // List of matched tokens
  confidence: 'high' | 'medium' | 'low';
  reason?: string;               // Explanation if not verified
}
```

**Confidence Levels**:
- **High**: 2+ strong matches (artist/orchestra/title/composer)
- **Medium**: 1 strong + 1 weak match (album/year/lyricist)
- **Low**: Only weak matches or insufficient data

---

## Integration Examples

### Example 1: Notable Recordings Section

Replace plain links with verified links:

**Before**:
```tsx
<a href={recording.url} target="_blank" rel="noopener noreferrer">
  {recording.platform}
</a>
```

**After**:
```tsx
<VerifiedLink
  href={recording.url}
  metadata={{
    artist: song.composer,
    title: song.title,
    year: recording.year
  }}
  badgePosition="inline"
>
  {recording.platform}
</VerifiedLink>
```

---

### Example 2: Research Sources Section

Validate all research links:

**Before**:
```tsx
{sources.map(source => (
  <a href={source.url} target="_blank" rel="noopener noreferrer">
    {source.title}
  </a>
))}
```

**After**:
```tsx
{sources.map(source => (
  <VerifiedLink
    key={source.url}
    href={source.url}
    metadata={{
      title: song.title,
      composer: song.composer
    }}
    badgePosition="after"
  >
    {source.title}
  </VerifiedLink>
))}
```

---

### Example 3: Custom Validation UI

Build custom UI with validation hook:

```tsx
function CustomLinkDisplay({ url, expectedTitle }: Props) {
  const { status, message, tooltip, urlResult } = useLinkValidation(url, {
    metadata: { title: expectedTitle }
  });

  return (
    <div className="flex items-center gap-2">
      {status === 'error' ? (
        <span className="text-red-600">{message}: {url}</span>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {urlResult?.title || url}
        </a>
      )}
      
      {status === 'verified' && <span className="text-green-600">✓</span>}
      {status === 'warning' && (
        <Tooltip content={tooltip}>
          <span className="text-yellow-600">⚠</span>
        </Tooltip>
      )}
    </div>
  );
}
```

---

## Performance Tips

### 1. Debouncing
Adjust debounce delay based on usage:
```tsx
// Fast validation for critical links
<VerifiedLink href={url} debounceMs={100}>...</VerifiedLink>

// Slower validation for non-critical links
<VerifiedLink href={url} debounceMs={1000}>...</VerifiedLink>
```

### 2. Conditional Validation
Only validate when needed:
```tsx
// Validate only when modal is open
<VerifiedLink href={url} enabled={isModalOpen}>...</VerifiedLink>

// Validate only specific links
{link.needsValidation && (
  <VerifiedLink href={link.url}>...</VerifiedLink>
)}
```

### 3. Batch Validation
Validate multiple URLs efficiently:
```typescript
// Validate all links at once (max 5 concurrent)
const results = await validateUrls(allUrls);

// Process results
results.forEach((result, index) => {
  if (!result.isValid) {
    console.warn(`Link ${index} broken:`, result.error);
  }
});
```

---

## Testing

### Unit Tests
Test your components using verification features:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLinkValidation } from './hooks/useLinkValidation';

test('validates working link', async () => {
  const { result } = renderHook(() => 
    useLinkValidation('https://example.com', { debounceMs: 0 })
  );

  await waitFor(() => {
    expect(result.current.status).toBe('verified');
  });
});
```

### Integration Tests
Use Playwright MCP to test in browser:

```typescript
// Open modal and verify badges appear
await page.click('[data-testid="open-modal"]');
await page.waitForSelector('.verification-badge[data-status="verified"]');

// Verify tooltip shows correct information
await page.hover('.verification-badge');
const tooltip = await page.textContent('[role="tooltip"]');
expect(tooltip).toContain('Link validated successfully');
```

---

## Troubleshooting

### Badge Not Showing
1. Check `showBadge={true}` prop
2. Verify URL is provided
3. Wait for validation to complete (check status !== 'pending')

### Always Shows "Unverified"
1. Check `enabled={true}` prop
2. Verify network connectivity
3. Check browser console for CORS errors
4. Try manually with `validateUrl()` to debug

### Metadata Mismatch Warning
1. Check metadata tokens match content exactly
2. Consider using partial matches (e.g., last name only)
3. Adjust confidence thresholds if needed
4. Add more metadata tokens (artist + title + year)

### Performance Issues
1. Increase debounce delay: `debounceMs={1000}`
2. Disable validation for off-screen links: `enabled={false}`
3. Use batch validation for initial load
4. Implement caching layer (future enhancement)

---

## Best Practices

1. **Always provide metadata** when available for better verification
2. **Use inline badges** for minimal UI disruption
3. **Set reasonable debounce delays** (500ms default is good)
4. **Handle error states gracefully** - show fallback content if validation fails
5. **Test with real URLs** - mocks won't catch CORS issues
6. **Monitor validation failures** - log errors for investigation
7. **Use compact badges in lists** to save space
8. **Provide tooltips** for additional context

---

## FAQ

**Q: Do badges slow down page load?**  
A: No, validation is debounced and asynchronous. Initial render shows "unverified" badge.

**Q: Can I validate non-HTTP URLs?**  
A: No, only `http://` and `https://` URLs are supported.

**Q: Does this work with JavaScript-rendered content?**  
A: No, only initial HTML is parsed. SPA content won't be captured.

**Q: How do I add caching?**  
A: Wrap `validateUrl()` with a caching layer using localStorage or React Context.

**Q: Can I customize badge colors?**  
A: Yes, modify `statusConfig` in `VerificationBadge.tsx`.

**Q: What about rate limiting?**  
A: Not implemented. Consider adding delays or using a proxy service.

---

## Next Steps

1. Integrate `VerifiedLink` into `EnhancedSongDetail.tsx` Notable Recordings
2. Add verification to Research Sources sections
3. Create admin dashboard showing broken links
4. Implement caching layer for validation results
5. Add retry logic with exponential backoff
6. Monitor validation success rates with analytics

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
