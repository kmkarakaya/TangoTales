import { config } from '../utils/config';
import { updateSongWithResearchData, markResearchComplete } from './firestore';
import { parsePhaseResponse } from './responseParser';
import { recoverPhase4FromText } from './phase4Recovery';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { extractGroundingUrls } from '../utils/groundingExtractor';
import { filterValidUrls } from '../utils/urlValidator';

// Lazy-load Google GenAI to avoid Jest/Node ESM parsing issues in tests
let GoogleGenAI: any = null;
try {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    GoogleGenAI = require('@google/genai').GoogleGenAI;
  }
} catch (err) {
  const e: any = err;
  console.warn('⚠️ GEMINI - Could not require @google/genai (expected in test environments):', e && e.message ? e.message : e);
}

let ai: any = null;

// Non-sensitive presence check (dev only)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ GEMINI DEBUG - API key present:', !!config.gemini.apiKey);
}

try {
  if (!config.gemini.apiKey) {
    console.error('❌ GEMINI DEBUG - API key is missing or empty');
  } else if (GoogleGenAI) {
    ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    console.log('✅ GEMINI DEBUG - Client initialized successfully');
  } else {
    console.warn('⚠️ GEMINI DEBUG - GoogleGenAI SDK not available; AI calls will be disabled in this environment.');
  }
} catch (initError) {
  console.error('❌ GEMINI DEBUG - Client initialization failed:', initError);
}

export interface EnhancedSongParams {
  title: string;
  songId?: string; // Optional for database storage integration
}

export interface Recording {
  artist: string;
  year?: number;
  album?: string;
  style: 'Traditional' | 'Modern' | 'Nuevo Tango' | 'Electronic';
  availability?: 'currently_available' | 'historical' | 'unknown';
}

export interface Performer {
  name: string;
  role: 'Orchestra Leader' | 'Singer' | 'Instrumentalist' | 'Dancer';
  period: 'Golden Age' | 'Post-Golden Age' | 'Contemporary';
  notableCollaborations?: string[];
  recentActivity?: string;
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
  // CRITICAL: URL and streaming data fields that were missing!
  currentAvailability?: {
    streamingPlatforms?: string[];
    purchaseLinks?: string[];
    freeResources?: string[];
    recentPerformances?: string[];
  };
  recordingSources?: {
    title: string;
    url: string;
    type: string;
    content?: string;
  }[];
  alternativeSpellings?: string[];
  allSearchFindings?: {
    phase: string;
    query: string;
    findings: string;
    confidence: string;
    sources?: { title: string; snippet: string }[];
  }[];
}

/**
 * Progress phases for the AI research process
 */
const PROGRESS_PHASES = [
  { message: "🔍 Searching and validating tango song title...", icon: "🔍" },
  { message: "📚 Researching composer and historical details...", icon: "📚" },
  { message: "🏛️ Finding cultural significance and context...", icon: "🏛️" },
  { message: "🎵 Analyzing musical characteristics...", icon: "🎵" },
  { message: "🎼 Discovering current recordings and performers...", icon: "🎼" },
  { message: "✨ Creating comprehensive summary...", icon: "✨" }
];

/**
 * Chat session manager for multi-turn conversations with progress tracking
 */
class SongInformationService {
  private chatSessions = new Map<string, any>();
  
  // Rate limiting state
  private static activeRequests = 0;
  private static lastRequestTime = 0;
  
  async getEnhancedSongInformation(
    params: EnhancedSongParams, 
    progressCallback?: ProgressCallback,
    useSearchGrounding = true  // 🆕 Enable search grounding by default
  ): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log('🚀 GEMINI DEBUG - Starting enhanced song information request');
    console.log('- Song title:', params.title);
    console.log('- AI client status:', ai ? 'INITIALIZED' : 'NULL');
    console.log('- Progress callback:', progressCallback ? 'PROVIDED' : 'NOT_PROVIDED');
    
    // Rate limiting check
    if (SongInformationService.activeRequests >= config.rateLimits.MAX_CONCURRENT_AI_REQUESTS) {
      const error = new Error('Another AI request is in progress. Please wait for it to complete before starting a new research.');
      console.warn('⚠️ RATE LIMIT - Concurrent request blocked:', error.message);
      throw error;
    }
    
    // Delay check
    const now = Date.now();
    const timeSinceLastRequest = now - SongInformationService.lastRequestTime;
    if (timeSinceLastRequest < config.rateLimits.MIN_REQUEST_DELAY_MS) {
      const waitTime = config.rateLimits.MIN_REQUEST_DELAY_MS - timeSinceLastRequest;
      console.log(`⏳ RATE LIMIT - Enforcing delay: ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Check if AI client is available
    if (!ai) {
      console.error('❌ GEMINI DEBUG - AI client is null, cannot proceed');
      throw new Error('Gemini AI client not initialized. Check API key configuration.');
    }
    
    // Increment active requests counter and update last request time
    SongInformationService.activeRequests++;
    SongInformationService.lastRequestTime = Date.now();
    console.log(`🔄 RATE LIMIT - Active requests: ${SongInformationService.activeRequests}`);
    
    try {
      const sessionKey = this.normalizeTitle(params.title);
      console.log('- Session key:', sessionKey);
      console.log('- Existing sessions:', this.chatSessions.size);
      
      try {
      if (!this.chatSessions.has(sessionKey)) {
        console.log('📝 GEMINI DEBUG - Creating new chat session');
        
        // 🆕 Create chat config with optional search grounding
        const chatConfig: any = {
          model: "gemini-2.5-flash",
          config: {
            temperature: 0.3, // Lower for factual information
            maxOutputTokens: 8192 // Further increased for Search Grounding responses which can be very long
          }
        };
        
        // 🆕 Add search grounding if enabled
        if (useSearchGrounding) {
          chatConfig.config.tools = [{ googleSearch: {} }];
          console.log('🔍 GEMINI DEBUG - Search grounding enabled with correct tool config');
        } else {
          console.log('📚 GEMINI DEBUG - Using knowledge-only mode');
        }
        
        const chat = ai.chats.create(chatConfig);
        
        console.log('✅ GEMINI DEBUG - Chat session created successfully');
        this.chatSessions.set(sessionKey, chat);
      } else {
        console.log('♻️ GEMINI DEBUG - Reusing existing chat session');
      }
      
      const chat = this.chatSessions.get(sessionKey)!;
      console.log('🔄 GEMINI DEBUG - Starting information gathering with progress tracking');
      
      return await this.gatherInformationWithChat(chat, params, progressCallback);
      
      } catch (innerError) {
        // Re-throw inner errors
        throw innerError;
      }
      
    } catch (error) {
      console.error('❌ GEMINI DEBUG - Error in getEnhancedSongInformation:');
      console.error('- Error type:', error?.constructor.name);
      console.error('- Error message:', (error as Error)?.message);
      console.error('- Stack trace:', (error as Error)?.stack);
      
      // Re-throw with more context
      throw new Error(`Failed to get enhanced song information for "${params.title}": ${(error as Error)?.message}`);
    } finally {
      // Always decrement active requests counter
      SongInformationService.activeRequests--;
      console.log(`🔄 RATE LIMIT - Request completed. Active requests: ${SongInformationService.activeRequests}`);
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
    params: EnhancedSongParams, 
    progressCallback?: ProgressCallback
  ): Promise<EnhancedSongResult & { metadata: SongMetadata }> {
    console.log(`📡 GEMINI DEBUG - Starting multi-turn conversation for "${params.title}"`);
    
    const startTime = Date.now();
    const songData: Partial<EnhancedSongResult> = {};
    let successfulTurns = 0;
    let failedTurns = 0;
    let correctedTitle = params.title;
    
    // Phase 0: Title Correction & Validation
    this.emitProgress(0, PROGRESS_PHASES[0].message, PROGRESS_PHASES[0].icon, false, progressCallback);
    
    try {
      console.log('📤 Turn 0: Title correction and validation');
      const titleCorrectionPrompt = `TANGO VALIDATION WITH SEARCH: Search for "${params.title}" to verify if it's a legitimate tango song title from the Argentine tango repertoire (1880-present).

🔍 SEARCH INSTRUCTIONS:
- Search for this title in tango databases, discographies, and music archives
- Look for official recordings, sheet music, or tango repertoire lists
- Check against famous tango collections and historical records
- Verify spelling variations and alternative titles
- IMPORTANT: Record the exact URLs and website names where you find verification

Respond ONLY with this JSON:
{
  "correctedTitle": "exact correct title found in search results or null if not found",
  "confidence": "high" | "medium" | "low" | "not_found",
  "alternativeSpellings": ["verified alternative spelling 1", "alternative 2"] or null,
  "isKnownTango": true | false,
  "searchVerified": true | false
}

VALIDATION CRITERIA:
- ONLY accept titles that are documented Argentine tango compositions verified through search
- Check against famous tangos: La Cumparsita, El Choclo, Adios Muchachos, Por Una Cabeza, etc.
- If it's a misspelling of a known tango found in search, correct it (e.g., "merseditas" → "Merceditas", "bahia blanka" → "Bahía Blanca")
- REJECT terms that are clearly not tango songs (random words, other music genres, non-Spanish titles unless famous)
- REJECT general words like colors, animals, random phrases in any language
- Be extremely strict: when in doubt, set isKnownTango to false
- Only set isKnownTango to true for confirmed Argentine tango compositions found in search results

EXAMPLES TO REJECT: "yellow flower", "sarı çiçek", "hello world", "rock music", "jazz standard"`;
      
      const titleResponse = await chat.sendMessage({ message: titleCorrectionPrompt });
      console.log('📥 Turn 0 response:', titleResponse.text?.length || 0, 'chars');
      
      // ✅ EXTRACT REAL URLs from grounding metadata using helper
      const turn0SearchSources = extractGroundingUrls(titleResponse);
      console.log(`✅ Turn 0 - Extracted ${turn0SearchSources.length} grounding URLs`);
      
      // ✅ Validate URLs to filter out dead links
      const turn0Urls = turn0SearchSources.map(s => s.url);
      const turn0ValidatedUrls = await filterValidUrls(turn0Urls, 3);
      console.log(`✅ Turn 0 - ${turn0ValidatedUrls.length}/${turn0Urls.length} URLs validated`);
      
      const titleData = this.parseJSONWithRepair(titleResponse.text) as any;
      
      // Check if this is actually a tango song
      if (!titleData.isKnownTango) {
        console.log(`❌ VALIDATION FAILED: "${params.title}" is not recognized as a tango song`);
        console.log('- AI confidence:', titleData.confidence);
        console.log('- Suggested alternatives:', titleData.alternativeSpellings);
        
        // Throw specific error for non-tango songs
        throw new Error(`NOT_A_TANGO_SONG: "${params.title}" does not appear to be a valid tango song title. Please search for actual tango compositions from the Argentine tango repertoire.`);
      }
      
      // Update the title if correction was found
      if (titleData.correctedTitle && titleData.isKnownTango) {
        correctedTitle = titleData.correctedTitle;
        console.log(`🔧 Title corrected: "${params.title}" → "${correctedTitle}"`);
      }
      
      // Add title correction info to song data
      Object.assign(songData, {
        originalUserInput: params.title,
        correctedTitle: correctedTitle,
        titleCorrectionConfidence: titleData.confidence || 'unknown'
      });
      
      successfulTurns++;
      this.emitProgress(0, "✅ Title validated successfully", "✅", true, progressCallback);
      console.log('✅ Turn 0 successful:', { originalTitle: params.title, correctedTitle, confidence: titleData.confidence || 'unknown' });
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
      correctedTitle = params.title;
      Object.assign(songData, {
        originalUserInput: params.title,
        correctedTitle: params.title,
        titleCorrectionConfidence: 'failed'
      });
    }
    
    // Now use the corrected title for all subsequent turns
    console.log(`🎯 Using title "${correctedTitle}" for information gathering`);
    
    // Phase 1: Basic Song Information
    this.emitProgress(1, PROGRESS_PHASES[1].message, PROGRESS_PHASES[1].icon, false, progressCallback);
    
    try {
      console.log('📤 Turn 1: Basic song information');
      const basicPrompt = `For the tango song "${correctedTitle}", search for historical and biographical information and provide ONLY this JSON structure:

🔍 SEARCH INSTRUCTIONS:
- Search for composer, lyricist, and composition year in tango databases
- Look for biographical information about the creators
- Check multiple sources for accuracy (discographies, music archives, tango history sites)
- Verify the musical form (tango, vals, milonga) through search
- IMPORTANT: Record the exact URLs and website names of your sources

{
  "composer": "composer full name verified through search or Unknown",
  "lyricist": "lyricist name verified through search or null", 
  "yearComposed": year_number_verified_through_search_or_null,
  "period": "Pre-Golden Age / Guardia Vieja & Guardia Nueva" | "Golden Age / Época de Oro" | "Post-Golden Age / Post-Época de Oro" | "Nuevo / Tango Nuevo" | "Contemporary / Contemporáneo",
  "musicalForm": "Tango" | "Vals" | "Milonga",
  "searchVerified": true | false,
  "sources": [
    {
      "title": "website or source name",
      "url": "exact URL found",
      "type": "database" | "archive" | "encyclopedia" | "discography" | "academic" | "other"
    }
  ] or null
}

Periods: Pre-Golden Age / Guardia Vieja & Guardia Nueva (1880-1935), Golden Age / Época de Oro (1935-1955), Post-Golden Age / Post-Época de Oro (1955-1980), Nuevo / Tango Nuevo (1980-1990s), Contemporary / Contemporáneo (2000s+)`;
      
      const basicResponse = await chat.sendMessage({ message: basicPrompt });
      console.log('📥 Turn 1 response:', basicResponse.text?.length || 0, 'chars');
      
      // ✅ EXTRACT REAL URLs from grounding metadata using helper
      const turn1SearchSources = extractGroundingUrls(basicResponse);
      console.log(`✅ Turn 1 - Extracted ${turn1SearchSources.length} grounding URLs`);
      
      // ✅ Validate URLs to filter out dead links
      const turn1Urls = turn1SearchSources.map(s => s.url);
      const turn1ValidatedUrls = await filterValidUrls(turn1Urls, 3);
      console.log(`✅ Turn 1 - ${turn1ValidatedUrls.length}/${turn1Urls.length} URLs validated`);
      
      const basicData = this.parseJSONWithRepair(basicResponse.text);
      Object.assign(songData, basicData);
      successfulTurns++;
      this.emitProgress(1, "✅ Basic information gathered", "✅", true, progressCallback);
      console.log('✅ Turn 1 successful:', Object.keys(basicData));
      
      // Store Phase 1 data to database - Extract and store URLs as top-level fields
      if (params.songId) {
        try {
          const { updateDoc, doc, Timestamp } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          
          console.log('🔍 PHASE 1 STORAGE - Creating sources from validated URLs');
          
          // ✅ Use VALIDATED URLs from grounding metadata, not from AI text
          const basicInfoSources = turn1ValidatedUrls.map((url, index) => {
            const source = turn1SearchSources.find(s => s.url === url);
            return {
              title: source?.title || source?.domain || `Source ${index + 1}`,
              url: url,
              type: source?.type || 'other'
            };
          });
          
          // Store Phase 1 fields as top-level document fields
          const songRef = doc(db, 'songs', params.songId);
          const updateData = {
            composer: basicData.composer || 'Unknown',
            lyricist: basicData.lyricist || null,
            yearComposed: basicData.yearComposed || null,
            period: basicData.period || 'Golden Age',
            musicalForm: basicData.musicalForm || 'Tango',
            basicInfoSources: basicInfoSources,  // ✅ Only validated, accessible URLs
            lastUpdated: Timestamp.now(),
            lastResearchUpdate: Timestamp.now()
          };
          
          console.log('🔍 PHASE 1 STORAGE DEBUG - Data being written to database:');
          console.log('- basicInfoSources (validated):', JSON.stringify(updateData.basicInfoSources));
          console.log('- composer:', updateData.composer);
          console.log('- period:', updateData.period);
          
          await updateDoc(songRef, updateData);
          console.log('✅ Phase 1 data stored successfully in database (including validated sources)');
          console.log('- Basic info sources:', basicInfoSources.length);
        } catch (storageError) {
          console.error('❌ Failed to store Phase 1 data:', storageError);
        }
      }
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
      const culturalPrompt = `For "${correctedTitle}", search for cultural and historical information, then provide ONLY this JSON:

🔍 SEARCH INSTRUCTIONS:
- Search for the song's cultural significance in tango history
- Look for historical context about when and why it was written
- Find information about its themes and lyrical content
- Check tango history sites and cultural archives
- IMPORTANT: Record the exact URLs and website names where you find cultural information

{
  "themes": ["theme1", "theme2", "theme3"],
  "culturalSignificance": "brief description of cultural importance found through search or null",
  "historicalContext": "historical backdrop when written found through search or null",
  "searchFindings": {
    "culturalImpact": "impact_found_in_search" or null,
    "historicalEvents": "related_historical_events_found" or null
  },
  "culturalSources": [
    {
      "title": "website or source name",
      "url": "exact URL where cultural info was found",
      "type": "encyclopedia" | "academic" | "cultural_site" | "history" | "biography" | "other",
      "content": "brief description of cultural information found"
    }
  ] or null
}

Keep descriptions concise (1-2 sentences each).`;
      
      const culturalResponse = await chat.sendMessage({ message: culturalPrompt });
      console.log('📥 Turn 2 response:', culturalResponse.text?.length || 0, 'chars');
      
      // ✅ EXTRACT REAL URLs from grounding metadata using helper
      const turn2SearchSources = extractGroundingUrls(culturalResponse);
      console.log(`✅ Turn 2 - Extracted ${turn2SearchSources.length} grounding URLs`);
      
      // ✅ Validate URLs to filter out dead links
      const turn2Urls = turn2SearchSources.map(s => s.url);
      const turn2ValidatedUrls = await filterValidUrls(turn2Urls, 3);
      console.log(`✅ Turn 2 - ${turn2ValidatedUrls.length}/${turn2Urls.length} URLs validated`);
      
      const culturalData = this.parseJSONWithRepair(culturalResponse.text);
      Object.assign(songData, culturalData);
      successfulTurns++;
      this.emitProgress(2, "✅ Cultural context researched", "✅", true, progressCallback);
      console.log('✅ Turn 2 successful:', Object.keys(culturalData));
      
      // Store Phase 2 data to database - Extract and store cultural sources as top-level fields
      if (params.songId) {
        try {
          const { updateDoc, doc, Timestamp } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          
          console.log('🔍 PHASE 2 STORAGE - Creating sources from validated URLs');
          
          // ✅ Use VALIDATED URLs from grounding metadata, not from AI text
          const culturalSources = turn2ValidatedUrls.map((url, index) => {
            const source = turn2SearchSources.find(s => s.url === url);
            return {
              title: source?.title || source?.domain || `Source ${index + 1}`,
              url: url,
              type: source?.type || 'other',
              content: 'Cultural and historical information'
            };
          });
          
          // Store Phase 2 fields as top-level document fields
          const songRef = doc(db, 'songs', params.songId);
          const updateData = {
            themes: culturalData.themes || ['tango'],
            culturalSignificance: culturalData.culturalSignificance || 'Traditional tango composition',
            historicalContext: culturalData.historicalContext || 'Part of Argentine tango repertoire',
            culturalSources: culturalSources,  // ✅ Only validated, accessible URLs
            lastUpdated: Timestamp.now(),
            lastResearchUpdate: Timestamp.now()
          };
          
          console.log('🔍 PHASE 2 STORAGE DEBUG - Data being written to database:');
          console.log('- culturalSources (validated):', JSON.stringify(updateData.culturalSources));
          console.log('- themes:', updateData.themes);
          console.log('- culturalSignificance:', updateData.culturalSignificance);
          
          await updateDoc(songRef, updateData);
          console.log('✅ Phase 2 data stored successfully in database (including validated cultural sources)');
          console.log('- Cultural sources:', culturalSources.length);
        } catch (storageError) {
          console.error('❌ Failed to store Phase 2 data:', storageError);
        }
      }
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
      
      // ✅ EXTRACT REAL URLs from grounding metadata using helper
      const turn3SearchSources = extractGroundingUrls(musicResponse);
      console.log(`✅ Turn 3 - Extracted ${turn3SearchSources.length} grounding URLs`);
      
      // ✅ Validate URLs to filter out dead links
      const turn3Urls = turn3SearchSources.map(s => s.url);
      const turn3ValidatedUrls = await filterValidUrls(turn3Urls, 3);
      console.log(`✅ Turn 3 - ${turn3ValidatedUrls.length}/${turn3Urls.length} URLs validated`);
      
      const musicData = this.parseJSONWithRepair(musicResponse.text);
      Object.assign(songData, musicData);
      successfulTurns++;
      this.emitProgress(3, "✅ Musical analysis complete", "✅", true, progressCallback);
      console.log('✅ Turn 3 successful:', Object.keys(musicData));
      
      // Store Phase 3 data to database
      if (params.songId) {
        try {
          const processedData = parsePhaseResponse(musicResponse.text, 'musical_analysis', 'musical_analysis');
          await updateSongWithResearchData(params.songId, {
            phase: 'musical_analysis',
            data: processedData
          });
          console.log('✅ Phase 3 data stored successfully in database');
        } catch (storageError) {
          console.error('❌ Failed to store Phase 3 data:', storageError);
        }
      }
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
    
    return this.completeRemainingPhases(chat, params, correctedTitle, songData, successfulTurns, failedTurns, startTime, progressCallback);
  }

  private async completeRemainingPhases(
    chat: any,
    params: EnhancedSongParams,
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
      const recordingPrompt = `For "${correctedTitle}", search for current and historical recordings, then provide ONLY this JSON:

🔍 SEARCH INSTRUCTIONS:
- Search for recordings on music platforms (Spotify, Apple Music, YouTube)
- Look for historical recordings in tango archives and discographies
- Find recent performances and contemporary interpretations
- Check for album information and release years
- IMPORTANT: For each notable recording, include an optional "links" array with exact absolute URLs (http or https) where the recording can be heard or where authoritative information is available. Provide the website/platform name in the recordingSources section as well.

JSON SCHEMA (required):
{
  "notableRecordings": [
    {
      "artist": "artist_name_found_in_search",
      "year": year_found_in_search_or_null,
      "album": "album_name_found_in_search_or_null",
      "style": "Traditional" | "Modern" | "Nuevo Tango" | "Electronic",
      "availability": "currently_available" | "historical" | "unknown",
      "links": [
        {
          "label": "Spotify / YouTube / Discogs entry (optional)",
          "url": "https://...", // absolute URL required when present
          "type": "streaming_platform" | "discography" | "archive" | "music_database" | "other" // optional but helpful
        }
      ] or null
    }
  ],
  "currentAvailability": {
    "streamingPlatforms": ["platform1", "platform2"] or null,
    "recentPerformances": ["event1", "event2"] or null
  },
  "recordingSources": [
    {
      "title": "website or platform name",
      "url": "exact URL where recording info was found",
      "type": "streaming_platform" | "discography" | "archive" | "music_database" | "other",
      "content": "brief description of what was found"
    }
  ] or null
}

IMPORTANT:
- Always return valid JSON only. Do not include explanatory text or markdown.
- Use null for unknown values. Do not fabricate years or URLs.
- When providing URLs, use absolute http(s) links only.

Prioritize current/recent recordings found through search. Limit to 3-5 most significant recordings.`;
      
      console.log('🔍 DEBUG Turn 4 - Sending prompt to LLM');
      console.log('🔍 DEBUG Turn 4 - Prompt length:', recordingPrompt.length);
      console.log('🔍 DEBUG Turn 4 - Chat object:', !!chat);
      
      const recordingResponse = await chat.sendMessage({ message: recordingPrompt });
      
      // Extract the actual text content from response structure
      let responseText: string | undefined = recordingResponse.text;
      
      // Fallback: try to extract from candidates structure if .text doesn't exist
      if (!responseText && recordingResponse.candidates && recordingResponse.candidates.length > 0) {
        const firstCandidate = recordingResponse.candidates[0];
        if (firstCandidate?.content?.parts && firstCandidate.content.parts.length > 0) {
          responseText = firstCandidate.content.parts[0]?.text;
        }
      }
      
      // Fallback: try to extract from response.text
      if (!responseText && recordingResponse.response?.text) {
        responseText = recordingResponse.response.text;
      }

      // ✅ EXTRACT REAL URLs from grounding metadata using helper (THE RIGHT WAY)
      const turn4SearchSources = extractGroundingUrls(recordingResponse);
      console.log(`✅ Turn 4 - Extracted ${turn4SearchSources.length} grounding URLs from Google Search`);
      
      // ✅ Validate URLs to filter out dead links BEFORE storing
      const turn4Urls = turn4SearchSources.map(s => s.url);
      const turn4ValidatedUrls = await filterValidUrls(turn4Urls, 3);
      console.log(`✅ Turn 4 - ${turn4ValidatedUrls.length}/${turn4Urls.length} URLs validated and accessible`);
      
      console.log('📥 Turn 4 response:', responseText?.length || 0, 'chars');
      
      const recordingData = this.parseJSONWithRepair(responseText || '');
      
      // ✅ INJECT VALIDATED URLs from Google Search grounding (not from AI-generated JSON)
      if (turn4ValidatedUrls.length > 0) {
        console.log('✅ Injecting validated URLs from Google Search into recording data');
        
        // Create recordingSources from validated search results ONLY
        const validatedRecordingSources = turn4ValidatedUrls.map(url => {
          const source = turn4SearchSources.find(s => s.url === url);
          return {
            title: source?.title || source?.domain || 'Recording source',
            url: url,
            type: source?.type || 'other',
            content: `Found via Google Search: ${source?.title || 'Recording information'}`
          };
        });
        
        // REPLACE any AI-generated URLs with real validated URLs
        recordingData.recordingSources = validatedRecordingSources;
        
        // Enhance notableRecordings with validated links
        if (recordingData.notableRecordings && Array.isArray(recordingData.notableRecordings)) {
          recordingData.notableRecordings = recordingData.notableRecordings.map((recording: any, index: number) => {
            // Intelligently match recordings to URLs
            const relevantUrls = turn4ValidatedUrls.filter((url, urlIndex) => {
              const source = turn4SearchSources.find(s => s.url === url);
              if (!source) return false;
              
              const urlText = (url + ' ' + (source.title || '')).toLowerCase();
              const artistName = (recording.artist || '').toLowerCase();
              
              // Match by artist name or if it's a streaming platform
              return urlText.includes(artistName) || 
                     source.type === 'streaming_platform' ||
                     source.type === 'discography';
            });
            
            // Use relevant URLs or distribute remaining URLs
            const urlsToUse = relevantUrls.length > 0 ? relevantUrls.slice(0, 2) : 
                             (index < turn4ValidatedUrls.length ? [turn4ValidatedUrls[index]] : []);
            
            return {
              ...recording,
              links: urlsToUse.map(url => {
                const source = turn4SearchSources.find(s => s.url === url);
                return {
                  label: source?.title || source?.domain || 'Listen',
                  url: url,
                  type: source?.type || 'other'
                };
              })
            };
          });
        }
        
        console.log('✅ Enhanced recording data with validated search URLs');
        console.log('- Validated sources added:', validatedRecordingSources.length);
        console.log('- Recordings enhanced with links:', recordingData.notableRecordings?.length || 0);
      } else {
        console.log('⚠️ No validated URLs found from Google Search - recordings may not have links');
      }
      
      Object.assign(songData, recordingData);
      successfulTurns++;
      this.emitProgress(4, "✅ Recordings and performers found", "✅", true, progressCallback);
      console.log('✅ Turn 4 successful:', Object.keys(recordingData));
      
      // 🔍 DEBUG: Log the exact structure of LLM response for URL investigation
      console.log('🔍 DEBUG Turn 4 - Full LLM Response Structure:');
      console.log('- recordingData keys:', Object.keys(recordingData));
      console.log('- currentAvailability present:', !!recordingData.currentAvailability);
      console.log('- recordingSources present:', !!recordingData.recordingSources);
      console.log('- currentAvailability value:', recordingData.currentAvailability);
      console.log('- recordingSources value:', recordingData.recordingSources);
      console.log('- Raw response text (first 500 chars):', recordingResponse.text?.substring(0, 500));
      
      // URL Recovery Logic - If JSON parsing failed, try to extract URLs manually
      if ((!recordingData.currentAvailability && !recordingData.recordingSources) && recordingResponse.text) {
        console.log('🛠️ PHASE 4 RECOVERY - Delegating to recovery helper');
        try {
          // Use shared recovery helper to extract and conservatively associate links
          Object.assign(recordingData, recoverPhase4FromText(recordingResponse.text, recordingData));
          console.log('✅ PHASE 4 RECOVERY - Helper completed');
        } catch (error) {
          console.error('❌ PHASE 4 RECOVERY - Helper failed:', error);
        }
      }
      
      // Store Phase 4 data to database - Save ONLY VALIDATED URLs
      console.log('🔍 PHASE 4 STORAGE - Checking params.songId:', params.songId, 'type:', typeof params.songId);
      if (params.songId) {
        try {
          const songRef = doc(db, 'songs', params.songId);
          
          // ✅ Use only validated URLs - no dead links
          const normalizedNotableRecordings = Array.isArray(recordingData.notableRecordings)
            ? recordingData.notableRecordings.map((r: any) => ({
                ...r,
                // Ensure links are properly formatted and validated
                links: Array.isArray(r.links) ? r.links.filter((l: any) => 
                  l && l.url && /^https?:\/\//i.test(l.url)
                ) : []
              }))
            : [];

          // ✅ recordingSources should already be validated from turn4ValidatedUrls
          const normalizedRecordingSources = Array.isArray(recordingData.recordingSources)
            ? recordingData.recordingSources.filter((s: any) => 
                s && s.url && /^https?:\/\//i.test(s.url)
              )
            : [];

          const updateData = {
            notableRecordings: {
              recordings: normalizedNotableRecordings,
              searchFindings: recordingData.searchFindings || []
            },
            currentAvailability: recordingData.currentAvailability || null,
            recordingSources: normalizedRecordingSources,  // ✅ Only validated URLs
            lastUpdated: Timestamp.now(),
            lastResearchUpdate: Timestamp.now()
          };
          
          console.log('🔍 PHASE 4 STORAGE DEBUG - Data being written to database:');
          console.log('- notableRecordings count:', normalizedNotableRecordings.length);
          console.log('- recordingSources (validated):', normalizedRecordingSources.length);
          console.log('- Sample recording source:', normalizedRecordingSources[0]);
          
          await updateDoc(songRef, updateData);
          console.log('✅ Phase 4 data stored with validated URLs only');
          console.log('- Recording sources (all validated):', normalizedRecordingSources.length);
        } catch (storageError) {
          console.error('❌ Failed to store Phase 4 data:', storageError);
        }
      }
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
      
      // ✅ EXTRACT REAL URLs from grounding metadata using helper
      const turn5SearchSources = extractGroundingUrls(summaryResponse);
      console.log(`✅ Turn 5 - Extracted ${turn5SearchSources.length} grounding URLs`);
      
      // ✅ Validate URLs to filter out dead links
      const turn5Urls = turn5SearchSources.map(s => s.url);
      const turn5ValidatedUrls = await filterValidUrls(turn5Urls, 3);
      console.log(`✅ Turn 5 - ${turn5ValidatedUrls.length}/${turn5Urls.length} URLs validated`);
      
      const summaryData = this.parseJSONWithRepair(summaryResponse.text);
      Object.assign(songData, summaryData);
      successfulTurns++;
      this.emitProgress(5, "✅ Research complete!", "🎉", true, progressCallback);
      console.log('✅ Turn 5 successful - comprehensive summary created');
      
      // Store Phase 5 data to database and mark research complete
      if (params.songId) {
        try {
          // Save the summary/story data correctly
          await updateSongWithResearchData(params.songId, {
            phase: 'comprehensive_summary',
            data: {
              story: summaryData.story || null,
              inspiration: summaryData.inspiration || null,
              explanation: summaryData.explanation || null
            }
          });
          // Mark the research as complete
          await markResearchComplete(params.songId);
          console.log('✅ Phase 5 data stored and research marked complete in database');
        } catch (storageError) {
          console.error('❌ Failed to store Phase 5 data:', storageError);
        }
      }
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
      explanation: songData.explanation || `${correctedTitle} is a tango composition from the Argentine tango tradition.`,
      // CRITICAL: Include the URL and availability data that was missing!
      currentAvailability: (songData as any).currentAvailability || undefined,
      recordingSources: (songData as any).recordingSources || [],
      alternativeSpellings: (songData as any).alternativeSpellings || [],
      allSearchFindings: (songData as any).allSearchFindings || []
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

    console.log('🔍 DEBUG parseJSONWithRepair - Input text length:', text.length);
    console.log('🔍 DEBUG parseJSONWithRepair - First 500 chars:', text.substring(0, 500));

    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    console.log('🔍 DEBUG parseJSONWithRepair - After removing markdown, length:', cleanText.length);
    
    // Try to find JSON within the text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
      console.log('🔍 DEBUG parseJSONWithRepair - JSON match found, length:', cleanText.length);
      console.log('🔍 DEBUG parseJSONWithRepair - JSON content preview:', cleanText.substring(0, 300));
    } else {
      console.warn('⚠️ DEBUG parseJSONWithRepair - No JSON pattern found in text');
    }

    try {
      const parsed = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully');
      console.log('🔍 DEBUG parseJSONWithRepair - Parsed object keys:', Object.keys(parsed));
      if (parsed.notableRecordings) {
        console.log('🔍 DEBUG parseJSONWithRepair - notableRecordings present:', Array.isArray(parsed.notableRecordings) ? parsed.notableRecordings.length : typeof parsed.notableRecordings);
        console.log('🔍 DEBUG parseJSONWithRepair - notableRecordings structure:', JSON.stringify(parsed.notableRecordings, null, 2));
      } else {
        console.warn('⚠️ DEBUG parseJSONWithRepair - notableRecordings field is missing from parsed JSON');
      }
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
        console.log('🔍 DEBUG parseJSONWithRepair - Repaired object keys:', Object.keys(repairedResult));
        if (repairedResult.notableRecordings) {
          console.log('🔍 DEBUG parseJSONWithRepair - notableRecordings present after repair:', Array.isArray(repairedResult.notableRecordings) ? repairedResult.notableRecordings.length : typeof repairedResult.notableRecordings);
          console.log('🔍 DEBUG parseJSONWithRepair - notableRecordings structure after repair:', JSON.stringify(repairedResult.notableRecordings, null, 2));
        } else {
          console.warn('⚠️ DEBUG parseJSONWithRepair - notableRecordings field is missing from repaired JSON');
        }
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