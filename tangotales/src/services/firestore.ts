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
import { Song, Rating } from '../types/song';

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
  id,
  title: data.title || '',
  explanation: data.explanation || '',
  sources: data.sources || [],
  createdAt: convertTimestamp(data.createdAt),
  searchCount: data.searchCount || 0,
  averageRating: data.averageRating || 0,
  totalRatings: data.totalRatings || 0,
  tags: data.tags || []
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
 * Search songs by title (case-insensitive partial match)
 */
export const searchSongsByTitle = async (searchQuery: string): Promise<Song[]> => {
  try {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }

    // Since Firestore doesn't support case-insensitive queries natively,
    // we fetch all songs and filter client-side
    // This is acceptable for small datasets (free tier constraint)
    // Order by createdAt desc to show newly researched songs first
    const q = query(
      collection(db, 'songs'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allSongs = querySnapshot.docs.map(doc => convertSongData(doc.id, doc.data()));
    
    // Filter songs by case-insensitive title match (with Unicode normalization for accented characters)
    const filteredSongs = allSongs.filter(song => {
      const titleLower = song.title.toLowerCase();
      const titleNormalized = song.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const queryNormalized = normalizedQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Check both original and normalized versions
      return titleLower.includes(normalizedQuery) || 
             titleNormalized.includes(queryNormalized);
    });
    
    return filteredSongs.slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching songs by title:', error);
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
export const createSong = async (songData: Omit<Song, 'id' | 'createdAt' | 'searchCount' | 'averageRating' | 'totalRatings'>): Promise<string> => {
  try {
    // Generate a document ID from the song title (URL-friendly)
    const songId = songData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newSong = {
      title: songData.title,
      explanation: songData.explanation,
      sources: songData.sources,
      tags: songData.tags,
      createdAt: Timestamp.now(),
      searchCount: 1, // Initialize with 1 since it was just searched
      averageRating: 0,
      totalRatings: 0
    };

    await setDoc(doc(db, 'songs', songId), newSong);
    return songId;
  } catch (error) {
    console.error('Error creating song:', error);
    throw new Error('Failed to create song');
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