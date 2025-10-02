#!/usr/bin/env node

/**
 * Environment Variable Checker for TangoTales
 * Helps verify that required environment variables are properly set
 */

// Load environment variables from .env.local file
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const envContent = fs.readFileSync(filePath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
      return true;
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${filePath}`);
  }
  return false;
}

// Load .env.local if it exists
const envLocalPath = path.join(__dirname, '.env.local');
loadEnvFile(envLocalPath);

console.log('🔍 Checking Environment Variables for TangoTales...\n');

// Check system environment variable
const geminiApiKey = process.env.GEMINI_API_KEY;
const reactGeminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

console.log('📡 Gemini AI API Configuration:');
console.log(`  GEMINI_API_KEY: ${geminiApiKey ? '✅ Set (system env)' : '❌ Not set'}`);
console.log(`  REACT_APP_GEMINI_API_KEY: ${reactGeminiApiKey ? '✅ Set (React env)' : '❌ Not set'}`);

if (geminiApiKey || reactGeminiApiKey) {
  console.log('  🔑 API Key Available: ✅ PASS');
} else {
  console.log('  🔑 API Key Available: ❌ FAIL - No API key found');
  console.log('\n📋 To fix this:');
  console.log('  Windows: $env:GEMINI_API_KEY = "your_api_key_here"');
  console.log('  Linux/Mac: export GEMINI_API_KEY="your_api_key_here"');
}

// Check Firebase environment variables
console.log('\n🔥 Firebase Configuration:');
const firebaseKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_AUTH_DOMAIN'
];

firebaseKeys.forEach(key => {
  const value = process.env[key];
  console.log(`  ${key}: ${value ? '✅ Set' : '❌ Not set'}`);
});

console.log('\n🏁 Environment Check Complete!');

// Exit with error code if critical variables are missing
const hasGeminiKey = !!(geminiApiKey || reactGeminiApiKey);
const hasFirebaseProject = !!process.env.REACT_APP_FIREBASE_PROJECT_ID;

if (!hasGeminiKey || !hasFirebaseProject) {
  console.log('❌ Critical environment variables are missing!');
  process.exit(1);
} else {
  console.log('✅ All critical environment variables are configured!');
  process.exit(0);
}