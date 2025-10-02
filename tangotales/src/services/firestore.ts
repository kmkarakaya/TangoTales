import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Song, Rating, SongMetadata } from '../types/song';
import { songInformationService } from './enhancedGemini';
import { getSampleSongByTitle, createSongFromSample } from '../utils/sampleSongs';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Helper function to convert Song data from Firestore
const convertSongData = (id: string, data: DocumentData): Song => ({
  // Primary identification
  id,
  title: data.title || '',
  originalTitle: data.originalTitle,
  alternativeTitles: data.alternativeTitles || [],
  
  // Factual information
  composer: data.composer || 'Unknown',
  lyricist: data.lyricist,
  yearComposed: data.yearComposed,
  period: data.period || 'Golden Age',
  musicalForm: data.musicalForm || 'Tango',
  
  // Cultural context
  themes: data.themes || [],
  culturalSignificance: data.culturalSignificance || '',
  historicalContext: data.historicalContext || '',
  
  // Musical analysis
  keySignature: data.keySignature,
  tempo: data.tempo,
  musicalCharacteristics: data.musicalCharacteristics || [],
  danceStyle: data.danceStyle || [],
  
  // Performance information
  notableRecordings: data.notableRecordings || [],
  notablePerformers: data.notablePerformers || [],
  recommendedForDancing: data.recommendedForDancing !== undefined ? data.recommendedForDancing : true,
  danceRecommendations: data.danceRecommendations,
  
  // Narrative elements
  story: data.story,
  inspiration: data.inspiration,
  personalAnecdotes: data.personalAnecdotes,
  
  // Technical metadata (existing fields)
  explanation: data.explanation || '',
  sources: data.sources || [],
  searchCount: data.searchCount || 0,
  averageRating: data.averageRating || 0,
  totalRatings: data.totalRatings || 0,
  tags: data.tags || [],
  createdAt: convertTimestamp(data.createdAt),
  lastUpdated: convertTimestamp(data.lastUpdated || data.createdAt),
  
  // Quality assurance metadata
  metadata: data.metadata ? {
    aiResponseQuality: data.metadata.aiResponseQuality || 'partial',
    needsManualReview: data.metadata.needsManualReview || false,
    lastAIUpdate: convertTimestamp(data.metadata.lastAIUpdate),
    errorReason: data.metadata.errorReason,
    retryCount: data.metadata.retryCount || 0
  } : undefined
});

// Helper function to convert Rating data from Firestore
const convertRatingData = (id: string, data: DocumentData): Rating => ({
  id,
  songId: data.songId || '',
  rating: data.rating || 0,
  comment: data.comment,
  timestamp: convertTimestamp(data.timestamp)
});

/**
 * Get a song by its ID from Firestore
 */
export const getSongById = async (songId: string): Promise<Song | null> => {
  try {
    const songDoc = await getDoc(doc(db, 'songs', songId));
    if (songDoc.exists()) {
      return convertSongData(songDoc.id, songDoc.data());
    }
    return null;
  } catch (error) {
    console.error('Error getting song by ID:', error);
    throw new Error('Failed to retrieve song');
  }
};

/**
 * Phase 1 Enhanced Search: AI-powered search with Clean Slate Approach
 * If song not found, generate comprehensive information using AI and save it
 */
export const searchSongsByTitle = async (searchQuery: string): Promise<Song[]> => {
  try {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }

    // First, search existing songs in database
    const q = query(
      collection(db, 'songs'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allSongs = querySnapshot.docs.map(doc => convertSongData(doc.id, doc.data()));
    
    // Filter songs by case-insensitive title match
    const filteredSongs = allSongs.filter(song => {
      const titleLower = song.title.toLowerCase();
      const titleNormalized = song.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const queryNormalized = normalizedQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      return titleLower.includes(normalizedQuery) || 
             titleNormalized.includes(queryNormalized);
    });
    
    // If we found existing songs, return them
    if (filteredSongs.length > 0) {
      // Increment search counts for found songs
      filteredSongs.forEach(song => {
        incrementSearchCount(song.id).catch(console.error);
      });
      return filteredSongs.slice(0, 10);
    }

    // No songs found - return empty array to allow user-controlled AI generation
    // The NoResultsFound component will show "Research with AI" button
    return [];
    
  } catch (error) {
    console.error('Error in enhanced search:', error);
    throw new Error('Failed to search songs');
  }
};

/**
 * Get popular songs ordered by search count
 */
export const getPopularSongs = async (limitCount: number = 10): Promise<Song[]> => {
  try {
    const q = query(
      collection(db, 'songs'),
      orderBy('searchCount', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertSongData(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting popular songs:', error);
    throw new Error('Failed to retrieve popular songs');
  }
};

/**
 * Get songs starting with a specific letter
 */
export const getSongsByLetter = async (letter: string): Promise<Song[]> => {
  try {
    const targetLetter = letter.toLowerCase();
    
    // Fetch all songs and filter client-side to handle Unicode characters properly
    // This approach is consistent with searchSongsByTitle and handles accented characters
    const q = query(
      collection(db, 'songs'),
      orderBy('title', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const allSongs = querySnapshot.docs.map(doc => convertSongData(doc.id, doc.data()));
    
    // Filter songs that start with the specified letter (case-insensitive, Unicode-aware)
    const filteredSongs = allSongs.filter(song => {
      // Normalize both strings to handle accented characters
      const normalizedTitle = song.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedLetter = targetLetter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Check both original and normalized versions
      return song.title.toLowerCase().startsWith(targetLetter) || 
             normalizedTitle.startsWith(normalizedLetter);
    });
    
    return filteredSongs.slice(0, 50); // Limit to 50 results
  } catch (error) {
    console.error('Error getting songs by letter:', error);
    throw new Error('Failed to retrieve songs by letter');
  }
};

/**
 * Create a new song in Firestore
 */
export const createSong = async (songData: Omit<Song, 'id' | 'createdAt' | 'lastUpdated' | 'searchCount' | 'averageRating' | 'totalRatings'>): Promise<string> => {
  try {
    // Generate a document ID from the song title (URL-friendly)
    const songId = songData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const now = Timestamp.now();
    const newSong = {
      // Primary identification
      title: songData.title,
      originalTitle: songData.originalTitle,
      alternativeTitles: songData.alternativeTitles || [],
      
      // Factual information
      composer: songData.composer || 'Unknown',
      lyricist: songData.lyricist,
      yearComposed: songData.yearComposed,
      period: songData.period || 'Golden Age',
      musicalForm: songData.musicalForm || 'Tango',
      
      // Cultural context
      themes: songData.themes || [],
      culturalSignificance: songData.culturalSignificance || '',
      historicalContext: songData.historicalContext || '',
      
      // Musical analysis
      keySignature: songData.keySignature,
      tempo: songData.tempo,
      musicalCharacteristics: songData.musicalCharacteristics || [],
      danceStyle: songData.danceStyle || [],
      
      // Performance information
      notableRecordings: songData.notableRecordings || [],
      notablePerformers: songData.notablePerformers || [],
      recommendedForDancing: songData.recommendedForDancing !== undefined ? songData.recommendedForDancing : true,
      danceRecommendations: songData.danceRecommendations,
      
      // Narrative elements
      story: songData.story,
      inspiration: songData.inspiration,
      personalAnecdotes: songData.personalAnecdotes,
      
      // Technical metadata
      explanation: songData.explanation || '',
      sources: songData.sources || [],
      tags: songData.tags || [],
      createdAt: now,
      lastUpdated: now,
      searchCount: 1, // Initialize with 1 since it was just searched
      averageRating: 0,
      totalRatings: 0,
      
      // Quality assurance metadata
      metadata: songData.metadata
    };

    await setDoc(doc(db, 'songs', songId), newSong);
    return songId;
  } catch (error) {
    console.error('Error creating song:', error);
    throw new Error('Failed to create song');
  }
};

/**
 * Create an enhanced song from AI-generated data
 */
export const createEnhancedSong = async (
  title: string, 
  enhancedData: any,
  metadata: any
): Promise<string> => {
  try {
    // Generate a document ID from the song title (URL-friendly)
    const songId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const now = Timestamp.now();
    // Sanitize data to ensure Firebase compatibility (no undefined values)
    const sanitizeValue = (value: any) => value === undefined ? null : value;
    
    const enhancedSong = {
      // Primary identification
      title: title,
      originalTitle: sanitizeValue(enhancedData.originalTitle),
      alternativeTitles: enhancedData.alternativeTitles || [],
      
      // Factual information from AI
      composer: enhancedData.composer || 'Unknown',
      lyricist: sanitizeValue(enhancedData.lyricist),
      yearComposed: sanitizeValue(enhancedData.yearComposed),
      period: enhancedData.period || 'Golden Age',
      musicalForm: enhancedData.musicalForm || 'Tango',
      
      // Cultural context from AI
      themes: enhancedData.themes || [],
      culturalSignificance: enhancedData.culturalSignificance || '',
      historicalContext: enhancedData.historicalContext || '',
      
      // Musical analysis from AI
      keySignature: sanitizeValue(enhancedData.keySignature),
      tempo: sanitizeValue(enhancedData.tempo),
      musicalCharacteristics: enhancedData.musicalCharacteristics || [],
      danceStyle: enhancedData.danceStyle || [],
      
      // Performance information from AI
      notableRecordings: enhancedData.notableRecordings || [],
      notablePerformers: enhancedData.notablePerformers || [],
      recommendedForDancing: enhancedData.recommendedForDancing !== undefined ? 
        enhancedData.recommendedForDancing : true,
      danceRecommendations: sanitizeValue(enhancedData.danceRecommendations),
      
      // Narrative elements from AI
      story: sanitizeValue(enhancedData.story),
      inspiration: sanitizeValue(enhancedData.inspiration),
      personalAnecdotes: sanitizeValue(enhancedData.personalAnecdotes),
      
      // Technical metadata
      explanation: enhancedData.explanation || '',
      sources: enhancedData.sources || [],
      tags: enhancedData.themes || [],
      createdAt: now,
      lastUpdated: now,
      searchCount: 1,
      averageRating: 0,
      totalRatings: 0,
      
      // AI Quality metadata
      metadata: {
        aiResponseQuality: metadata.aiResponseQuality || 'partial',
        needsManualReview: metadata.needsManualReview || false,
        lastAIUpdate: metadata.lastAIUpdate instanceof Date ? 
          Timestamp.fromDate(metadata.lastAIUpdate) : now,
        errorReason: sanitizeValue(metadata.errorReason),
        retryCount: metadata.retryCount || 0
      }
    };

    await setDoc(doc(db, 'songs', songId), enhancedSong);
    return songId;
  } catch (error) {
    console.error('Error creating enhanced song:', error);
    throw new Error('Failed to create enhanced song');
  }
};

/**
 * Update an existing song in Firestore
 */
export const updateSong = async (songId: string, updates: Partial<Song>): Promise<void> => {
  try {
    const songRef = doc(db, 'songs', songId);
    const updateData: any = { ...updates };
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(songRef, updateData);
  } catch (error) {
    console.error('Error updating song:', error);
    throw new Error('Failed to update song');
  }
};

/**
 * Increment the search count for a song
 */
export const incrementSearchCount = async (songId: string): Promise<void> => {
  try {
    const songRef = doc(db, 'songs', songId);
    await updateDoc(songRef, {
      searchCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing search count:', error);
    // Don't throw error for search count increment failures
    // as it's not critical to the user experience
  }
};

/**
 * Add a rating for a song
 */
export const addRating = async (ratingData: Omit<Rating, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const newRating = {
      songId: ratingData.songId,
      rating: ratingData.rating,
      comment: ratingData.comment,
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'ratings'), newRating);
    
    // Update the song's average rating
    await updateSongRating(ratingData.songId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding rating:', error);
    throw new Error('Failed to add rating');
  }
};

/**
 * Get all ratings for a specific song
 */
export const getRatingsBySong = async (songId: string): Promise<Rating[]> => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('songId', '==', songId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertRatingData(doc.id, doc.data()));
  } catch (error) {
    console.error('Error getting ratings by song:', error);
    throw new Error('Failed to retrieve ratings');
  }
};

/**
 * Update a song's average rating based on all its ratings
 */
const updateSongRating = async (songId: string): Promise<void> => {
  try {
    const ratings = await getRatingsBySong(songId);
    
    if (ratings.length === 0) {
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await updateDoc(doc(db, 'songs', songId), {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error updating song rating:', error);
    // Don't throw error as this is an internal operation
  }
};

/**
 * Get total count of songs in the database
 */
export const getSongCount = async (): Promise<number> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'songs'));
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting song count:', error);
    return 0;
  }
};

/**
 * Get a random selection of songs
 */
export const getRandomSongs = async (count: number = 5): Promise<Song[]> => {
  try {
    // Get all songs first (this is acceptable for free tier with limited data)
    const querySnapshot = await getDocs(collection(db, 'songs'));
    const allSongs = querySnapshot.docs.map(doc => convertSongData(doc.id, doc.data()));
    
    // Shuffle and return random selection
    const shuffled = allSongs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error getting random songs:', error);
    throw new Error('Failed to retrieve random songs');
  }
};

/**
 * Check if a song exists by title (case-insensitive exact match)
 */
export const songExistsByTitle = async (title: string): Promise<Song | null> => {
  try {
    const normalizedTitle = title.toLowerCase().trim();
    
    // Query for exact title match
    const q = query(
      collection(db, 'songs'),
      where('title', '==', normalizedTitle),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return convertSongData(doc.id, doc.data());
    }

    // If no exact match, try case variations
    const variations = [
      title, // Original case
      title.toLowerCase(),
      title.toUpperCase(),
      title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
    ];

    for (const variation of variations) {
      const variationQuery = query(
        collection(db, 'songs'),
        where('title', '==', variation),
        limit(1)
      );

      const variationSnapshot = await getDocs(variationQuery);
      if (!variationSnapshot.empty) {
        const doc = variationSnapshot.docs[0];
        return convertSongData(doc.id, doc.data());
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking if song exists:', error);
    throw new Error('Failed to check song existence');
  }
};

/**
 * Create a new song using AI generation - user-controlled
 * This is called when user explicitly clicks "Search with AI"
 */
export const createSongWithAI = async (songTitle: string): Promise<Song | null> => {
  try {
    console.log(`🤖 User requested AI research for: "${songTitle}"`);
    
    // Try AI generation first
    try {
      const aiResult = await songInformationService.getEnhancedSongInformation({
        title: songTitle
      });
      
      // Create enhanced song with AI data
      const songId = await createEnhancedSong(
        songTitle,
        aiResult,
        {
          aiResponseQuality: 'good',
          needsManualReview: false,
          lastAIUpdate: new Date(),
          retryCount: 0
        }
      );

      // Fetch the created song to return
      const enhancedSong = await getSongById(songId);
      console.log(`✅ Created enhanced song via user request: "${enhancedSong?.title}"`);
      
      return enhancedSong;
      
    } catch (aiError) {
      console.error('AI generation failed, trying sample data:', aiError);
      
      // Try to use sample song data as fallback
      const sampleData = getSampleSongByTitle(songTitle);
      
      if (sampleData) {
        console.log(`📋 Using sample data for user request: "${songTitle}"`);
        
        // Create song ID from title
        const songId = songTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Create complete song from sample data
        const enhancedSong = createSongFromSample(sampleData, songTitle, songId);
        
        // Convert to Firebase format and save
        const now = Timestamp.now();
        const firestoreData = {
          ...enhancedSong,
          createdAt: now,
          lastUpdated: now,
          metadata: {
            ...enhancedSong.metadata,
            lastAIUpdate: now
          }
        };
        
        await setDoc(doc(db, 'songs', songId), firestoreData);
        console.log(`✅ Created song from sample via user request: "${enhancedSong.title}"`);
        
        return enhancedSong;
      }
      
      // Final fallback: Create basic song entry
      const songId = await createEnhancedSong(
        songTitle,
        {
          composer: 'Unknown',
          period: 'Golden Age',
          musicalForm: 'Tango',
          themes: ['tango'],
          culturalSignificance: `Research for "${songTitle}" has been initiated. This appears to be a tango composition from the Argentine musical tradition.`,
          historicalContext: 'Detailed historical information is being researched and will be updated shortly.',
          explanation: `"${songTitle}" has been added to our research queue. Our AI research indicates this is likely a tango composition, but detailed information is still being compiled.`,
          musicalCharacteristics: ['traditional tango rhythm'],
          danceStyle: ['classic tango'],
          notableRecordings: [],
          notablePerformers: [],
          recommendedForDancing: true,
          sources: []
        },
        {
          aiResponseQuality: 'basic',
          needsManualReview: true,
          lastAIUpdate: new Date(),
          retryCount: 1,
          errorReason: aiError instanceof Error ? aiError.message : 'AI research in progress'
        }
      );

      // Fetch the created song to return
      const basicSong = await getSongById(songId);
      console.log(`✅ Created basic song via user request: "${songTitle}"`);
      return basicSong;
    }
    
  } catch (error) {
    console.error('Failed to create song with AI:', error);
    throw new Error(`Failed to research song: ${songTitle}`);
  }
};

/**
 * Update an existing song with enhanced AI-generated data
 */
export const updateSongWithEnhancedData = async (
  songId: string,
  aiResult: any,
  metadata: SongMetadata
): Promise<void> => {
  try {
    const now = Timestamp.now();
    
    // Prepare the update data with enhanced information
    const updateData = {
      // Enhanced factual information
      composer: aiResult.composer || 'Unknown',
      lyricist: aiResult.lyricist || undefined,
      yearComposed: aiResult.yearComposed || undefined,
      period: aiResult.period || 'Golden Age',
      musicalForm: aiResult.musicalForm || 'Tango',
      
      // Enhanced cultural context
      themes: aiResult.themes || [],
      culturalSignificance: aiResult.culturalSignificance || '',
      historicalContext: aiResult.historicalContext || '',
      
      // Enhanced musical analysis
      keySignature: aiResult.keySignature || undefined,
      tempo: aiResult.tempo || undefined,
      musicalCharacteristics: aiResult.musicalCharacteristics || [],
      danceStyle: aiResult.danceStyle || [],
      
      // Enhanced performance information
      notableRecordings: aiResult.notableRecordings || [],
      notablePerformers: aiResult.notablePerformers || [],
      recommendedForDancing: aiResult.recommendedForDancing !== undefined ? aiResult.recommendedForDancing : true,
      danceRecommendations: aiResult.danceRecommendations || undefined,
      
      // Enhanced narrative elements
      story: aiResult.story || undefined,
      inspiration: aiResult.inspiration || undefined,
      
      // Updated technical fields
      explanation: aiResult.explanation || '',
      lastUpdated: now,
      
      // Updated metadata
      metadata: {
        aiResponseQuality: metadata.aiResponseQuality || 'good',
        needsManualReview: metadata.needsManualReview || false,
        lastAIUpdate: now,
        retryCount: metadata.retryCount || 0,
        errorReason: metadata.errorReason || undefined
      }
    };
    
    // Update the document in Firestore
    await updateDoc(doc(db, 'songs', songId), updateData);
    
    console.log(`✅ Updated song with enhanced data: ${songId}`);
    
  } catch (error) {
    console.error('Error updating song with enhanced data:', error);
    throw new Error('Failed to update song with enhanced data');
  }
};