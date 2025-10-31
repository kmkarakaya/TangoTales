import { db } from './firebase';
import { collection, doc, updateDoc, increment, getDoc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface AnalyticsData {
  searchQueries: number;
  popularSongs: { title: string; count: number }[];
  userEngagement: {
    averageSessionTime: number;
    pagesPerSession: number;
    bounceRate: number;
  };
  performanceMetrics: {
    apiLatency: number;
    cacheHitRate: number;
    successRate: number;
    averageResponseTime: number;
  };
  researchMetrics: {
    totalResearches: number;
    completedResearches: number;
    averageResearchTime: number;
    popularResearchTopics: string[];
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionStartTime: number = Date.now();
  private pageViews: number = 0;
  private searchCount: number = 0;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track search query
  async trackSearch(query: string, resultsCount: number): Promise<void> {
    try {
      this.searchCount++;
      
      // Update global search analytics
      const analyticsRef = doc(db, 'analytics', 'searches');
      await updateDoc(analyticsRef, {
        totalSearches: increment(1),
        lastUpdated: new Date(),
      }).catch(async () => {
        // Document doesn't exist, create it
        await setDoc(analyticsRef, {
          totalSearches: 1,
          lastUpdated: new Date(),
        });
      });

      // Track individual query
      const queryRef = doc(db, 'searchQueries', query.toLowerCase());
      await updateDoc(queryRef, {
        count: increment(1),
        lastSearched: new Date(),
        resultsCount,
      }).catch(async () => {
        await setDoc(queryRef, {
          query: query.toLowerCase(),
          count: 1,
          lastSearched: new Date(),
          resultsCount,
        });
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Track song view
  async trackSongView(songId: string, songTitle: string): Promise<void> {
    try {
      this.pageViews++;
      
      const songRef = doc(db, 'songs', songId);
      await updateDoc(songRef, {
        viewCount: increment(1),
        lastViewed: new Date(),
      });

      // Update popular songs tracking
      const popularRef = doc(db, 'analytics', 'popularSongs');
      const popularDoc = await getDoc(popularRef);
      
      if (popularDoc.exists()) {
        const data = popularDoc.data();
        const songs = data.songs || {};
        songs[songId] = {
          title: songTitle,
          count: (songs[songId]?.count || 0) + 1,
        };
        
        await updateDoc(popularRef, { songs, lastUpdated: new Date() });
      } else {
        await setDoc(popularRef, {
          songs: {
            [songId]: { title: songTitle, count: 1 }
          },
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Error tracking song view:', error);
    }
  }

  // Track research completion
  async trackResearchCompletion(songId: string, researchType: string, duration: number): Promise<void> {
    try {
      const researchRef = doc(db, 'analytics', 'research');
      await updateDoc(researchRef, {
        totalCompletions: increment(1),
        totalDuration: increment(duration),
        lastUpdated: new Date(),
        [`byType.${researchType}`]: increment(1),
      }).catch(async () => {
        await setDoc(researchRef, {
          totalCompletions: 1,
          totalDuration: duration,
          lastUpdated: new Date(),
          byType: { [researchType]: 1 },
        });
      });
    } catch (error) {
      console.error('Error tracking research completion:', error);
    }
  }

  // Track performance metrics
  async trackPerformance(apiLatency: number, cacheHit: boolean, success: boolean): Promise<void> {
    try {
      const perfRef = doc(db, 'analytics', 'performance');
      await updateDoc(perfRef, {
        totalRequests: increment(1),
        totalLatency: increment(apiLatency),
        cacheHits: increment(cacheHit ? 1 : 0),
        successfulRequests: increment(success ? 1 : 0),
        lastUpdated: new Date(),
      }).catch(async () => {
        await setDoc(perfRef, {
          totalRequests: 1,
          totalLatency: apiLatency,
          cacheHits: cacheHit ? 1 : 0,
          successfulRequests: success ? 1 : 0,
          lastUpdated: new Date(),
        });
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // Get analytics dashboard data
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const [searchDoc, popularDoc, researchDoc, performanceDoc] = await Promise.all([
        getDoc(doc(db, 'analytics', 'searches')),
        getDoc(doc(db, 'analytics', 'popularSongs')),
        getDoc(doc(db, 'analytics', 'research')),
        getDoc(doc(db, 'analytics', 'performance')),
      ]);

      // Get top search queries
      const searchQueriesQuery = query(
        collection(db, 'searchQueries'),
        orderBy('count', 'desc'),
        limit(10)
      );
  const searchQueriesSnapshot = await getDocs(searchQueriesQuery);

  // Build a simple top queries list for debugging / visibility
  const topQueries = searchQueriesSnapshot.docs.map(d => ({ query: d.id, count: (d.data() as any).count }));
  console.debug('Top search queries:', topQueries.slice(0, 10));

      // Parse popular songs
      const popularSongs = popularDoc.exists() 
        ? Object.values(popularDoc.data().songs || {}).sort((a: any, b: any) => b.count - a.count).slice(0, 10)
        : [];

      // Calculate performance metrics
      const perfData = performanceDoc.data();
      const performanceMetrics = perfData ? {
        apiLatency: perfData.totalLatency / perfData.totalRequests,
        cacheHitRate: (perfData.cacheHits / perfData.totalRequests) * 100,
        successRate: (perfData.successfulRequests / perfData.totalRequests) * 100,
        averageResponseTime: perfData.totalLatency / perfData.totalRequests,
      } : {
        apiLatency: 0,
        cacheHitRate: 0,
        successRate: 0,
        averageResponseTime: 0,
      };

      // Calculate research metrics
      const researchData = researchDoc.data();
      const researchMetrics = researchData ? {
        totalResearches: researchData.totalCompletions || 0,
        completedResearches: researchData.totalCompletions || 0,
        averageResearchTime: researchData.totalDuration / researchData.totalCompletions || 0,
        popularResearchTopics: Object.keys(researchData.byType || {}),
      } : {
        totalResearches: 0,
        completedResearches: 0,
        averageResearchTime: 0,
        popularResearchTopics: [],
      };

      return {
        searchQueries: searchDoc.exists() ? searchDoc.data().totalSearches : 0,
        popularSongs: popularSongs as any[],
        userEngagement: {
          averageSessionTime: (Date.now() - this.sessionStartTime) / 1000,
          pagesPerSession: this.pageViews,
          bounceRate: this.pageViews <= 1 ? 100 : 0,
        },
        performanceMetrics,
        researchMetrics,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        searchQueries: 0,
        popularSongs: [],
        userEngagement: {
          averageSessionTime: 0,
          pagesPerSession: 0,
          bounceRate: 100,
        },
        performanceMetrics: {
          apiLatency: 0,
          cacheHitRate: 0,
          successRate: 0,
          averageResponseTime: 0,
        },
        researchMetrics: {
          totalResearches: 0,
          completedResearches: 0,
          averageResearchTime: 0,
          popularResearchTopics: [],
        },
      };
    }
  }

  // Track user session
  trackPageView(): void {
    this.pageViews++;
  }

  // Get session metrics
  getSessionMetrics() {
    return {
      sessionTime: (Date.now() - this.sessionStartTime) / 1000,
      pageViews: this.pageViews,
      searchCount: this.searchCount,
    };
  }
}

export default AnalyticsService;