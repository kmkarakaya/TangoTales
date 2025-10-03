/**
 * Title Formatting Utilities
 * 
 * This file contains utilities to format song titles consistently,
 * ensuring proper capitalization regardless of user input.
 */

/**
 * Capitalize the first letter of each word in a title
 * Handles special cases for tango titles and preserves certain lowercase words
 */
export const formatSongTitle = (title: string): string => {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // Trim whitespace and normalize to single spaces
  const cleanTitle = title.trim().replace(/\s+/g, ' ');
  
  if (cleanTitle.length === 0) {
    return '';
  }

  // Words that should remain lowercase (articles, prepositions, conjunctions)
  // These are common in tango titles
  const lowercaseWords = new Set([
    'a', 'an', 'and', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'up',
    'el', 'la', 'los', 'las', 'un', 'una', 'y', 'de', 'del', 'en', 'con', 'por', 'para',
    'le', 'du', 'de', 'et', 'à', 'au', 'aux', 'dans', 'sur', 'avec', 'pour'
  ]);

  // Split the title into words and process each word
  const words = cleanTitle.toLowerCase().split(' ');
  
  const formattedWords = words.map((word, index) => {
    // Always capitalize the first and last word
    if (index === 0 || index === words.length - 1) {
      return capitalizeWord(word);
    }
    
    // Check if word should remain lowercase
    if (lowercaseWords.has(word)) {
      return word;
    }
    
    // Capitalize all other words
    return capitalizeWord(word);
  });

  return formattedWords.join(' ');
};

/**
 * Capitalize a single word, handling special characters and accents
 */
const capitalizeWord = (word: string): string => {
  if (!word) return word;
  
  // Handle words with apostrophes (like "L'amour")
  if (word.includes("'")) {
    const parts = word.split("'");
    return parts.map(part => 
      part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part
    ).join("'");
  }
  
  // Handle words with hyphens (like "Bien-Aimée")
  if (word.includes('-')) {
    const parts = word.split('-');
    return parts.map(part => 
      part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part
    ).join('-');
  }
  
  // Standard capitalization
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/**
 * Generate a URL-friendly ID from a formatted title
 */
export const generateSongId = (title: string): string => {
  const formattedTitle = formatSongTitle(title);
  
  return formattedTitle
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate and format a song title before saving to database
 * This is the main function to use when processing user input
 */
export const prepareTitle = (userInput: string): string => {
  if (!userInput || typeof userInput !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  const formatted = formatSongTitle(userInput);
  
  if (formatted.length === 0) {
    throw new Error('Title cannot be empty after formatting');
  }

  if (formatted.length > 200) {
    throw new Error('Title is too long (maximum 200 characters)');
  }

  return formatted;
};