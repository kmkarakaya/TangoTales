import { collection, query, where, orderBy, limit as firestoreLimit, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { Song } from '../types';
import PerformanceService from './performance';
import AnalyticsService from './analytics';

export interface AdvancedSearchFilters {
  sourceReliability?: number;
  culturalPeriod?: string;
  popularity?: number;
  hasRecordings?: boolean;
  completedResearch?: boolean;
  musicalComplexity?: number;
  yearRange?: { start: number; end: number };
  instruments?: string[];
  composers?: string[];
  tags?: string[];
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'popularity' | 'title' | 'date';
  sortDirection?: 'asc' | 'desc';
}

export interface SearchResult {
  songs: Song[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  filters: AdvancedSearchFilters;
}

class EnhancedSearchService {
  private static instance: EnhancedSearchService;
  private performanceService = PerformanceService.getInstance();
  private analyticsService = AnalyticsService.getInstance();

  public static getInstance(): EnhancedSearchService {
    if (!EnhancedSearchService.instance) {
      EnhancedSearchService.instance = new EnhancedSearchService();
    }
    return EnhancedSearchService.instance;
  }

  async search(
    searchTerm: string,
    filters: AdvancedSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const { page = 1, limit: pageLimit = 20, sortBy = 'relevance', sortDirection = 'desc' } = options;
    const cacheKey = this.generateCacheKey(searchTerm, filters, options);

    // Check cache first
    const cachedResult = this.performanceService.get<SearchResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const startTime = performance.now();

    try {
      // Build query constraints
      const constraints = this.buildQueryConstraints(searchTerm, filters, sortBy, sortDirection, pageLimit);
      
      // Execute query
      const songsQuery = query(collection(db, 'songs'), ...constraints);
      const querySnapshot = await getDocs(songsQuery);
      
      // Process results
      const songs: Song[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const song: Song = {
          id: doc.id,
          title: data.title || '',
          explanation: data.explanation || '',
          sources: data.sources || [],
          createdAt: data.createdAt,
          searchCount: data.searchCount || 0,
          averageRating: data.averageRating || 0,
          totalRatings: data.totalRatings || 0,
          tags: data.tags || [],
          // Enhanced fields from the actual Song interface
          alternativeTitles: data.alternativeTitles || [],
          composer: data.composer || '',
          lyricist: data.lyricist,
          yearComposed: data.yearComposed,
          period: data.period || 'Contemporary',
          musicalForm: data.musicalForm || 'Tango',
          themes: data.themes || [],
          culturalSignificance: data.culturalSignificance || '',
          historicalContext: data.historicalContext || '',
          keySignature: data.keySignature,
          tempo: data.tempo,
          musicalCharacteristics: data.musicalCharacteristics || [],
          danceStyle: data.danceStyle || [],
          notablePerformers: data.notablePerformers || [],
          recommendedForDancing: data.recommendedForDancing || false,
          danceRecommendations: data.danceRecommendations,
          story: data.story,
          inspiration: data.inspiration,
          personalAnecdotes: data.personalAnecdotes,
          lastUpdated: data.lastUpdated || new Date(),
          // New research data fields
          titleValidation: data.titleValidation,
          basicInfo: data.basicInfo,
          culturalContext: data.culturalContext,
          musicalAnalysis: data.musicalAnalysis,
          notableRecordings: data.notableRecordings,
          currentAvailability: data.currentAvailability,
          researchCompleted: data.researchCompleted,
          researchPhases: data.researchPhases || [],
          lastResearchUpdate: data.lastResearchUpdate,
          allSearchFindings: data.allSearchFindings || [],
          metadata: data.metadata,
        };
        songs.push(song);
      });

      // Apply additional client-side filtering if needed
      const filteredSongs = this.applyClientSideFilters(songs, filters);
      
      // Calculate pagination
      const totalCount = filteredSongs.length;
      const startIndex = (page - 1) * pageLimit;
      const paginatedSongs = filteredSongs.slice(startIndex, startIndex + pageLimit);
      
      const searchTime = performance.now() - startTime;
      
      const result: SearchResult = {
        songs: paginatedSongs,
        totalCount,
        hasMore: startIndex + pageLimit < totalCount,
        searchTime,
        filters,
      };

      // Cache result
      this.performanceService.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes cache

      // Track analytics
      await this.analyticsService.trackSearch(searchTerm, totalCount);
      await this.analyticsService.trackPerformance(searchTime, cachedResult !== null, true);

      return result;
    } catch (error) {
      const searchTime = performance.now() - startTime;
      await this.analyticsService.trackPerformance(searchTime, false, false);
      throw error;
    }
  }

  private buildQueryConstraints(
    searchTerm: string,
    filters: AdvancedSearchFilters,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    pageLimit: number
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Text search - using title for now (full-text search would require external service)
    if (searchTerm) {
      // This is a simplified approach - in production, you'd want full-text search
      // For now, we'll use array-contains for tags or title matching
      // Note: Firestore doesn't support case-insensitive queries natively
    }

    // Source reliability filter
    if (filters.sourceReliability !== undefined) {
      constraints.push(where('sourceReliability', '>=', filters.sourceReliability));
    }

    // Cultural period filter
    if (filters.culturalPeriod) {
      constraints.push(where('culturalContext.period', '==', filters.culturalPeriod));
    }

    // Popularity filter
    if (filters.popularity !== undefined) {
      constraints.push(where('averageRating', '>=', filters.popularity));
    }

    // Has recordings filter
    if (filters.hasRecordings) {
      constraints.push(where('recordings', '!=', null));
    }

    // Completed research filter
    if (filters.completedResearch) {
      constraints.push(where('researchData.completed', '==', true));
    }

    // Musical complexity filter
    if (filters.musicalComplexity !== undefined) {
      constraints.push(where('musicalAnalysis.complexity', '>=', filters.musicalComplexity));
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      // Firestore limitation: can only use array-contains with one value
      constraints.push(where('tags', 'array-contains-any', filters.tags));
    }

    // Sorting
    let sortField = 'title';
    switch (sortBy) {
      case 'popularity':
        sortField = 'averageRating';
        break;
      case 'date':
        sortField = 'createdAt';
        break;
      case 'relevance':
        sortField = 'searchCount';
        break;
      default:
        sortField = 'title';
    }

    constraints.push(orderBy(sortField, sortDirection));

    // Limit
    constraints.push(firestoreLimit(pageLimit * 2)); // Get extra for client-side filtering

    return constraints;
  }

  private applyClientSideFilters(songs: Song[], filters: AdvancedSearchFilters): Song[] {
    return songs.filter(song => {
      // Year range filter
      if (filters.yearRange) {
        const songYear = song.yearComposed;
        if (songYear) {
          if (songYear < filters.yearRange.start || songYear > filters.yearRange.end) {
            return false;
          }
        }
      }

      // Instruments filter
      if (filters.instruments && filters.instruments.length > 0) {
        const songInstruments = song.musicalAnalysis?.instrumentationNotes || '';
        const hasRequiredInstruments = filters.instruments.some(instrument =>
          songInstruments.toLowerCase().includes(instrument.toLowerCase())
        );
        if (!hasRequiredInstruments) {
          return false;
        }
      }

      // Composers filter
      if (filters.composers && filters.composers.length > 0) {
        const songComposers = song.notablePerformers || [];
        const hasRequiredComposers = filters.composers.some(composer =>
          songComposers.some((songComp: any) => 
            songComp.name.toLowerCase().includes(composer.toLowerCase())
          )
        );
        if (!hasRequiredComposers) {
          return false;
        }
      }

      return true;
    });
  }

  private generateCacheKey(
    searchTerm: string,
    filters: AdvancedSearchFilters,
    options: SearchOptions
  ): string {
    return `search:${searchTerm}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
  }

  // Get popular search terms
  async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    try {
      const cacheKey = `popular_terms:${limit}`;
      const cached = this.performanceService.get<string[]>(cacheKey);
      if (cached) return cached;

      const q = query(
        collection(db, 'searchQueries'),
        orderBy('count', 'desc'),
        firestoreLimit(limit)
      );
      
      const snapshot = await getDocs(q);
      const terms: string[] = [];
      
      snapshot.forEach(doc => {
        terms.push(doc.data().query);
      });

      this.performanceService.set(cacheKey, terms, 30 * 60 * 1000); // 30 minutes cache
      return terms;
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  }

  // Get search suggestions
  async getSearchSuggestions(partialTerm: string, limit: number = 5): Promise<string[]> {
    try {
      const cacheKey = `suggestions:${partialTerm}:${limit}`;
      const cached = this.performanceService.get<string[]>(cacheKey);
      if (cached) return cached;

      // In a real implementation, you'd want a more sophisticated search
      // For now, we'll use a simple approach with song titles and popular terms
      const [songsQuery, termsQuery] = await Promise.all([
        getDocs(query(
          collection(db, 'songs'),
          orderBy('title'),
          firestoreLimit(limit)
        )),
        this.getPopularSearchTerms(limit * 2)
      ]);

      const suggestions: string[] = [];
      
      // Add matching song titles
      songsQuery.forEach(doc => {
        const title = doc.data().title.toLowerCase();
        if (title.includes(partialTerm.toLowerCase())) {
          suggestions.push(doc.data().title);
        }
      });

      // Add matching search terms
      const matchingTerms = termsQuery.filter(term => 
        term.toLowerCase().includes(partialTerm.toLowerCase())
      );
      suggestions.push(...matchingTerms);

      // Remove duplicates and limit
      const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, limit);

      this.performanceService.set(cacheKey, uniqueSuggestions, 15 * 60 * 1000); // 15 minutes cache
      return uniqueSuggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Clear search cache
  clearCache(): void {
    // This would need a more sophisticated implementation to clear only search-related cache
    this.performanceService.clear();
  }
}

export default EnhancedSearchService;