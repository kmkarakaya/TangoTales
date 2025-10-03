import { GoogleGenAI } from '@google/genai';
import { config } from '../utils/config';

// Initialize Gemini AI client with error handling
let ai: GoogleGenAI | null = null;

try {
  if (!config.gemini.apiKey) {
    console.error('❌ GEMINI DEBUG - API key is missing or empty');
  } else {
    ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    console.log('✅ GEMINI DEBUG - Client initialized successfully');
  }
} catch (initError) {
  console.error('❌ GEMINI DEBUG - Client initialization failed:', initError);
}

export interface EnhancedSongParams {
  title: string;
}

export interface Recording {
  artist: string;
  year?: number;
  album?: string;
  style: 'Traditional' | 'Modern' | 'Nuevo Tango' | 'Electronic';
}

export interface Performer {
  name: string;
  role: 'Orchestra Leader' | 'Singer' | 'Instrumentalist' | 'Dancer';
  period: 'Golden Age' | 'Post-Golden Age' | 'Contemporary';
  notableCollaborations?: string[];
}

export interface SongMetadata {
  aiProcessingTimeMs: number;
  successfulTurns: number;
  failedTurns: number;
  totalTokensUsed?: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProgressUpdate {
  phase: number;
  totalPhases: number;
  message: string;
  icon: string;
  completed: boolean;
}

export type ProgressCallback = (update: ProgressUpdate) => void;

export interface EnhancedSongResult {
  originalUserInput: string;
  correctedTitle: string;
  titleCorrectionConfidence: 'high' | 'medium' | 'low' | 'failed' | 'unknown';
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
 * Progress phases for the AI research process
 */
const PROGRESS_PHASES = [
  { message: "🔍 Validating tango song title...", icon: "🔍" },
  { message: "📚 Gathering basic song information...", icon: "📚" },
  { message: "🏛️ Researching cultural significance...", icon: "🏛️" },
  { message: "🎵 Analyzing musical characteristics...", icon: "🎵" },
  { message: "🎼 Finding recordings and performers...", icon: "🎼" },
  { message: "✨ Creating comprehensive summary...", icon: "✨" }
];

/**
 * Chat session manager for multi-turn conversations with progress tracking
 */
class SongInformationService {
  private chatSessions = new Map<string, any>();
  
  async getEnhancedSongInformation(
    params: EnhancedSongParams, 
    progressCallback?: ProgressCallback
  ): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log('🚀 GEMINI DEBUG - Starting enhanced song information request');
    console.log('- Song title:', params.title);
    console.log('- AI client status:', ai ? 'INITIALIZED' : 'NULL');
    console.log('- Progress callback:', progressCallback ? 'PROVIDED' : 'NOT_PROVIDED');
    
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
      console.log('🔄 GEMINI DEBUG - Starting information gathering with progress tracking');
      
      return await this.gatherInformationWithChat(chat, params.title, progressCallback);
      
    } catch (error) {
      console.error('❌ GEMINI DEBUG - Error in getEnhancedSongInformation:');
      console.error('- Error type:', error?.constructor.name);
      console.error('- Error message:', (error as Error)?.message);
      console.error('- Stack trace:', (error as Error)?.stack);
      
      // Re-throw with more context
      throw new Error(`Failed to get enhanced song information for "${params.title}": ${(error as Error)?.message}`);
    }
  }

  private emitProgress(
    phase: number, 
    message: string, 
    icon: string, 
    completed: boolean, 
    progressCallback?: ProgressCallback
  ): void {
    if (progressCallback) {
      progressCallback({
        phase,
        totalPhases: PROGRESS_PHASES.length,
        message,
        icon,
        completed
      });
      console.log(`📊 Progress: Phase ${phase}/${PROGRESS_PHASES.length} - ${message}`);
    }
  }
  
  private async gatherInformationWithChat(
    chat: any, 
    songTitle: string, 
    progressCallback?: ProgressCallback
  ): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log(`📡 GEMINI DEBUG - Starting multi-turn conversation for "${songTitle}"`);
    
    const startTime = Date.now();
    const songData: Partial<EnhancedSongResult> = {};
    let successfulTurns = 0;
    let failedTurns = 0;
    let correctedTitle = songTitle;
    
    // Phase 0: Title Correction & Validation
    this.emitProgress(0, PROGRESS_PHASES[0].message, PROGRESS_PHASES[0].icon, false, progressCallback);
    
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
      this.emitProgress(0, "✅ Title validated successfully", "✅", true, progressCallback);
      console.log('✅ Turn 0 successful:', { originalTitle: songTitle, correctedTitle, confidence: titleData.confidence || 'unknown' });
    } catch (error) {
      console.error('❌ Turn 0 failed:', error);
      
      // If this is a "not a tango song" error, re-throw it to stop processing
      if (error instanceof Error && error.message.includes('NOT_A_TANGO_SONG')) {
        console.log('🚫 Stopping AI processing - not a valid tango song');
        this.emitProgress(0, "❌ Not a valid tango song", "❌", true, progressCallback);
        throw error; // Re-throw to stop the entire process
      }
      
      failedTurns++;
      this.emitProgress(0, "⚠️ Title validation incomplete", "⚠️", true, progressCallback);
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
    
    // Phase 1: Basic Song Information
    this.emitProgress(1, PROGRESS_PHASES[1].message, PROGRESS_PHASES[1].icon, false, progressCallback);
    
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
      this.emitProgress(1, "✅ Basic information gathered", "✅", true, progressCallback);
      console.log('✅ Turn 1 successful:', Object.keys(basicData));
    } catch (error) {
      console.error('❌ Turn 1 failed:', error);
      failedTurns++;
      this.emitProgress(1, "⚠️ Using fallback basic info", "⚠️", true, progressCallback);
      // Add fallback basic data
      Object.assign(songData, {
        composer: 'Unknown',
        period: 'Golden Age',
        musicalForm: 'Tango'
      });
    }
    
    // Phase 2: Cultural & Thematic Information
    this.emitProgress(2, PROGRESS_PHASES[2].message, PROGRESS_PHASES[2].icon, false, progressCallback);
    
    try {
      console.log('📤 Turn 2: Cultural and thematic information');
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
      this.emitProgress(2, "✅ Cultural context researched", "✅", true, progressCallback);
      console.log('✅ Turn 2 successful:', Object.keys(culturalData));
    } catch (error) {
      console.error('❌ Turn 2 failed:', error);
      failedTurns++;
      this.emitProgress(2, "⚠️ Using fallback cultural info", "⚠️", true, progressCallback);
      // Add fallback cultural data
      Object.assign(songData, {
        themes: ['tango', 'traditional'],
        culturalSignificance: 'This is a traditional tango song.',
        historicalContext: 'Part of the Argentine tango repertoire.'
      });
    }
    
    // Phase 3: Musical & Dance Characteristics
    this.emitProgress(3, PROGRESS_PHASES[3].message, PROGRESS_PHASES[3].icon, false, progressCallback);
    
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
      this.emitProgress(3, "✅ Musical analysis complete", "✅", true, progressCallback);
      console.log('✅ Turn 3 successful:', Object.keys(musicData));
    } catch (error) {
      console.error('❌ Turn 3 failed:', error);
      failedTurns++;
      this.emitProgress(3, "⚠️ Using fallback music info", "⚠️", true, progressCallback);
      // Add fallback musical data
      Object.assign(songData, {
        musicalCharacteristics: ['traditional tango rhythm'],
        danceStyle: ['close embrace'],
        recommendedForDancing: true,
        danceRecommendations: 'Suitable for social dancing.'
      });
    }

    // Continue with the remaining phases...
    // This is the first part of the enhanced file with progress tracking
    
    return this.completeRemainingPhases(chat, correctedTitle, songData, successfulTurns, failedTurns, startTime, progressCallback);
  }

  private async completeRemainingPhases(
    chat: any,
    correctedTitle: string,
    songData: Partial<EnhancedSongResult>,
    successfulTurns: number,
    failedTurns: number,
    startTime: number,
    progressCallback?: ProgressCallback
  ): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    // Phase 4: Recordings & Performers
    this.emitProgress(4, PROGRESS_PHASES[4].message, PROGRESS_PHASES[4].icon, false, progressCallback);
    
    try {
      console.log('📤 Turn 4: Notable recordings and performers');
      const recordingPrompt = `For "${correctedTitle}", provide ONLY this JSON:
{
  "notableRecordings": [
    {
      "artist": "artist_name",
      "year": year_or_null,
      "album": "album_name_or_null",
      "style": "Traditional" | "Modern" | "Nuevo Tango" | "Electronic"
    }
  ],
  "notablePerformers": [
    {
      "name": "performer_name",
      "role": "Orchestra Leader" | "Singer" | "Instrumentalist" | "Dancer",
      "period": "Golden Age" | "Post-Golden Age" | "Contemporary"
    }
  ]
}

Limit to 3-5 most significant recordings and performers.`;
      
      const recordingResponse = await chat.sendMessage({ message: recordingPrompt });
      console.log('📥 Turn 4 response:', recordingResponse.text?.length || 0, 'chars');
      
      const recordingData = this.parseJSONWithRepair(recordingResponse.text);
      Object.assign(songData, recordingData);
      successfulTurns++;
      this.emitProgress(4, "✅ Recordings and performers found", "✅", true, progressCallback);
      console.log('✅ Turn 4 successful:', Object.keys(recordingData));
    } catch (error) {
      console.error('❌ Turn 4 failed:', error);
      failedTurns++;
      this.emitProgress(4, "⚠️ Using fallback recordings info", "⚠️", true, progressCallback);
      // Add fallback recording data
      Object.assign(songData, {
        notableRecordings: [],
        notablePerformers: []
      });
    }
    
    // Phase 5: Comprehensive Summary
    this.emitProgress(5, PROGRESS_PHASES[5].message, PROGRESS_PHASES[5].icon, false, progressCallback);
    
    try {
      console.log('📤 Turn 5: Comprehensive summary and final explanation');
      const summaryPrompt = `Create a comprehensive explanation for the tango "${correctedTitle}". 
Based on our previous discussion, provide ONLY this JSON:
{
  "story": "narrative about the song's creation/background or null",
  "inspiration": "what inspired this piece or null",
  "explanation": "comprehensive description combining all aspects (2-3 paragraphs)"
}

The explanation should weave together the musical, cultural, and historical aspects we discussed.`;
      
      const summaryResponse = await chat.sendMessage({ message: summaryPrompt });
      console.log('📥 Turn 5 response:', summaryResponse.text?.length || 0, 'chars');
      
      const summaryData = this.parseJSONWithRepair(summaryResponse.text);
      Object.assign(songData, summaryData);
      successfulTurns++;
      this.emitProgress(5, "✅ Research complete!", "🎉", true, progressCallback);
      console.log('✅ Turn 5 successful - comprehensive summary created');
    } catch (error) {
      console.error('❌ Turn 5 failed:', error);
      failedTurns++;
      this.emitProgress(5, "⚠️ Using basic summary", "⚠️", true, progressCallback);
      // Add fallback summary
      Object.assign(songData, {
        story: null,
        inspiration: null,
        explanation: `${correctedTitle} is a tango composition that represents part of the rich Argentine tango tradition. This piece embodies the characteristic elements of tango music and culture that have made this genre beloved worldwide.`
      });
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`🏁 GEMINI DEBUG - Multi-turn conversation completed in ${processingTime}ms`);
    console.log(`- Successful turns: ${successfulTurns}/6`);
    console.log(`- Failed turns: ${failedTurns}/6`);
    console.log(`- Song data keys:`, Object.keys(songData));
    
    // Determine overall confidence based on successful turns
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (successfulTurns >= 5) confidence = 'high';
    else if (successfulTurns >= 3) confidence = 'medium';
    
    // Ensure all required fields are present with fallbacks
    const result: EnhancedSongResult = {
      originalUserInput: songData.originalUserInput || '',
      correctedTitle: songData.correctedTitle || '',
      titleCorrectionConfidence: songData.titleCorrectionConfidence || 'unknown',
      composer: songData.composer || 'Unknown',
      lyricist: songData.lyricist || undefined,
      yearComposed: songData.yearComposed || undefined,
      period: songData.period || 'Golden Age',
      musicalForm: songData.musicalForm || 'Tango',
      themes: songData.themes || ['tango'],
      culturalSignificance: songData.culturalSignificance || 'Traditional tango composition',
      historicalContext: songData.historicalContext || 'Part of Argentine tango repertoire',
      musicalCharacteristics: songData.musicalCharacteristics || ['traditional tango rhythm'],
      danceStyle: songData.danceStyle || ['close embrace'],
      notableRecordings: songData.notableRecordings || [],
      notablePerformers: songData.notablePerformers || [],
      recommendedForDancing: songData.recommendedForDancing ?? true,
      danceRecommendations: songData.danceRecommendations || undefined,
      story: songData.story || undefined,
      inspiration: songData.inspiration || undefined,
      explanation: songData.explanation || `${correctedTitle} is a tango composition from the Argentine tango tradition.`
    };
    
    const metadata: SongMetadata = {
      aiProcessingTimeMs: processingTime,
      successfulTurns,
      failedTurns,
      confidence
    };
    
    console.log('🎯 GEMINI DEBUG - Final result prepared');
    console.log('- Result keys:', Object.keys(result));
    console.log('- Metadata:', metadata);
    
    return { ...result, metadata };
  }

  private normalizeTitle(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  private parseJSONWithRepair(text: string): any {
    if (!text) {
      console.warn('⚠️ Empty response from AI, using fallback');
      return {};
    }

    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON within the text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully');
      return parsed;
    } catch (parseError) {
      console.warn('⚠️ JSON parse failed, attempting repair:', (parseError as Error).message);
      
      try {
        // Basic repair attempts
        cleanText = cleanText
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        const repairedResult = JSON.parse(cleanText);
        console.log('✅ JSON repair successful');
        return repairedResult;
      } catch (repairError) {
        console.error('❌ JSON repair also failed:', (repairError as Error).message);
        console.error('- Original text length:', text.length);
        console.error('- Cleaned text sample:', cleanText.substring(0, 200));
        return {};
      }
    }
  }

  clearSession(title: string): void {
    const sessionKey = this.normalizeTitle(title);
    if (this.chatSessions.has(sessionKey)) {
      this.chatSessions.delete(sessionKey);
      console.log(`🧹 Cleared chat session for "${title}"`);
    }
  }

  clearAllSessions(): void {
    this.chatSessions.clear();
    console.log('🧹 Cleared all chat sessions');
  }
}

// Create singleton instance
const songInformationService = new SongInformationService();
const enhancedGeminiService = songInformationService; // Alias for compatibility

// Export singleton instances and class
export { songInformationService, enhancedGeminiService, SongInformationService };
export default songInformationService;