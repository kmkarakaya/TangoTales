/**
 * URL Validator Tests
 */

import { validateUrl, validateUrls } from './urlValidator';

// Mock fetch for testing
global.fetch = jest.fn();

describe('urlValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUrl', () => {
    it('should validate a successful URL with title and snippet', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://example.com',
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('<html><head><title>Test Page</title></head><body><p>Test content here</p></body></html>'),
              })
              .mockResolvedValueOnce({ done: true }),
            cancel: jest.fn(),
          }),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await validateUrl('https://example.com');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.title).toBe('Test Page');
      expect(result.snippet).toBeDefined();
    });

    it('should handle 404 errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        url: 'https://example.com/notfound',
        headers: new Headers(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await validateUrl('https://example.com/notfound');

      expect(result.isValid).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toBe('HTTP 404');
    });

    it('should fallback to GET when HEAD fails', async () => {
      const mockHeadError = new Error('Method not allowed');
      const mockGetResponse = {
        ok: true,
        status: 200,
        url: 'https://example.com',
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('<html><head><title>Success</title></head></html>'),
              })
              .mockResolvedValueOnce({ done: true }),
            cancel: jest.fn(),
          }),
        },
      };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(mockHeadError)
        .mockResolvedValueOnce(mockGetResponse);

      const result = await validateUrl('https://example.com');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.title).toBe('Success');
    });

    it('should handle invalid URL format', async () => {
      const result = await validateUrl('not-a-url');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(resolve, 20000); // Longer than timeout
        })
      );

      const result = await validateUrl('https://example.com', { timeout: 100 });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    it('should handle video content types', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://example.com/video.mp4',
        headers: new Headers({ 'content-type': 'video/mp4' }),
        type: 'basic',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await validateUrl('https://example.com/video.mp4');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.contentType).toBe('video/mp4');
    });

    it('should extract meta description as snippet', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://example.com',
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  '<html><head><title>Test</title><meta name="description" content="This is a test description"></head></html>'
                ),
              })
              .mockResolvedValueOnce({ done: true }),
            cancel: jest.fn(),
          }),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await validateUrl('https://example.com');

      expect(result.isValid).toBe(true);
      expect(result.snippet).toBe('This is a test description');
    });
  });

  describe('validateUrls', () => {
    it('should validate multiple URLs with concurrency limit', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://example.com',
        headers: new Headers({ 'content-type': 'text/html' }),
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('<html><head><title>Test</title></head></html>'),
              })
              .mockResolvedValueOnce({ done: true }),
            cancel: jest.fn(),
          }),
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com',
      ];

      const results = await validateUrls(urls, 2);

      expect(results.size).toBe(3);
      expect(results.get('https://example1.com')?.isValid).toBe(true);
      expect(results.get('https://example2.com')?.isValid).toBe(true);
      expect(results.get('https://example3.com')?.isValid).toBe(true);
    });
  });
});
