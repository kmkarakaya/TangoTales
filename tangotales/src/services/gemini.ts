import { GoogleGenAI } from '@google/genai';
import { config } from '../utils/config';
import { GeminiResponse } from '../types/song';

// Initialize Gemini AI client
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export interface ResearchSongParams {
  title: string;
  artist?: string;
}

export interface ResearchSongResult {
  title: string;
  explanation: string;
  sources: string[];
  tags: string[];
}

/**
 * Research a tango song using Gemini AI
 */
export const researchSongWithAI = async (params: ResearchSongParams): Promise<ResearchSongResult> => {
  if (!config.gemini.apiKey) {
    throw new Error('Gemini AI API key not configured');
  }

  try {
    const prompt = createResearchPrompt(params.title, params.artist);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a tango song expert. You know Argentine tango, history and culture. You can also search web for resources.',
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    // Parse JSON response
    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini AI');
    }
    
    const aiData = parseAIResponse(responseText);
    
    // Convert AI response to Song-compatible format
    const explanation = `${aiData.title_meaning}\n\n${aiData.cultural_notes}`;
    const tags = [aiData.date, 'tango', 'AI-researched']; // Basic tags, could be enhanced
    
    return {
      title: aiData.title,
      explanation: explanation,
      sources: aiData.sources,
      tags: tags
    };
  } catch (error) {
    console.error('Gemini AI research error:', error);
    throw new Error('Failed to research song with AI. Please try again.');
  }
};

/**
 * Create a structured prompt for Gemini AI
 */
const createResearchPrompt = (title: string, artist?: string): string => {
  const songIdentifier = artist ? `"${title}" by ${artist}` : `"${title}"`;
  
  return `prepare info about the tango song ${songIdentifier} and return it as a json object like: {title: string, date: string, title_meaning: string, cultural_notes: string, sources: [string]}

Guidelines for the response:
- title: The exact name of the tango song
- date: When the song was written (year or approximate period)
- title_meaning: What the title means and any translation from Spanish to English
- cultural_notes: Historical context, composer/lyricist info, cultural significance, story behind the song, notable performances or recordings (2-3 paragraphs)
- sources: Array of realistic website URLs where more info could be found

Research the tango song: ${songIdentifier}`;
};

/**
 * Parse AI response from JSON string
 */
const parseAIResponse = (responseText: string): GeminiResponse => {
  try {
    // Clean the response text (remove markdown code blocks if present)
    const cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    if (!parsed.title || !parsed.date || !parsed.title_meaning || !parsed.cultural_notes || !Array.isArray(parsed.sources)) {
      throw new Error('Invalid AI response structure');
    }
    
    return {
      title: parsed.title,
      date: parsed.date,
      title_meaning: parsed.title_meaning,
      cultural_notes: parsed.cultural_notes,
      sources: parsed.sources
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
};

const geminiService = {
  researchSongWithAI
};

export default geminiService;