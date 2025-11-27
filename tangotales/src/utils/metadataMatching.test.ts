/**
 * Metadata Matching Tests
 */

import { matchMetadata, createMetadataTokens, MetadataTokens } from './metadataMatching';

describe('metadataMatching', () => {
  describe('matchMetadata', () => {
    it('should verify with strong token matches (artist + title)', () => {
      const metadata: MetadataTokens = {
        artist: 'Carlos Gardel',
        title: 'El día que me quieras',
      };

      const result = matchMetadata(
        'Carlos Gardel - El día que me quieras',
        'A classic tango song by Carlos Gardel',
        metadata
      );

      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.matchedTokens.length).toBeGreaterThan(0);
    });

    it('should verify with orchestra + title match', () => {
      const metadata: MetadataTokens = {
        orchestra: 'Orquesta Típica Victor',
        title: 'La Cumparsita',
      };

      const result = matchMetadata(
        'Orquesta Típica Victor - La Cumparsita (1935)',
        'Historic recording by Orquesta Típica Victor',
        metadata
      );

      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBe('high');
    });

    it('should not verify with only weak matches', () => {
      const metadata: MetadataTokens = {
        album: 'Tango Collection',
        year: 2020,
      };

      const result = matchMetadata(
        'Various Artists - Tango Collection (2020)',
        'A compilation album from 2020',
        metadata
      );

      expect(result.isVerified).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.reason).toContain('weak token matches');
    });

    it('should handle missing content', () => {
      const metadata: MetadataTokens = {
        artist: 'Carlos Gardel',
      };

      const result = matchMetadata(undefined, undefined, metadata);

      expect(result.isVerified).toBe(false);
      expect(result.reason).toContain('No content extracted');
    });

    it('should verify with medium confidence (one strong + one weak)', () => {
      const metadata: MetadataTokens = {
        artist: 'Aníbal Troilo',
        year: 1943,
      };

      const result = matchMetadata(
        'Aníbal Troilo - Tango Recordings 1943',
        'Historic recordings from 1943',
        metadata
      );

      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBe('medium');
    });

    it('should handle partial word matches for multi-word tokens', () => {
      const metadata: MetadataTokens = {
        orchestra: 'Orquesta Típica Misteriosa Buenos Aires',
      };

      const result = matchMetadata(
        'O.T. Misteriosa Buenos Aires - Recording',
        'Performance by Orquesta Misteriosa from Buenos Aires',
        metadata
      );

      expect(result.isVerified).toBe(true);
    });

    it('should not match unrelated content', () => {
      const metadata: MetadataTokens = {
        artist: 'Carlos Rossi',
        orchestra: 'Orquesta Típica Misteriosa Buenos Aires',
        title: 'Tormenta',
      };

      const result = matchMetadata(
        'Grandes letristas de tango - Enrique Santos Discépolo',
        'A documentary about lyricist Enrique Santos Discépolo',
        metadata
      );

      expect(result.isVerified).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('should handle punctuation and case differences', () => {
      const metadata: MetadataTokens = {
        title: 'El Día Que Me Quieras',
        artist: 'Carlos Gardel',
      };

      const result = matchMetadata(
        'CARLOS GARDEL: "EL DIA QUE ME QUIERAS"!!!',
        'Classic performance by gardel',
        metadata
      );

      expect(result.isVerified).toBe(true);
    });

    it('should match composer and lyricist tokens', () => {
      const metadata: MetadataTokens = {
        composer: 'Gerardo Matos Rodríguez',
        lyricist: 'Pascual Contursi',
      };

      const result = matchMetadata(
        'La Cumparsita - Composed by Gerardo Matos Rodríguez',
        'Lyrics by Pascual Contursi for this famous tango',
        metadata
      );

      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBe('high');
    });
  });

  describe('createMetadataTokens', () => {
    it('should create tokens from standard data', () => {
      const data = {
        artist: 'Carlos Gardel',
        title: 'El día que me quieras',
        year: 1935,
      };

      const tokens = createMetadataTokens(data);

      expect(tokens.artist).toBe('Carlos Gardel');
      expect(tokens.title).toBe('El día que me quieras');
      expect(tokens.year).toBe(1935);
    });

    it('should use performer as artist fallback', () => {
      const data = {
        performer: 'Aníbal Troilo',
        title: 'Tormenta',
      };

      const tokens = createMetadataTokens(data);

      expect(tokens.artist).toBe('Aníbal Troilo');
    });

    it('should handle missing fields', () => {
      const data = {
        title: 'La Cumparsita',
      };

      const tokens = createMetadataTokens(data);

      expect(tokens.title).toBe('La Cumparsita');
      expect(tokens.artist).toBeUndefined();
      expect(tokens.orchestra).toBeUndefined();
    });
  });
});
