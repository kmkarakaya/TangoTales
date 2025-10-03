// Debug script for rating system
// Run this in browser console to test rating functionality

const testRating = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Import Firebase
    const { db } = await import('./services/firebase.js');
    const { addDoc, collection, Timestamp } = await import('firebase/firestore');
    
    console.log('✅ Firebase imported successfully');
    console.log('📊 Database reference:', db);
    
    // Test adding a simple rating
    const testRatingData = {
      songId: 'test-song-123',
      rating: 5,
      comment: 'Test rating from debug script',
      timestamp: Timestamp.now()
    };
    
    console.log('📝 Attempting to add rating:', testRatingData);
    
    const docRef = await addDoc(collection(db, 'ratings'), testRatingData);
    console.log('✅ Rating added successfully! Document ID:', docRef.id);
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Rating test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Make it available globally
window.testRating = testRating;
console.log('🚀 Debug script loaded. Run window.testRating() to test rating system');