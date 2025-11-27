import { renderHook, waitFor } from '@testing-library/react';
import { useLinkValidation } from './useLinkValidation';
import * as urlValidator from '../utils/urlValidator';
import * as metadataMatching from '../utils/metadataMatching';

// Mock the validators
jest.mock('../utils/urlValidator');
jest.mock('../utils/metadataMatching');

const mockedValidateUrl = urlValidator.validateUrl as jest.MockedFunction<typeof urlValidator.validateUrl>;
const mockedMatchMetadata = metadataMatching.matchMetadata as jest.MockedFunction<typeof metadataMatching.matchMetadata>;

describe('useLinkValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unverified status when disabled', () => {
    const { result } = renderHook(() =>
      useLinkValidation('https://example.com', { enabled: false })
    );

    expect(result.current.status).toBe('unverified');
    expect(result.current.message).toBe('Not validated');
  });

  it('should validate a working URL successfully', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: true,
      status: 200,
      finalUrl: 'https://example.com',
      title: 'Example Domain',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://example.com', { debounceMs: 0 })
    );

    // Initial state should be pending
    await waitFor(() => expect(result.current.status).toBe('pending'));

    // After validation completes
    await waitFor(() => {
      expect(result.current.status).toBe('verified');
      expect(result.current.message).toBe('Verified');
    });

    expect(mockedValidateUrl).toHaveBeenCalledWith('https://example.com');
  });

  it('should detect broken links', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: false,
      status: 404,
      finalUrl: 'https://example.com/broken',
      error: 'Not Found',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://example.com/broken', { debounceMs: 0 })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.message).toBe('Link broken');
      expect(result.current.tooltip).toBe('Not Found');
    });
  });

  it('should detect redirects', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: true,
      status: 200,
      finalUrl: 'https://example.com/new-location',
      title: 'Example Domain',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://example.com/old-location', { debounceMs: 0 })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('warning');
      expect(result.current.message).toBe('Redirected');
      expect(result.current.tooltip).toContain('https://example.com/new-location');
    });
  });

  it('should detect metadata mismatch', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: true,
      status: 200,
      finalUrl: 'https://youtube.com/watch?v=abc',
      title: 'Some Other Video',
    });

    mockedMatchMetadata.mockReturnValue({
      isVerified: false,
      matchedTokens: [],
      confidence: 'low',
      reason: 'No matching tokens found',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://youtube.com/watch?v=abc', {
        debounceMs: 0,
        metadata: { artist: 'Juan D\'Arienzo', title: 'La Cumparsita' },
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('warning');
      expect(result.current.message).toBe('Metadata mismatch');
    });

    expect(mockedMatchMetadata).toHaveBeenCalledWith(
      'Some Other Video',
      undefined,
      { artist: 'Juan D\'Arienzo', title: 'La Cumparsita' }
    );
  });

  it('should verify metadata match with high confidence', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: true,
      status: 200,
      finalUrl: 'https://youtube.com/watch?v=abc',
      title: 'Juan D\'Arienzo - La Cumparsita',
    });

    mockedMatchMetadata.mockReturnValue({
      isVerified: true,
      matchedTokens: ['juan d arienzo', 'la cumparsita'],
      confidence: 'high',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://youtube.com/watch?v=abc', {
        debounceMs: 0,
        metadata: { artist: 'Juan D\'Arienzo', title: 'La Cumparsita' },
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('verified');
      expect(result.current.message).toBe('Verified');
    });
  });

  it('should detect low confidence metadata matches', async () => {
    mockedValidateUrl.mockResolvedValue({
      isValid: true,
      status: 200,
      finalUrl: 'https://youtube.com/watch?v=abc',
      title: 'Tango Music Collection',
    });

    mockedMatchMetadata.mockReturnValue({
      isVerified: true,
      matchedTokens: ['tango'],
      confidence: 'low',
    });

    const { result } = renderHook(() =>
      useLinkValidation('https://youtube.com/watch?v=abc', {
        debounceMs: 0,
        metadata: { title: 'La Cumparsita' },
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('warning');
      expect(result.current.message).toBe('Low confidence match');
    });
  });

  it('should handle validation errors gracefully', async () => {
    mockedValidateUrl.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useLinkValidation('https://example.com', { debounceMs: 0 })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.message).toBe('Validation failed');
      expect(result.current.tooltip).toBe('Network error');
    });
  });
});
