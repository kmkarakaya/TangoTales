import { recoverPhase4FromText } from './phase4Recovery';

describe('phase4Recovery', () => {
  test('attaches one-to-one links when recovered links count matches recordings', () => {
    const raw = 'Findings: https://open.spotify.com/track/aaa https://youtube.com/watch?v=bbb';
    const recordingData: any = {
      notableRecordings: [
        { artist: 'Artist A' },
        { artist: 'Artist B' }
      ]
    };

    const result = recoverPhase4FromText(raw, recordingData);
    expect(result.recoveredLinks).toBeDefined();
    expect(result.recoveredLinks.length).toBe(2);
    expect(result.notableRecordings[0].links.length).toBe(1);
    expect(result.notableRecordings[1].links.length).toBe(1);
    expect(result.currentAvailability).toBeDefined();
  });

  test('fuzzy matches links to single recording by artist fragment', () => {
    const raw = 'Reference: https://youtube.com/watch?v=johndoe-live';
    const recordingData: any = {
      notableRecordings: [
        { artist: 'John Doe' }
      ]
    };

    const result = recoverPhase4FromText(raw, recordingData);
    expect(result.recoveredLinks.length).toBe(1);
    expect(result.notableRecordings[0].links.length).toBeGreaterThanOrEqual(1);
    expect(result.notableRecordings[0].links[0].url).toContain('youtube.com');
  });

  test('returns unchanged when no URLs present', () => {
    const raw = 'No urls here.';
    const recordingData: any = { notableRecordings: [{ artist: 'Someone' }] };
    const result = recoverPhase4FromText(raw, recordingData);
    expect(result.recoveredLinks).toBeUndefined();
    expect(result.recordingSources).toBeUndefined();
  });
});
