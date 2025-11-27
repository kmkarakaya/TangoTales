/* eslint-disable import/first */
// Integration-like test: mock firebase/firestore to capture what createEnhancedSong writes
jest.mock('firebase/firestore', () => {
  return {
    // Minimal mocks used by createEnhancedSong and firebase initialization
    doc: jest.fn((db: any, collection: string, id: string) => ({ __ref: `${collection}/${id}` })),
    setDoc: jest.fn(() => Promise.resolve()),
    Timestamp: {
      now: () => ({ toDate: () => new Date() }),
      fromDate: (d: any) => d
    },
    getFirestore: jest.fn(() => ({}))
  } as any;
});

import { createEnhancedSong } from './firestore';
import { setDoc } from 'firebase/firestore';

describe('createEnhancedSong integration (mocked)', () => {
  afterEach(() => {
    (setDoc as jest.Mock).mockClear();
  });

  test('persists normalized links and merges into recordingSources', async () => {
    const title = 'Test Song';
    const enhancedData = {
      notableRecordings: [
        { artist: 'X', links: [{ url: 'https://youtube.com/watch?v=1', label: 'YT' }, { url: 'not-a-url' }] }
      ],
      recordingSources: []
    };

    const metadata = { aiResponseQuality: 'good', needsManualReview: false, lastAIUpdate: new Date() };

  await createEnhancedSong(title, enhancedData, metadata as any);

    // setDoc should have been called once with the doc ref and data
    expect((setDoc as jest.Mock).mock.calls.length).toBe(1);
    const [, data] = (setDoc as jest.Mock).mock.calls[0];

  // The saved data should include notableRecordings with normalized links (object shape)
  expect(data.notableRecordings).toBeDefined();
  const recs = Array.isArray(data.notableRecordings) ? data.notableRecordings : data.notableRecordings.recordings;
  expect(Array.isArray(recs)).toBe(true);
  expect(recs[0].links).toBeDefined();
  expect(recs[0].links.length).toBe(1);
  expect(recs[0].links[0].url).toBe('https://youtube.com/watch?v=1');

    // recordingSources must include the merged link
    expect(Array.isArray(data.recordingSources)).toBe(true);
    const urls = data.recordingSources.map((s: any) => s.url);
    expect(urls).toContain('https://youtube.com/watch?v=1');
  });
});
