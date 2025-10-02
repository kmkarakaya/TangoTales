export interface Song {
  id: string;
  title: string;
  explanation: string;
  sources: string[];
  createdAt: Date;
  searchCount: number;
  averageRating: number;
  totalRatings: number;
  tags: string[];
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