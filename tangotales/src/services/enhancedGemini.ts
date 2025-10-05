// Lazy-load Google GenAI to avoid Jest/Node ESM parsing issues in tests
let GoogleGenAI: any = null;
try {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    GoogleGenAI = require('@google/genai').GoogleGenAI;
  }
} catch (err) {
  // Don't crash tests or dev when the SDK cannot be loaded (e.g., ESM-only package in test env)
  const e: any = err;
  console.warn('⚠️ GEMINI - Could not require @google/genai (expected in test environments):', e && e.message ? e.message : e);
}
import { config } from '../utils/config';
import { SongMetadata, Recording, Performer } from '../types/song';

// Debug logging for Gemini API configuration
console.log('🔍 GEMINI DEBUG - Configuration check:');
if (process.env.NODE_ENV === 'development') {
  console.log('- API Key present:', !!config.gemini.apiKey);
  console.log('- Environment:', process.env.NODE_ENV);
}

// Initialize Gemini AI client with error handling
let ai: any = null;

try {
  if (!config.gemini.apiKey) {
    console.error('❌ GEMINI DEBUG - API key is missing or empty');
    console.error('Expected env var: REACT_APP_GEMINI_API_KEY');
    console.error('Current env vars:', {
      REACT_APP_GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY ? 'SET' : 'MISSING',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING'
    });
  } else if (GoogleGenAI) {
    ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    console.log('✅ GEMINI DEBUG - Client initialized successfully');
  } else {
    // In test environments or when the SDK cannot be required, keep ai as null and continue
    console.warn('⚠️ GEMINI DEBUG - GoogleGenAI SDK not available; AI calls will be disabled in this environment.');
  }
} catch (initError) {
  console.error('❌ GEMINI DEBUG - Client initialization failed:', initError);
}

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
 * System prompt optimized for multi-turn conversations
 * Currently commented out as the system works well with individual turn prompts
 */
// const ENHANCED_SYSTEM_PROMPT = `You are an expert tango musicologist and historian specializing in Argentine tango music from 1880 to present.

// RESPONSE FORMAT RULES:
// - Respond ONLY with valid JSON objects - no explanatory text, no markdown code blocks
// - Use null for genuinely unknown information - never guess or fabricate data  
// - Keep JSON responses focused and concise
// - Ensure all string values are properly escaped for JSON parsing
// - Use exact field names as requested in each turn

// PERIOD DEFINITIONS:
// - Pre-Golden Age: 1880-1916 (Early development period)
// - Golden Age: 1916-1955 (Peak popularity and standardization) 
// - Post-Golden Age: 1955-1980 (Evolution and diversification)
// - Contemporary: 1980-present (Modern interpretations and nuevo tango)

// QUALITY STANDARDS:
// - Distinguish documented historical facts from interpretations
// - Provide cultural context that enhances understanding for tango enthusiasts
// - Balance academic accuracy with accessibility for dancers and music lovers
// - When uncertain, use null rather than speculative information

// You will receive focused requests for specific information categories. Respond to each request individually with the exact JSON structure requested.`;

/**
 * Chat session manager for multi-turn conversations
 */
class SongInformationService {
  private chatSessions = new Map<string, any>();
  
  async getEnhancedSongInformation(params: EnhancedSongParams): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log('🚀 GEMINI DEBUG - Starting enhanced song information request');
    console.log('- Song title:', params.title);
    console.log('- AI client status:', ai ? 'INITIALIZED' : 'NULL');
    
    // Check if AI client is available
    if (!ai) {
      console.error('❌ GEMINI DEBUG - AI client is null, cannot proceed');
      throw new Error('Gemini AI client not initialized. Check API key configuration.');
    }
    
    const sessionKey = this.normalizeTitle(params.title);
    console.log('- Session key:', sessionKey);
    console.log('- Existing sessions:', this.chatSessions.size);
    
    try {
      if (!this.chatSessions.has(sessionKey)) {
        console.log('📝 GEMINI DEBUG - Creating new chat session');
        
        const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            temperature: 0.3, // Lower for factual information
            maxOutputTokens: 2048
          }
        });
        
        console.log('✅ GEMINI DEBUG - Chat session created successfully');
        this.chatSessions.set(sessionKey, chat);
      } else {
        console.log('♻️ GEMINI DEBUG - Reusing existing chat session');
      }
      
      const chat = this.chatSessions.get(sessionKey)!;
      console.log('🔄 GEMINI DEBUG - Starting information gathering');
      
      return await this.gatherInformationWithChat(chat, params.title);
      
    } catch (error) {
      console.error('❌ GEMINI DEBUG - Error in getEnhancedSongInformation:');
      console.error('- Error type:', error?.constructor.name);
      console.error('- Error message:', (error as Error)?.message);
      console.error('- Stack trace:', (error as Error)?.stack);
      
      // Re-throw with more context
      throw new Error(`Failed to get enhanced song information for "${params.title}": ${(error as Error)?.message}`);
    }
  }
  
  private async gatherInformationWithChat(chat: any, songTitle: string): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log(`📡 GEMINI DEBUG - Starting multi-turn conversation for "${songTitle}"`);
    
    const songData: Partial<EnhancedSongResult> = {};
    let successfulTurns = 0;
    let failedTurns = 0;
    let correctedTitle = songTitle;
    
    // Turn 0: Title Correction & Validation
    try {
      console.log('📤 Turn 0: Title correction and validation');
      const titleCorrectionPrompt = `TANGO VALIDATION TASK: Analyze if "${songTitle}" is a legitimate tango song title from the Argentine tango repertoire (1880-present).

Respond ONLY with this JSON:
{
  "correctedTitle": "exact correct title of the tango song or null if not a known tango",
  "confidence": "high" | "medium" | "low" | "not_found",
  "alternativeSpellings": ["possible alternative spelling 1", "alternative 2"] or null,
  "isKnownTango": true | false
}

VALIDATION CRITERIA:
- ONLY accept titles that are documented Argentine tango compositions
- Check against famous tangos: La Cumparsita, El Choclo, Adios Muchachos, Por Una Cabeza, etc.
- If it's a misspelling of a known tango, correct it (e.g., "merseditas" → "Merceditas", "bahia blanka" → "Bahía Blanca")
- REJECT terms that are clearly not tango songs (random words, other music genres, non-Spanish titles unless famous)
- REJECT general words like colors, animals, random phrases in any language
- Be extremely strict: when in doubt, set isKnownTango to false
- Only set isKnownTango to true for confirmed Argentine tango compositions

EXAMPLES TO REJECT: "yellow flower", "sarı çiçek", "hello world", "rock music", "jazz standard"`;
      
      const titleResponse = await chat.sendMessage({ message: titleCorrectionPrompt });
      console.log('📥 Turn 0 response:', titleResponse.text?.length || 0, 'chars');
      
      const titleData = this.parseJSONWithRepair(titleResponse.text) as any;
      
      // Check if this is actually a tango song
      if (!titleData.isKnownTango) {
        console.log(`❌ VALIDATION FAILED: "${songTitle}" is not recognized as a tango song`);
        console.log('- AI confidence:', titleData.confidence);
        console.log('- Suggested alternatives:', titleData.alternativeSpellings);
        
        // Throw specific error for non-tango songs
        throw new Error(`NOT_A_TANGO_SONG: "${songTitle}" does not appear to be a valid tango song title. Please search for actual tango compositions from the Argentine tango repertoire.`);
      }
      
      // Update the title if correction was found
      if (titleData.correctedTitle && titleData.isKnownTango) {
        correctedTitle = titleData.correctedTitle;
        console.log(`🔧 Title corrected: "${songTitle}" → "${correctedTitle}"`);
      }
      
      // Add title correction info to song data
      Object.assign(songData, {
        originalUserInput: songTitle,
        correctedTitle: correctedTitle,
        titleCorrectionConfidence: titleData.confidence || 'unknown'
      });
      
      successfulTurns++;
      console.log('✅ Turn 0 successful:', { originalTitle: songTitle, correctedTitle, confidence: titleData.confidence || 'unknown' });
    } catch (error) {
      console.error('❌ Turn 0 failed:', error);
      
      // If this is a "not a tango song" error, re-throw it to stop processing
      if (error instanceof Error && error.message.includes('NOT_A_TANGO_SONG')) {
        console.log('🚫 Stopping AI processing - not a valid tango song');
        throw error; // Re-throw to stop the entire process
      }
      
      failedTurns++;
      // Use original title if correction fails (for other types of errors)
      correctedTitle = songTitle;
      Object.assign(songData, {
        originalUserInput: songTitle,
        correctedTitle: songTitle,
        titleCorrectionConfidence: 'failed'
      });
    }
    
    // Now use the corrected title for all subsequent turns
    console.log(`🎯 Using title "${correctedTitle}" for information gathering`);
    
    // Turn 1: Basic Song Information
    try {
      console.log('📤 Turn 1: Basic song information');
      const basicPrompt = `For the tango song "${correctedTitle}", provide ONLY this JSON structure:
{
  "composer": "composer full name or Unknown",
  "lyricist": "lyricist name or null", 
  "yearComposed": year_number_or_null,
  "period": "Pre-Golden Age" | "Golden Age" | "Post-Golden Age" | "Contemporary",
  "musicalForm": "Tango" | "Vals" | "Milonga"
}

Periods: Pre-Golden Age (1880-1916), Golden Age (1916-1955), Post-Golden Age (1955-1980), Contemporary (1980+)`;
      
      const basicResponse = await chat.sendMessage({ message: basicPrompt });
      console.log('📥 Turn 1 response:', basicResponse.text?.length || 0, 'chars');
      
      const basicData = this.parseJSONWithRepair(basicResponse.text);
      Object.assign(songData, basicData);
      successfulTurns++;
      console.log('✅ Turn 1 successful:', Object.keys(basicData));
    } catch (error) {
      console.error('❌ Turn 1 failed:', error);
      failedTurns++;
      // Add fallback basic data
      Object.assign(songData, {
        composer: 'Unknown',
        period: 'Golden Age',
        musicalForm: 'Tango'
      });
    }
    
    // Turn 2: Cultural & Thematic Information
    try {
      console.log('� Turn 2: Cultural and thematic information');
      const culturalPrompt = `For "${correctedTitle}", provide ONLY this JSON:
{
  "themes": ["theme1", "theme2", "theme3"],
  "culturalSignificance": "brief description of cultural importance or null",
  "historicalContext": "historical backdrop when written or null"
}

Keep descriptions concise (1-2 sentences each).`;
      
      const culturalResponse = await chat.sendMessage({ message: culturalPrompt });
      console.log('📥 Turn 2 response:', culturalResponse.text?.length || 0, 'chars');
      
      const culturalData = this.parseJSONWithRepair(culturalResponse.text);
      Object.assign(songData, culturalData);
      successfulTurns++;
      console.log('✅ Turn 2 successful:', Object.keys(culturalData));
    } catch (error) {
      console.error('❌ Turn 2 failed:', error);
      failedTurns++;
      // Add fallback cultural data
      Object.assign(songData, {
        themes: ['tango', 'traditional'],
        culturalSignificance: 'This is a traditional tango song.',
        historicalContext: 'Part of the Argentine tango repertoire.'
      });
    }
    
    // Turn 3: Musical & Dance Characteristics
    try {
      console.log('📤 Turn 3: Musical and dance characteristics');
      const musicPrompt = `For "${correctedTitle}", provide ONLY this JSON:
{
  "musicalCharacteristics": ["characteristic1", "characteristic2"],
  "danceStyle": ["dance_characteristic1", "dance_characteristic2"],
  "recommendedForDancing": true_or_false,
  "danceRecommendations": "brief dance guidance or null"
}`;
      
      const musicResponse = await chat.sendMessage({ message: musicPrompt });
      console.log('📥 Turn 3 response:', musicResponse.text?.length || 0, 'chars');
      
      const musicData = this.parseJSONWithRepair(musicResponse.text);
      Object.assign(songData, musicData);
      successfulTurns++;
      console.log('✅ Turn 3 successful:', Object.keys(musicData));
    } catch (error) {
      console.error('❌ Turn 3 failed:', error);
      failedTurns++;
      // Add fallback musical data
      Object.assign(songData, {
        musicalCharacteristics: ['traditional tango rhythm'],
        danceStyle: ['classic tango'],
        recommendedForDancing: true,
        danceRecommendations: 'Suitable for social dancing'
      });
    }
    
    // Turn 4: Notable Recordings & Performers
    try {
      console.log('📤 Turn 4: Notable recordings and performers');
      const performersPrompt = `For "${correctedTitle}", provide ONLY this JSON:
{
  "notableRecordings": [
    {
      "artist": "Artist Name",
      "orchestra": "Orchestra name or null",
      "year": year_number_or_null,
      "significance": "brief description"
    }
  ],
  "notablePerformers": [
    {
      "name": "Performer Name", 
      "role": "Singer" | "Orchestra Leader" | "Musician",
      "significance": "brief description"
    }
  ]
}

Use empty arrays [] if no notable recordings/performers are known.`;
      
      const performersResponse = await chat.sendMessage({ message: performersPrompt });
      console.log('📥 Turn 4 response:', performersResponse.text?.length || 0, 'chars');
      
      const performersData = this.parseJSONWithRepair(performersResponse.text);
      Object.assign(songData, performersData);
      successfulTurns++;
      console.log('✅ Turn 4 successful:', Object.keys(performersData));
    } catch (error) {
      console.error('❌ Turn 4 failed:', error);
      failedTurns++;
      // Add fallback performers data
      Object.assign(songData, {
        notableRecordings: [],
        notablePerformers: []
      });
    }
    
    // Turn 5: Story & Comprehensive Summary
    try {
      console.log('📤 Turn 5: Story and comprehensive summary');
      const summaryPrompt = `For "${correctedTitle}", provide ONLY this JSON:
{
  "story": "narrative told by the lyrics or null",
  "inspiration": "background story of song creation or null",
  "explanation": "comprehensive 2-3 paragraph summary combining historical context, cultural significance, and musical importance"
}

The explanation should be informative and engaging, suitable for tango enthusiasts.`;
      
      const summaryResponse = await chat.sendMessage({ message: summaryPrompt });
      console.log('📥 Turn 5 response:', summaryResponse.text?.length || 0, 'chars');
      
      const summaryData = this.parseJSONWithRepair(summaryResponse.text);
      Object.assign(songData, summaryData);
      successfulTurns++;
      console.log('✅ Turn 5 successful:', Object.keys(summaryData));
    } catch (error) {
      console.error('❌ Turn 5 failed:', error);
      failedTurns++;
      // Add fallback summary data
      Object.assign(songData, {
        story: null,
        inspiration: null,
        explanation: `"${correctedTitle}" is a tango song that forms part of the rich Argentine musical tradition. While specific details about its creation and history may be limited, it represents the enduring legacy of tango music that continues to captivate dancers and music lovers worldwide.`
      });
    }
    
    console.log(`📊 Multi-turn results: ${successfulTurns} successful, ${failedTurns} failed out of 5 turns`);
    
    // Create metadata based on success rate
    const successRate = successfulTurns / (successfulTurns + failedTurns);
    const metadata: SongMetadata = {
      aiResponseQuality: successRate >= 0.8 ? 'excellent' : 
                        successRate >= 0.6 ? 'good' : 
                        successRate >= 0.4 ? 'partial' : 'failed',
      needsManualReview: successRate < 0.6,
      lastAIUpdate: new Date(),
      retryCount: failedTurns,
      errorReason: failedTurns > 0 ? `${failedTurns}_OF_5_TURNS_FAILED` : undefined
    };
    
    console.log(`📈 Final quality assessment: ${metadata.aiResponseQuality} (${Math.round(successRate * 100)}% success rate)`);
    
    // Ensure the corrected title is in the final result
    const finalResult = { ...this.sanitizeResponse(songData), metadata } as any;
    if (correctedTitle !== songTitle) {
      finalResult.title = correctedTitle;
      console.log(`🏷️ Final title corrected: "${songTitle}" → "${correctedTitle}"`);
    }
    
    return finalResult;
  }
  
  private parseAndValidateResponse(responseText: string): Partial<EnhancedSongResult> {
    console.log('🔍 GEMINI DEBUG - Parsing and validating response');
    console.log('- Raw response length:', responseText?.length || 0);
    console.log('- Raw response type:', typeof responseText);
    console.log('- Raw response preview:', responseText?.substring(0, 500) + '...' || 'EMPTY');
    
    if (!responseText || typeof responseText !== 'string') {
      console.error('❌ GEMINI DEBUG - Invalid response text:', responseText);
      throw new Error('Response text is empty or not a string');
    }
    
    try {
      const cleaned = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('- Cleaned response length:', cleaned.length);
      console.log('- Cleaned response preview:', cleaned.substring(0, 300) + '...');
      
      if (!cleaned.startsWith('{')) {
        console.error('❌ GEMINI DEBUG - Response does not start with JSON object');
        console.error('- First 100 chars:', cleaned.substring(0, 100));
        throw new Error('Response is not valid JSON - does not start with {');
      }
      
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
        console.log('✅ GEMINI DEBUG - JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ GEMINI DEBUG - Initial JSON parsing failed');
        console.error('- Parse error:', (parseError as Error)?.message);
        
        // Recovery attempt: Try to fix truncated JSON
        console.log('🔄 GEMINI DEBUG - Attempting JSON recovery...');
        
        // Find the last complete object by looking for the last valid closing brace
        const lastCompleteIndex = cleaned.lastIndexOf('}');
        if (lastCompleteIndex > 0) {
          const recoveredJson = cleaned.substring(0, lastCompleteIndex + 1);
          console.log('- Recovery attempt: using first', lastCompleteIndex + 1, 'characters');
          console.log('- Recovery text preview:', recoveredJson.substring(0, 100) + '...');
          
          try {
            parsed = JSON.parse(recoveredJson);
            console.log('✅ GEMINI DEBUG - JSON recovery successful');
          } catch (recoveryError) {
            console.error('❌ GEMINI DEBUG - JSON recovery also failed');
            console.error('- Recovery error:', (recoveryError as Error)?.message);
            console.error('- Failed on text:', responseText.substring(0, 300) + '...');
            throw new Error(`JSON parsing failed after recovery attempts: ${(parseError as Error)?.message}`);
          }
        } else {
          console.error('- Failed on text:', responseText.substring(0, 300) + '...');
          throw new Error(`JSON parsing failed: ${(parseError as Error)?.message}`);
        }
      }
      
      console.log('- Parsed object keys:', Object.keys(parsed));
      console.log('- Has explanation:', !!parsed.explanation);
      console.log('- Has composer:', !!parsed.composer);
      
      return parsed;
      
    } catch (parseError) {
      console.error('❌ GEMINI DEBUG - Complete parsing failure');
      console.error('- Parse error:', (parseError as Error)?.message);
      console.error('- Failed on text:', responseText.substring(0, 200) + '...');
      throw new Error(`JSON parsing failed: ${(parseError as Error)?.message}`);
    }
  }
  
  private parseJSONWithRepair(responseText: string): Partial<EnhancedSongResult> {
    try {
      return this.parseAndValidateResponse(responseText);
    } catch (error) {
      console.warn('Initial JSON parse failed, attempting repair:', error);
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?[\n\r]?([\s\S]*?)[\n\r]?```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (markdownError) {
          console.warn('Markdown extraction failed:', markdownError);
        }
      }
      
      try {
        // Try to fix common JSON issues
        const cleaned = responseText
          .replace(/^[^{]*/, '') // Remove text before first {
          .replace(/[^}]*$/, '') // Remove text after last }
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
          .replace(/[\u2018\u2019]/g, "'"); // Replace smart apostrophes
        
        return JSON.parse(cleaned);
      } catch (repairError) {
        console.error('JSON repair failed:', repairError);
        console.error('Original response:', responseText.substring(0, 500) + '...');
        throw new Error(`JSON_PARSE_FAILED: ${repairError instanceof Error ? repairError.message : 'Unknown parsing error'}`);
      }
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