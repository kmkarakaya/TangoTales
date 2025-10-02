export interface Song {
  // Primary identification
  id: string;
  title: string;
  originalTitle?: string;
  alternativeTitles: string[];
  
  // Factual information
  composer: string;
  lyricist?: string;
  yearComposed?: number;
  period: 'Golden Age' | 'Pre-Golden Age' | 'Post-Golden Age' | 'Contemporary';
  musicalForm: 'Tango' | 'Vals' | 'Milonga' | 'Candombe' | 'Other';
  
  // Cultural context
  themes: string[];
  culturalSignificance: string;
  historicalContext: string;
  
  // Musical analysis
  keySignature?: string;
  tempo?: string;
  musicalCharacteristics: string[];
  danceStyle: string[];
  
  // Performance information
  notableRecordings: Recording[];
  notablePerformers: Performer[];
  recommendedForDancing: boolean;
  danceRecommendations?: string;
  
  // Narrative elements
  story?: string;
  inspiration?: string;
  personalAnecdotes?: string;
  
  // Technical metadata (existing fields)
  explanation: string; // AI-generated comprehensive summary
  sources: string[];
  searchCount: number;
  averageRating: number;
  totalRatings: number;
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  
  // Quality assurance metadata
  metadata?: SongMetadata;
}

export interface Recording {
  artist: string;
  orchestra?: string;
  year?: number;
  label?: string;
  significance?: string;
}

export interface Performer {
  name: string;
  role: 'Singer' | 'Orchestra Leader' | 'Musician';
  period?: string;
  significance?: string;
}

export interface SongMetadata {
  aiResponseQuality: 'excellent' | 'good' | 'partial' | 'failed';
  needsManualReview: boolean;
  lastAIUpdate: Date;
  errorReason?: string;
  retryCount: number;
}

export interface Rating {
  id?: string;
  songId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export interface SearchResult {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
}

export interface GeminiResponse {
  title: string;
  date: string;
  title_meaning: string;
  cultural_notes: string;
  sources: string[];
}