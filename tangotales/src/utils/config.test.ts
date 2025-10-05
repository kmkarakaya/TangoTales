import { config } from '../utils/config';

describe('Rate Limiting Configuration', () => {
  test('should have rate limit constants defined', () => {
    expect(config.rateLimits).toBeDefined();
    expect(config.rateLimits.MAX_CONCURRENT_AI_REQUESTS).toBe(1);
    expect(config.rateLimits.MIN_REQUEST_DELAY_MS).toBe(2000);
  });

  test('rate limit values should be positive numbers', () => {
    expect(config.rateLimits.MAX_CONCURRENT_AI_REQUESTS).toBeGreaterThan(0);
    expect(config.rateLimits.MIN_REQUEST_DELAY_MS).toBeGreaterThan(0);
  });
});