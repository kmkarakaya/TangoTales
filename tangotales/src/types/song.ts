// New research data interfaces for enhanced AI pipeline
export interface SearchSource {
  url: string;
  title: string;
  snippet: string;
  searchQuery: string;
}

export interface SearchFindings {
  phase: string;
  query: string;
  sources: SearchSource[];
  findings: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface TitleValidation {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  alternativeTitles: string[];
  searchFindings: SearchFindings[];
}

export interface BasicInfo {
  composers: string[];
  lyricists: string[];
  yearComposed: string;
  period: string;
  originalKey: string;
  searchFindings: SearchFindings[];
}

export interface CulturalContext {
  historicalContext: string;
  culturalSignificance: string;
  socialContext: string;
  geographicalOrigins: string[];
  searchFindings: SearchFindings[];
}

export interface MusicalAnalysis {
  musicalForm: string;
  rhythmicCharacteristics: string;
  harmonicStructure: string;
  melodicFeatures: string;
  instrumentationNotes: string;
  searchFindings: SearchFindings[];
}

export interface EnhancedRecording {
  artist: string;
  year: string;
  label?: string;
  notes?: string;
  significance?: string;
  availability?: string;
}

export interface NotableRecordings {
  recordings: EnhancedRecording[];
  searchFindings: SearchFindings[];
}

export interface CurrentAvailability {
  streamingPlatforms: string[];
  purchaseLinks: string[];
  freeResources: string[];
  searchFindings: SearchFindings[];
}

export interface RecordingSource {
  title: string;
  url: string;
  type: string;
  content?: string;
}

export interface BasicInfoSource {
  title: string;
  url: string;
  type: 'database' | 'archive' | 'encyclopedia' | 'discography' | 'academic' | 'other';
}

export interface CulturalSource {
  title: string;
  url: string;
  type: 'encyclopedia' | 'academic' | 'cultural_site' | 'history' | 'biography' | 'other';
  content?: string;
}

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
  
  // New comprehensive research data fields
  titleValidation?: TitleValidation;
  basicInfo?: BasicInfo;
  culturalContext?: CulturalContext;
  musicalAnalysis?: MusicalAnalysis;
  notableRecordings?: NotableRecordings;
  currentAvailability?: CurrentAvailability;
  recordingSources?: RecordingSource[];
  basicInfoSources?: BasicInfoSource[];
  culturalSources?: CulturalSource[];
  alternativeSpellings?: string[];
  
  // Research metadata
  researchCompleted?: boolean;
  researchPhases?: string[]; // ['phase0', 'phase1', 'phase2', 'phase3', 'phase4']
  lastResearchUpdate?: Date;
  allSearchFindings?: SearchFindings[]; // Aggregated from all phases
  
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