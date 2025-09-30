/**
 * Firebase Service Test Utilities
 * 
 * This file contains utilities to test Firebase connectivity and basic operations.
 * Use these functions to verify that Firebase is properly configured.
 */

import { db } from './firebase';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';

/**
 * Test Firebase connection
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to read from Firestore
    const testQuery = query(collection(db, 'songs'), limit(1));
    await getDocs(testQuery);
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

/**
 * Test Firestore read operations
 */
export const testFirestoreRead = async (): Promise<boolean> => {
  try {
    // Try to read a document (even if it doesn't exist)
    const testDoc = doc(db, 'songs', 'test-song');
    await getDoc(testDoc);
    console.log('✅ Firestore read operation successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore read operation failed:', error);
    return false;
  }
};

/**
 * Validate Firebase configuration
 */
export const validateFirebaseConfig = (): boolean => {
  const requiredKeys = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingKeys);
    console.error('Please check your .env.local file and ensure all Firebase configuration variables are set.');
    return false;
  }

  console.log('✅ All Firebase environment variables are configured');
  return true;
};

/**
 * Run all Firebase tests
 */
export const runFirebaseTests = async (): Promise<void> => {
  console.log('🔥 Running Firebase connectivity tests...');
  
  // Check configuration
  const configValid = validateFirebaseConfig();
  if (!configValid) {
    console.log('❌ Firebase configuration is invalid. Please check your environment variables.');
    return;
  }

  // Test connection
  const connectionTest = await testFirebaseConnection();
  
  // Test read operations
  const readTest = await testFirestoreRead();

  if (connectionTest && readTest) {
    console.log('🎉 All Firebase tests passed! Your Firebase integration is working correctly.');
  } else {
    console.log('⚠️ Some Firebase tests failed. Please check your Firebase project configuration.');
  }
};