import { GoogleGenAI } from '@google/genai';
import { config } from '../utils/config';
import { SongMetadata, Recording, Performer } from '../types/song';

// Initialize Gemini AI client
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export interface EnhancedSongParams {
  title: string;
  artist?: string;
}

export interface EnhancedSongResult {
  composer: string;
  lyricist?: string;
  yearComposed?: number;
  period: 'Golden Age' | 'Pre-Golden Age' | 'Post-Golden Age' | 'Contemporary';
  musicalForm: 'Tango' | 'Vals' | 'Milonga' | 'Candombe' | 'Other';
  themes: string[];
  culturalSignificance: string;
  historicalContext: string;
  musicalCharacteristics: string[];
  danceStyle: string[];
  notableRecordings: Recording[];
  notablePerformers: Performer[];
  recommendedForDancing: boolean;
  danceRecommendations?: string;
  story?: string;
  inspiration?: string;
  explanation: string;
}

/**
 * Enhanced system prompt for comprehensive tango song information
 */
const ENHANCED_SYSTEM_PROMPT = `
You are an expert tango musicologist and historian specializing in Argentine tango music from 1880 to present. Your role is to provide comprehensive, accurate information about tango songs with deep cultural and historical context.

You must respond ONLY with a valid JSON object following this exact structure:

{
  "composer": "Full name of the composer",
  "lyricist": "Full name of the lyricist (if different from composer, otherwise null)",
  "yearComposed": number or null,
  "period": "Pre-Golden Age" | "Golden Age" | "Post-Golden Age" | "Contemporary",
  "musicalForm": "Tango" | "Vals" | "Milonga" | "Candombe" | "Other",
  "themes": ["array", "of", "main", "themes"],
  "culturalSignificance": "2-3 sentences on the song's place in tango culture",
  "historicalContext": "Historical backdrop when the song was written",
  "musicalCharacteristics": ["array", "of", "musical", "features"],
  "danceStyle": ["array", "of", "dance", "characteristics"],
  "notableRecordings": [
    {
      "artist": "Artist name",
      "orchestra": "Orchestra name or null",
      "year": number or null,
      "significance": "Brief description of significance"
    }
  ],
  "notablePerformers": [
    {
      "name": "Performer name",
      "role": "Singer" | "Orchestra Leader" | "Musician",
      "significance": "Brief description"
    }
  ],
  "recommendedForDancing": boolean,
  "danceRecommendations": "Brief guidance for dancers or null",
  "story": "The narrative told by the lyrics or null",
  "inspiration": "Background story of creation or null",
  "explanation": "Comprehensive 2-3 paragraph summary combining all aspects"
}

PERIOD DEFINITIONS:
- Pre-Golden Age: 1880-1916
- Golden Age: 1916-1955  
- Post-Golden Age: 1955-1980
- Contemporary: 1980-present

QUALITY STANDARDS:
- Use null for unknown/unreliable information
- Distinguish documented facts from interpretations
- Provide cultural context that enhances understanding
- Balance academic accuracy with accessibility
- Ensure all string values are properly escaped for JSON

Return ONLY the JSON object, no additional text or formatting.
`;

/**
 * Chat session manager for multi-turn conversations
 */
class SongInformationService {
  private chatSessions = new Map<string, any>();
  
  async getEnhancedSongInformation(params: EnhancedSongParams): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    const sessionKey = this.normalizeTitle(params.title);
    
    if (!this.chatSessions.has(sessionKey)) {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          temperature: 0.3, // Lower for factual information
          maxOutputTokens: 2048
        }
      });
      this.chatSessions.set(sessionKey, chat);
    }
    
    const chat = this.chatSessions.get(sessionKey)!;
    return this.gatherInformationWithChat(chat, params.title);
  }
  
  private async gatherInformationWithChat(chat: any, songTitle: string): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    let retryCount = 0;
    
    try {
      // Step 1: Initial comprehensive request
      const initialPrompt = `${ENHANCED_SYSTEM_PROMPT}\n\nProvide comprehensive information about the tango song: "${songTitle}"`;
      
      const response = await chat.sendMessage({ message: initialPrompt });
      let songData = this.parseAndValidateResponse(response.text);
      
      // Step 2: Targeted requests for missing required fields
      const missingRequired = this.validateRequiredFields(songData);
      if (missingRequired.length > 0) {
        retryCount++;
        const followUpPrompt = `
        I notice these required fields are missing from your previous response about "${songTitle}":
        ${missingRequired.join(', ')}
        
        Please provide ONLY these specific fields in JSON format:
        {
          ${missingRequired.map(field => `"${field}": null`).join(',\n          ')}
        }
        `;
        
        const followUpResponse = await chat.sendMessage({ message: followUpPrompt });
        const additionalData = this.parseJSONWithRepair(followUpResponse.text);
        songData = { ...songData, ...additionalData };
      }
      
      // Step 3: Optional enhancement for incomplete data (only if few missing)
      const missingOptional = this.identifyMissingOptionalFields(songData);
      if (missingOptional.length > 0 && missingOptional.length <= 3) {
        const enhancementPrompt = `
        For "${songTitle}", can you provide additional details for these fields if available:
        ${missingOptional.join(', ')}
        
        Return JSON with only the available information. Use null for unknown fields.
        `;
        
        try {
          const enhancementResponse = await chat.sendMessage({ message: enhancementPrompt });
          const enhancementData = this.parseJSONWithRepair(enhancementResponse.text);
          songData = { ...songData, ...enhancementData };
        } catch (error) {
          // Don't fail the process for optional enhancements
          console.warn('Optional field enhancement failed:', error);
        }
      }
      
      // Create metadata
      const metadata: SongMetadata = {
        aiResponseQuality: this.determineResponseQuality(songData),
        needsManualReview: missingRequired.length > 0,
        lastAIUpdate: new Date(),
        retryCount,
        errorReason: missingRequired.length > 0 ? 'MISSING_REQUIRED_FIELDS' : undefined
      };
      
      return { ...this.sanitizeResponse(songData), metadata };
      
    } catch (error) {
      console.error(`Enhanced song information failed for ${songTitle}:`, error);
      
      // Return fallback data with error metadata
      const fallbackData = this.createFallbackData(songTitle);
      const metadata: SongMetadata = {
        aiResponseQuality: 'failed',
        needsManualReview: true,
        lastAIUpdate: new Date(),
        retryCount,
        errorReason: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
      
      return { ...fallbackData, metadata };
    }
  }
  
  private parseAndValidateResponse(responseText: string): Partial<EnhancedSongResult> {
    const cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  }
  
  private parseJSONWithRepair(responseText: string): Partial<EnhancedSongResult> {
    try {
      return this.parseAndValidateResponse(responseText);
    } catch (error) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?[\n\r]?([\s\S]*?)[\n\r]?```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {}
      }
      
      // Try to fix common JSON issues
      const cleaned = responseText
        .replace(/^[^{]*/, '') // Remove text before first {
        .replace(/[^}]*$/, '') // Remove text after last }
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
      
      return JSON.parse(cleaned);
    }
  }
  
  private validateRequiredFields(data: Partial<EnhancedSongResult>): string[] {
    const required = ['composer', 'period', 'musicalForm', 'explanation'];
    return required.filter(field => !data[field as keyof EnhancedSongResult]);
  }
  
  private identifyMissingOptionalFields(data: Partial<EnhancedSongResult>): string[] {
    const optional = ['themes', 'culturalSignificance', 'historicalContext', 'notableRecordings'];
    return optional.filter(field => {
      const value = data[field as keyof EnhancedSongResult];
      return !value || (Array.isArray(value) && value.length === 0);
    });
  }
  
  private sanitizeResponse(data: Partial<EnhancedSongResult>): EnhancedSongResult {
    return {
      composer: typeof data.composer === 'string' ? data.composer : 'Unknown',
      lyricist: data.lyricist || undefined,
      yearComposed: typeof data.yearComposed === 'number' ? data.yearComposed : undefined,
      period: ['Pre-Golden Age', 'Golden Age', 'Post-Golden Age', 'Contemporary'].includes(data.period || '') 
        ? data.period as any : 'Golden Age',
      musicalForm: ['Tango', 'Vals', 'Milonga', 'Candombe', 'Other'].includes(data.musicalForm || '')
        ? data.musicalForm as any : 'Tango',
      themes: Array.isArray(data.themes) ? data.themes : ['tango'],
      culturalSignificance: typeof data.culturalSignificance === 'string' ? 
        data.culturalSignificance : 'This is a traditional tango song.',
      historicalContext: typeof data.historicalContext === 'string' ? 
        data.historicalContext : 'Part of the Argentine tango repertoire.',
      musicalCharacteristics: Array.isArray(data.musicalCharacteristics) ? 
        data.musicalCharacteristics : ['traditional tango rhythm'],
      danceStyle: Array.isArray(data.danceStyle) ? data.danceStyle : ['classic tango'],
      notableRecordings: Array.isArray(data.notableRecordings) ? data.notableRecordings : [],
      notablePerformers: Array.isArray(data.notablePerformers) ? data.notablePerformers : [],
      recommendedForDancing: typeof data.recommendedForDancing === 'boolean' ? 
        data.recommendedForDancing : true,
      danceRecommendations: data.danceRecommendations || 'Suitable for social dancing',
      story: data.story || undefined,
      inspiration: data.inspiration || undefined,
      explanation: typeof data.explanation === 'string' ? data.explanation : 
        'Information about this tango song is being researched. Please try again later.'
    };
  }
  
  private createFallbackData(songTitle: string): EnhancedSongResult {
    return {
      composer: 'Unknown',
      lyricist: undefined,
      yearComposed: undefined,
      period: 'Golden Age',
      musicalForm: 'Tango',
      themes: ['tango', 'traditional'],
      culturalSignificance: 'This is a traditional tango song.',
      historicalContext: 'Part of the Argentine tango repertoire.',
      musicalCharacteristics: ['traditional tango rhythm'],
      danceStyle: ['classic tango'],
      notableRecordings: [],
      notablePerformers: [],
      recommendedForDancing: true,
      danceRecommendations: 'Suitable for social dancing',
      story: undefined,
      inspiration: undefined,
      explanation: `${songTitle} is a tango song. Detailed information is currently unavailable due to service limitations. The song remains part of the rich Argentine tango tradition.`
    };
  }
  
  private determineResponseQuality(data: Partial<EnhancedSongResult>): 'excellent' | 'good' | 'partial' | 'failed' {
    const requiredFields = ['composer', 'period', 'musicalForm', 'explanation'];
    const hasRequired = requiredFields.every(field => data[field as keyof EnhancedSongResult]);
    
    if (!hasRequired) return 'failed';
    
    const optionalFields = ['themes', 'culturalSignificance', 'historicalContext', 'notableRecordings'];
    const hasOptional = optionalFields.filter(field => {
      const value = data[field as keyof EnhancedSongResult];
      return value && (!Array.isArray(value) || value.length > 0);
    }).length;
    
    if (hasOptional >= 3) return 'excellent';
    if (hasOptional >= 2) return 'good';
    return 'partial';
  }
  
  private normalizeTitle(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  
  clearExpiredSessions(): void {
    this.chatSessions.clear();
  }
}

// Create singleton instance
const enhancedGeminiService = new SongInformationService();

// Legacy compatibility function
export const researchSongWithAI = async (params: { title: string; artist?: string }) => {
  const enhanced = await enhancedGeminiService.getEnhancedSongInformation(params);
  
  return {
    title: params.title,
    explanation: enhanced.explanation,
    sources: [], // Will be populated from sources field in future
    tags: enhanced.themes
  };
};

// Create singleton instance
const songInformationService = new SongInformationService();

export { enhancedGeminiService, SongInformationService, songInformationService };
export default enhancedGeminiService;