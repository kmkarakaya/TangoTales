// No type imports needed - using generic validation

export interface ParsedPhaseResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  rawResponse: string;
}

/**
 * Parse and validate AI response against TypeScript interfaces
 */
export const parsePhaseResponse = <T>(
  rawResponse: string,
  schema: string,
  phase: string
): ParsedPhaseResult<T> => {
  const result: ParsedPhaseResult<T> = {
    success: false,
    rawResponse,
    errors: []
  };

  try {
    // Extract JSON from response (handle cases where AI adds extra text)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      result.errors = [`No valid JSON found in ${phase} response`];
      return result;
    }

    const jsonData = JSON.parse(jsonMatch[0]);

    // If the phase may contain recording links, normalize link objects
    if (phase === 'phase4' || phase === 'phase5' || phase === 'notable_recordings') {
      normalizeLinksInData(jsonData);
    }

    // Basic validation based on phase
    const validationResult = validatePhaseData(jsonData, phase);
    if (!validationResult.isValid) {
      result.errors = validationResult.errors;
      return result;
    }

    result.success = true;
    result.data = jsonData as T;
    return result;

  } catch (error) {
    result.errors = [`JSON parsing error in ${phase}: ${error instanceof Error ? error.message : 'Unknown error'}`];
    return result;
  }
};

/**
 * Validate phase data structure
 */
const validatePhaseData = (data: any, phase: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (phase) {
    case 'phase1':
      if (!data.isValid !== undefined) errors.push('Missing isValid field in title validation');
      if (!data.confidence) errors.push('Missing confidence field in title validation');
      if (!Array.isArray(data.alternativeTitles)) errors.push('alternativeTitles must be an array');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    case 'phase2':
      if (!Array.isArray(data.composers)) errors.push('composers must be an array');
      if (!Array.isArray(data.lyricists)) errors.push('lyricists must be an array');
      if (!data.yearComposed) errors.push('Missing yearComposed field');
      if (!data.period) errors.push('Missing period field');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    case 'phase3':
      if (!data.historicalContext) errors.push('Missing historicalContext field');
      if (!data.culturalSignificance) errors.push('Missing culturalSignificance field');
      if (!data.socialContext) errors.push('Missing socialContext field');
      if (!Array.isArray(data.geographicalOrigins)) errors.push('geographicalOrigins must be an array');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    case 'phase4':
      if (!data.musicalForm) errors.push('Missing musicalForm field');
      if (!data.rhythmicCharacteristics) errors.push('Missing rhythmicCharacteristics field');
      if (!data.harmonicStructure) errors.push('Missing harmonicStructure field');
      if (!data.melodicFeatures) errors.push('Missing melodicFeatures field');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    case 'phase5':
      if (!Array.isArray(data.recordings)) errors.push('recordings must be an array');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    case 'phase6':
      if (!Array.isArray(data.streamingPlatforms)) errors.push('streamingPlatforms must be an array');
      if (!Array.isArray(data.purchaseLinks)) errors.push('purchaseLinks must be an array');
      if (!Array.isArray(data.freeResources)) errors.push('freeResources must be an array');
      if (!Array.isArray(data.searchFindings)) errors.push('searchFindings must be an array');
      break;

    default:
      errors.push(`Unknown phase: ${phase}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create fallback data for failed phases
 */
export const createFallbackData = (phase: string): any => {
  const baseSearchFindings = [{
    phase,
    query: 'fallback',
    sources: [],
    findings: 'Data not available - using fallback',
    confidence: 'low' as const
  }];

  switch (phase) {
    case 'phase1':
      return {
        isValid: true,
        confidence: 'low' as const,
        alternativeTitles: [],
        searchFindings: baseSearchFindings
      };

    case 'phase2':
      return {
        composers: ['Unknown'],
        lyricists: [],
        yearComposed: 'Unknown',
        period: 'Unknown',
        originalKey: 'Unknown',
        searchFindings: baseSearchFindings
      };

    case 'phase3':
      return {
        historicalContext: 'Historical context not available',
        culturalSignificance: 'Cultural significance not available',
        socialContext: 'Social context not available',
        geographicalOrigins: [],
        searchFindings: baseSearchFindings
      };

    case 'phase4':
      return {
        musicalForm: 'Unknown',
        rhythmicCharacteristics: 'Unknown',
        harmonicStructure: 'Unknown',
        melodicFeatures: 'Unknown',
        instrumentationNotes: 'Unknown',
        searchFindings: baseSearchFindings
      };

    case 'phase5':
      return {
        recordings: [],
        searchFindings: baseSearchFindings
      };

    case 'phase6':
      return {
        streamingPlatforms: [],
        purchaseLinks: [],
        freeResources: [],
        searchFindings: baseSearchFindings
      };

    default:
      return {};
  }
};

/**
 * Normalize link objects in known locations of parsed JSON so downstream code
 * can assume { label?: string, url: string, type?: string } shape and valid http(s) URLs.
 */
const normalizeLinksInData = (data: any) => {
  const isAbsoluteUrl = (u: string) => typeof u === 'string' && /^https?:\/\//i.test(u.trim());

  const normalizeLinksArray = (links: any[]): any[] => {
    if (!Array.isArray(links)) return links;
    return links.map(link => {
      if (!link) return null;
      const url = (link.url || link.link || '').toString().trim();
      if (!isAbsoluteUrl(url)) return null; // drop non-absolute urls
      const label = (link.label || link.title || '').toString().trim() || undefined;
      const type = (link.type || inferLinkTypeFromUrl(url) || undefined);
      return { label, url, type };
    }).filter(Boolean);
  };

  // normalize notableRecordings[].links
  if (data.notableRecordings && Array.isArray(data.notableRecordings)) {
    data.notableRecordings.forEach((r: any) => {
      if (r.links) r.links = normalizeLinksArray(r.links);
    });
  }

  // normalize recordings[].links
  if (data.recordings && Array.isArray(data.recordings)) {
    data.recordings.forEach((r: any) => {
      if (r.links) r.links = normalizeLinksArray(r.links);
    });
  }
};

const inferLinkTypeFromUrl = (url: string): string | undefined => {
  const u = url.toLowerCase();
  if (u.includes('spotify')) return 'streaming_platform';
  if (u.includes('apple')) return 'streaming_platform';
  if (u.includes('youtube')) return 'streaming_platform';
  if (u.includes('discogs')) return 'discography';
  if (u.includes('wikipedia')) return 'archive';
  return undefined;
};