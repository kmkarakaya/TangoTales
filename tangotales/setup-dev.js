#!/usr/bin/env node

/**
 * Local Development Setup Helper
 * Helps configure environment variables for TangoTales development
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 TangoTales Local Development Setup\n');

const envLocalPath = path.join(__dirname, '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Read and check .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const hasPlaceholder = envContent.includes('your_gemini_api_key_here');

if (hasPlaceholder) {
  console.log('⚠️  Gemini API Key Setup Required\n');
  console.log('📋 Next Steps:');
  console.log('1. Get your Gemini API key from: https://aistudio.google.com/app/apikey');
  console.log('2. Replace "your_gemini_api_key_here" in .env.local with your actual key');
  console.log('3. Or set environment variable: $env:REACT_APP_GEMINI_API_KEY = "your_key"');
  console.log('4. Run: npm start\n');
  console.log('🔒 Security Note: Never commit real API keys to git!');
  process.exit(1);
} else {
  console.log('✅ Development environment is configured!');
  console.log('🚀 Ready to run: npm start');
}