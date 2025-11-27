import { parsePhaseResponse } from './responseParser';

describe('responseParser normalization', () => {
  test('normalizes notableRecordings links and drops non-absolute URLs', () => {
    const raw = JSON.stringify({
      musicalForm: 'Tango',
      rhythmicCharacteristics: '2/4',
      harmonicStructure: 'I-IV-V',
      melodicFeatures: 'lyrical',
      notableRecordings: [
        { artist: 'A', links: [{ url: 'http://example.com/1', label: 'One' }, { url: 'ftp://bad.example', label: 'Bad' }] }
      ],
      searchFindings: []
    });

    const res = parsePhaseResponse<any>(raw, '', 'phase4');
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    const recs = res.data!.notableRecordings;
    expect(Array.isArray(recs)).toBe(true);
    expect(recs[0].links).toBeDefined();
    expect(recs[0].links.length).toBe(1);
    expect(recs[0].links[0].url).toBe('http://example.com/1');
  });

  test('infers link type when missing', () => {
    const raw = JSON.stringify({
      musicalForm: 'Tango',
      rhythmicCharacteristics: '2/4',
      harmonicStructure: 'I-IV-V',
      melodicFeatures: 'lyrical',
      notableRecordings: [
        { artist: 'B', links: [{ url: 'https://open.spotify.com/track/abc' }] }
      ],
      searchFindings: []
    });

    const res = parsePhaseResponse<any>(raw, '', 'phase4');
    expect(res.success).toBe(true);
    const recs = res.data!.notableRecordings;
    expect(recs[0].links[0].type).toBeDefined();
    expect(recs[0].links[0].type).toContain('streaming');
  });
});
