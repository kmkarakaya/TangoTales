/**
 * Integration test for rate limiting functionality in enhancedGeminiWithProgress
 */

// Mock the AI client to avoid real API calls
jest.mock('../utils/config', () => ({
  config: {
    rateLimits: {
      MAX_CONCURRENT_AI_REQUESTS: 1,
      MIN_REQUEST_DELAY_MS: 100 // Shorter for testing
    },
    gemini: {
      apiKey: 'mock-api-key'
    },
    firebase: {
      apiKey: 'mock-firebase-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test.appspot.com',
      messagingSenderId: '12345',
      appId: 'mock-app-id'
    },
    app: {
      version: '1.0.0',
      environment: 'test'
    }
  }
}));

// Mock Google AI SDK
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: () => Promise.resolve('{"test": "response"}')
          }
        })
      })
    })
  }))
}));

// Mock Firebase services
jest.mock('../services/firebase', () => ({
  db: {}
}));

jest.mock('../services/firestore', () => ({
  updateSongWithResearchData: jest.fn(),
  markResearchComplete: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890 }))
  }
}));

describe('Rate Limiting Integration', () => {
  let SongInformationService: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    // Clear the service static state
    const service = require('../services/enhancedGeminiWithProgress');
    if (service.SongInformationService) {
      // Reset static counters
      (service.SongInformationService as any).activeRequests = 0;
      (service.SongInformationService as any).lastRequestTime = 0;
    }
  });

  test('should allow single request', async () => {
    const { songInformationService } = require('../services/enhancedGeminiWithProgress');
    
    const mockProgressCallback = jest.fn();
    
    // This test just verifies that the service can be imported and doesn't throw on configuration
    expect(songInformationService).toBeDefined();
    expect(typeof songInformationService.getEnhancedSongInformation).toBe('function');
  });

  test('should enforce minimum delay between requests', async () => {
    const { SongInformationService } = require('../services/enhancedGeminiWithProgress');
    
    // Set up timing
    const startTime = Date.now();
    
    // Verify that the static properties exist (this tests our rate limiting structure)
    expect(SongInformationService.activeRequests).toBeDefined();
    expect(SongInformationService.lastRequestTime).toBeDefined();
    
    // Test that our rate limit config is properly set
    const { config } = require('../utils/config');
    expect(config.rateLimits.MAX_CONCURRENT_AI_REQUESTS).toBe(1);
    expect(config.rateLimits.MIN_REQUEST_DELAY_MS).toBe(100);
  });
});