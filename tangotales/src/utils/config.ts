// Environment configuration utility with debug logging
console.log('🔧 CONFIG DEBUG - Loading environment variables');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- All env vars with GEMINI:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
console.log('- All env vars with REACT_APP:', Object.keys(process.env).filter(k => k.startsWith('REACT_APP')).length, 'total');

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

// Debug logging for loaded config
console.log('🔧 CONFIG DEBUG - Configuration loaded:');
console.log('- Firebase API Key:', config.firebase.apiKey ? `SET (${config.firebase.apiKey.length} chars)` : 'MISSING');
console.log('- Firebase Project ID:', config.firebase.projectId || 'MISSING');
console.log('- Gemini API Key:', config.gemini.apiKey ? `SET (${config.gemini.apiKey.length} chars, prefix: ${config.gemini.apiKey.substring(0, 10)}...)` : 'MISSING');
console.log('- App Environment:', config.app.environment);

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
    errors.push('GEMINI_API_KEY or REACT_APP_GEMINI_API_KEY is required');
  }
  
  return errors;
};

export default config;