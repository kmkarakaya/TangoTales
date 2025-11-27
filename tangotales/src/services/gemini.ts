import { GoogleGenAI } from '@google/genai';
import { config } from '../utils/config';
import { GeminiResponse } from '../types/song';
import { filterValidUrls } from '../utils/urlValidator';
import { extractGroundingUrlStrings } from '../utils/groundingExtractor';

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
 * Research a tango song using Gemini AI with Google Search grounding
 */
export const researchSongWithAI = async (params: ResearchSongParams): Promise<ResearchSongResult> => {
  if (!config.gemini.apiKey) {
    throw new Error('Gemini AI API key not configured');
  }

  try {
    const prompt = createResearchPrompt(params.title, params.artist);
    
    console.log('🔍 Calling Gemini with Google Search grounding enabled');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a tango song expert. You know Argentine tango, history and culture. Search the web for accurate, current information.',
        temperature: 0.7,
        maxOutputTokens: 2000,
        tools: [{ googleSearch: {} }]  // ✅ Enable Google Search grounding
      }
    });

    // ✅ Extract REAL URLs from grounding metadata (not from AI-generated text)
    const groundingUrls = extractGroundingUrlStrings(response);
    console.log(`🔍 Found ${groundingUrls.length} URLs from search grounding`);
    
    // ✅ Validate URLs before using them
    const validatedUrls = await filterValidUrls(groundingUrls, 3);
    console.log(`✅ ${validatedUrls.length} URLs validated successfully`);

    // Parse JSON response for structured data
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
      sources: validatedUrls,  // ✅ Use validated URLs from grounding metadata, NOT from AI text
      tags: tags
    };
  } catch (error) {
    console.error('Gemini AI research error:', error);
    throw new Error('Failed to research song with AI. Please try again.');
  }
};

/**
 * Create a structured prompt for Gemini AI with Search Grounding
 */
const createResearchPrompt = (title: string, artist?: string): string => {
  const songIdentifier = artist ? `"${title}" by ${artist}` : `"${title}"`;
  
  return `Search the web for information about the tango song ${songIdentifier} and provide a JSON response with this structure:

{
  "title": "exact song title",
  "date": "year or period when written",
  "title_meaning": "what the title means and translation if Spanish",
  "cultural_notes": "historical context, composer/lyricist, cultural significance, story, notable performances (2-3 paragraphs)",
  "sources": []
}

IMPORTANT: 
- Do NOT include URLs in the "sources" field - they will be extracted automatically from search results
- Focus on accurate, verifiable information from authoritative tango sources
- Search for reliable tango databases, archives, and music history sites
- Provide rich cultural and historical context

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