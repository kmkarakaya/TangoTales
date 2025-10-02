import { createSong } from '../services/firestore';
import { Song } from '../types/song';

// Sample tango songs for testing
const sampleSongs: Omit<Song, 'id' | 'createdAt' | 'searchCount' | 'averageRating' | 'totalRatings'>[] = [
  {
    title: "La Cumparsita",
    explanation: "La Cumparsita is arguably the most famous tango song of all time. Composed by Gerardo Matos Rodríguez in 1916, this iconic piece has become synonymous with Argentine tango culture worldwide. The title means 'The Little Parade' and originally had a carnival march rhythm before being transformed into the passionate tango we know today. The song has been recorded by countless artists and remains a cornerstone of any tango orchestra's repertoire. Its haunting melody captures the essence of longing and melancholy that defines the tango genre.",
    sources: [
      "https://en.wikipedia.org/wiki/La_Cumparsita",
      "https://www.todotango.com/music/theme/1/La-Cumparsita/"
    ],
    tags: ["classic", "1916", "Gerardo Matos Rodríguez", "iconic", "traditional", "golden age"]
  },
  {
    title: "Por Una Cabeza",
    explanation: "Por Una Cabeza is one of the most recognizable tangos in popular culture, composed by Carlos Gardel with lyrics by Alfredo Le Pera in 1935. The title translates to 'By a Head' and uses horse racing as a metaphor for gambling and romance. The song has gained international fame through its use in Hollywood films, particularly in 'Scent of a Woman' and 'True Lies'. Gardel's passionate performance style and the song's dramatic crescendos make it a favorite among dancers and listeners alike. The piece perfectly embodies the Argentine concept of 'arrabal' - the outskirts of Buenos Aires where tango was born.",
    sources: [
      "https://en.wikipedia.org/wiki/Por_una_cabeza",
      "https://www.carlosgardel.com.ar/"
    ],
    tags: ["Carlos Gardel", "1935", "Alfredo Le Pera", "Hollywood", "horse racing", "romance", "arrabal"]
  },
  {
    title: "El Choclo",
    explanation: "El Choclo, composed by Ángel Villoldo in 1903, is one of the earliest and most influential tangos ever written. The title refers to corn on the cob, a humble food that became a metaphor for the simple pleasures of Buenos Aires street life. Villoldo, often called the 'Father of Tango', created this piece during tango's formative years when it was still considered music of the lower classes. The song's playful melody and rhythmic complexity helped establish many of the musical conventions that would define tango for generations. El Choclo represents the transition from tango's folk roots to its more sophisticated orchestral arrangements.",
    sources: [
      "https://en.wikipedia.org/wiki/El_Choclo",
      "https://www.todotango.com/music/theme/17/El-Choclo/"
    ],
    tags: ["Ángel Villoldo", "1903", "early tango", "Buenos Aires", "street life", "folk roots", "foundational"]
  },
  {
    title: "Adiós Nonino",
    explanation: "Adiós Nonino is a masterpiece by Astor Piazzolla, composed in 1959 as a tribute to his father who had just passed away. 'Nonino' was Piazzolla's childhood nickname for his father. This deeply personal composition marked a turning point in Piazzolla's career, showcasing his revolutionary 'nuevo tango' style that incorporated elements of jazz and classical music. The piece is known for its emotional intensity and complex harmonies, breaking away from traditional tango conventions while maintaining its emotional core. Adiós Nonino has become one of the most recorded and performed tangos of the modern era, cementing Piazzolla's legacy as a tango innovator.",
    sources: [
      "https://en.wikipedia.org/wiki/Adiós_Nonino",
      "https://www.piazzolla.org/"
    ],
    tags: ["Astor Piazzolla", "1959", "nuevo tango", "tribute", "jazz fusion", "modern", "innovation", "emotional"]
  },
  {
    title: "Libertango",
    explanation: "Libertango, composed by Astor Piazzolla in 1974, represents the ultimate expression of 'nuevo tango' - a revolutionary fusion of traditional tango with jazz and classical elements. The title combines 'liberty' and 'tango', symbolizing Piazzolla's liberation from traditional tango constraints. Written during his time in Italy, the piece features complex rhythms, dissonant harmonies, and extended techniques that shocked traditional tango purists but attracted a new international audience. Libertango has been adapted for various instruments and ensembles, becoming one of the most recognizable pieces of contemporary Argentine music and helping to bring tango to concert halls worldwide.",
    sources: [
      "https://en.wikipedia.org/wiki/Libertango",
      "https://www.astor-piazzolla.com/"
    ],
    tags: ["Astor Piazzolla", "1974", "nuevo tango", "jazz fusion", "contemporary", "international", "revolutionary"]
  }
];

/**
 * Populate the database with sample tango songs for testing
 * This function should only be called in development environment
 */
export const populateWithSampleSongs = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Sample data population is only available in development mode');
    return;
  }

  console.log('🎵 Populating database with sample tango songs...');
  
  try {
    const results = await Promise.allSettled(
      sampleSongs.map(async (songData) => {
        try {
          const songId = await createSong(songData);
          console.log(`✅ Created song: ${songData.title} (ID: ${songId})`);
          return { success: true, title: songData.title, id: songId };
        } catch (error) {
          console.error(`❌ Failed to create song: ${songData.title}`, error);
          return { success: false, title: songData.title, error };
        }
      })
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.length - successful;
    
    console.log(`\n🎵 Sample data population complete:`);
    console.log(`✅ Successfully created: ${successful} songs`);
    if (failed > 0) {
      console.log(`❌ Failed to create: ${failed} songs`);
    }
    console.log(`\n🎯 You can now test the search functionality!\n`);
    
  } catch (error) {
    console.error('❌ Error during sample data population:', error);
    throw error;
  }
};

/**
 * Check if sample data already exists in the database
 */
export const checkSampleDataExists = async (): Promise<boolean> => {
  try {
    // You can implement this by searching for one of the sample songs
    // For now, we'll just return false to allow re-population
    return false;
  } catch (error) {
    console.error('Error checking sample data:', error);
    return false;
  }
};

/**
 * Development utility to quickly populate sample data
 * Call this from browser console: window.populateSampleData()
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).populateSampleData = populateWithSampleSongs;
}