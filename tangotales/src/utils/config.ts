// Environment configuration utility
export const config = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  },
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  },
  app: {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  }
};

// Validation function to check if required environment variables are set
export const validateConfig = (): string[] => {
  const errors: string[] = [];
  
  if (!config.firebase.apiKey) {
    errors.push('REACT_APP_FIREBASE_API_KEY is required');
  }
  
  if (!config.firebase.projectId) {
    errors.push('REACT_APP_FIREBASE_PROJECT_ID is required');
  }
  
  if (!config.gemini.apiKey) {
    errors.push('REACT_APP_GEMINI_API_KEY is required');
  }
  
  return errors;
};

export default config;