import { Song } from '../types/song';
 
/**
 * Sample enhanced songs for testing the UI without AI dependency
 * These can be used when AI service fails or for development testing
 */
export const sampleEnhancedSongs: Partial<Song>[] = [
  {
    title: "La Cumparsita",
    originalTitle: "La Cumparsita",
    alternativeTitles: ["Si supieras", "The Little Carnival"],
    composer: "Gerardo Matos Rodríguez",
    lyricist: "Pascual Contursi",
    yearComposed: 1916,
    period: "Golden Age",
    musicalForm: "Tango",
    themes: ["nostalgia", "melancholy", "love", "loss", "memories"],
    culturalSignificance: "Considered the most famous tango worldwide, La Cumparsita is often called the 'tango anthem' and represents the soul of Argentine tango music.",
    historicalContext: "Composed during the golden age of tango in Buenos Aires, when the genre was gaining international recognition and spreading across the world.",
    keySignature: "G minor",
    tempo: "Moderato",
    musicalCharacteristics: ["distinctive melody", "minor key modulations", "traditional 2/4 rhythm", "dramatic crescendos"],
    danceStyle: ["classic tango", "dramatic pauses", "intricate footwork", "close embrace"],
    notableRecordings: [
      {
        artist: "Carlos Gardel",
        orchestra: undefined,
        year: 1924,
        significance: "The definitive vocal interpretation that popularized the song worldwide"
      },
      {
        artist: "Juan D'Arienzo",
        orchestra: "Orquesta Juan D'Arienzo",
        year: 1937,
        significance: "The rhythmic interpretation that became the standard for dancers"
      }
    ],
    notablePerformers: [
      {
        name: "Carlos Gardel",
        role: "Singer",
        significance: "Made the song internationally famous with his vocal interpretation"
      },
      {
        name: "Juan D'Arienzo", 
        role: "Orchestra Leader",
        significance: "Created the definitive dance version that remains popular today"
      }
    ],
    recommendedForDancing: true,
    danceRecommendations: "Perfect for advanced dancers, allows for dramatic interpretation and complex figures. Best danced in close embrace with emphasis on musical pauses.",
    story: "The lyrics tell of a little parade (cumparsita) that passes by, evoking memories of lost love and the passage of time. The narrator watches from his window as life moves on without him.",
    inspiration: "Originally written as an instrumental march for a student carnival, later transformed into a tango with the addition of Contursi's poignant lyrics about lost love.",
    explanation: "La Cumparsita stands as the most recognizable tango composition worldwide, embodying the essence of Argentine tango with its perfect blend of melancholy and passion. Composed by Gerardo Matos Rodríguez in 1916 and later enhanced with lyrics by Pascual Contursi, this masterpiece tells the universal story of love and loss. The song's distinctive melody and emotional depth have made it the unofficial anthem of tango, performed by virtually every tango artist and orchestra.",
    sources: ["Tango: The Art History of Love - Robert Farris Thompson"],
    tags: ["classic", "golden-age", "gardel", "d'arienzo", "famous"]
  },
  {
    title: "El Choclo",
    originalTitle: "El Choclo",
    alternativeTitles: ["The Corn Cob"],
    composer: "Ángel Villoldo",
    lyricist: undefined,
    yearComposed: 1903,
    period: "Pre-Golden Age",
    musicalForm: "Tango",
    themes: ["passion", "sensuality", "Buenos Aires", "street life"],
    culturalSignificance: "One of the earliest and most influential tangos, establishing many conventions of the genre and representing the authentic spirit of Buenos Aires neighborhoods.",
    historicalContext: "Composed during tango's formative years in the neighborhoods of Buenos Aires, when the genre was emerging from the fusion of African, European, and local musical traditions.",
    keySignature: "A minor",
    tempo: "Andante moderato",
    musicalCharacteristics: ["syncopated rhythm", "passionate melody", "accordion-style phrasing", "characteristic tango rhythm"],
    danceStyle: ["sensual", "close embrace", "traditional tango", "smooth walking"],
    notableRecordings: [
      {
        artist: "Francisco Canaro",
        orchestra: "Orquesta Francisco Canaro",
        year: 1926,
        significance: "Classic orchestral arrangement that defined the song's structure"
      }
    ],
    notablePerformers: [
      {
        name: "Francisco Canaro",
        role: "Orchestra Leader",
        significance: "Pioneer of tango orchestration and recording who created the definitive arrangement"
      }
    ],
    recommendedForDancing: true,
    danceRecommendations: "Excellent for close embrace dancing, moderate tempo suitable for all levels. Perfect for practicing smooth walking and simple figures.",
    story: undefined,
    inspiration: "Inspired by the street life and passionate atmosphere of Buenos Aires' neighborhoods, where tango was born from the cultural melting pot of immigrants.",
    explanation: "El Choclo represents the essence of early tango, with its infectious rhythm and passionate melody capturing the spirit of Buenos Aires in the early 1900s. Composed by Ángel Villoldo, one of tango's founding fathers, this piece established many musical conventions that would define the genre.",
    sources: ["El Tango: Su Historia y Evolución - Horacio Ferrer"],
    tags: ["early-tango", "villoldo", "canaro", "pre-golden-age"]
  }
];

/**
 * Get sample song data by title for testing
 */
export const getSampleSongByTitle = (title: string): Partial<Song> | null => {
  const normalizedTitle = title.toLowerCase().trim();
  
  const matchingSong = sampleEnhancedSongs.find(song => 
    song.title?.toLowerCase().includes(normalizedTitle) ||
    normalizedTitle.includes(song.title?.toLowerCase() || '')
  );
  
  return matchingSong || null;
};

/**
 * Create a complete song object from sample data
 */
export const createSongFromSample = (sampleData: Partial<Song>, title: string, songId: string): Song => {
  const now = new Date();
  
  return {
    // Required fields
    id: songId,
    title: title,
    originalTitle: sampleData.originalTitle || undefined,
    alternativeTitles: sampleData.alternativeTitles || [],
    
    // Enhanced fields from sample
    composer: sampleData.composer || 'Unknown',
    lyricist: sampleData.lyricist || undefined,
    yearComposed: sampleData.yearComposed || undefined,
    period: sampleData.period || 'Golden Age',
    musicalForm: sampleData.musicalForm || 'Tango',
    
    themes: sampleData.themes || [],
    culturalSignificance: sampleData.culturalSignificance || '',
    historicalContext: sampleData.historicalContext || '',
    
    keySignature: sampleData.keySignature || undefined,
    tempo: sampleData.tempo || undefined,
    musicalCharacteristics: sampleData.musicalCharacteristics || [],
    danceStyle: sampleData.danceStyle || [],
    
    notableRecordings: sampleData.notableRecordings || [],
    notablePerformers: sampleData.notablePerformers || [],
    recommendedForDancing: sampleData.recommendedForDancing !== undefined ? sampleData.recommendedForDancing : true,
    danceRecommendations: sampleData.danceRecommendations || undefined,
    
    story: sampleData.story || undefined,
    inspiration: sampleData.inspiration || undefined,
    personalAnecdotes: sampleData.personalAnecdotes || undefined,
    
    // Technical metadata
    explanation: sampleData.explanation || `Information about ${title} is being researched.`,
    sources: sampleData.sources || [],
    searchCount: 1,
    averageRating: 0,
    totalRatings: 0,
    tags: sampleData.tags || [],
    createdAt: now,
    lastUpdated: now,
    
    // Quality metadata
    metadata: {
      aiResponseQuality: 'excellent',
      needsManualReview: false,
      lastAIUpdate: now,
      retryCount: 0
    }
  };
};