# Phase 1 MVP - Missing Actions TODO

## 🚨 **HIGH PRIORITY - BLOCKERS FOR MVP LAUNCH**

### 1. Database Setup/Migration Script
**Status**: ❌ **MISSING** - Critical blocker  
**Priority**: 🚨 **IMMEDIATE**  
**Estimate**: 4-6 hours  

**What to do**:
```javascript
// Create: setup-enhanced-database.js in root directory
// Purpose: Initialize development database with enhanced schema

const setupEnhancedDatabase = async () => {
  // 1. Clear existing demo data
  await clearDevelopmentData();
  
  // 2. Initialize with sample enhanced songs
  await initializeEnhancedDatabase();
  
  // 3. Set up Firestore security rules for enhanced schema
  await updateFirestoreRules();
  
  // 4. Create composite indexes for new query patterns
  await createOptimizedIndexes();
  
  console.log('✅ Enhanced database setup complete!');
};

// Implementation steps:
// - Copy clearDevelopmentData() function from song_info.md line 677
// - Copy initializeEnhancedDatabase() function from song_info.md line 692
// - Add to package.json: "setup:db": "node setup-enhanced-database.js"
// - Test with: npm run setup:db
```

**Files to create**:
- `setup-enhanced-database.js` (root directory)
- Update `package.json` scripts section

**Why critical**: Without this, developers can't initialize clean development environment with enhanced schema.

---

### 2. Sample Enhanced Songs Data
**Status**: ❌ **MISSING** - Testing blocker  
**Priority**: 🚨 **IMMEDIATE**  
**Estimate**: 2-3 hours  

**What to do**:
```javascript
// Add to setup-enhanced-database.js
const sampleEnhancedSongs = [
  {
    title: "La Cumparsita",
    composer: "Gerardo Matos Rodríguez",
    lyricist: "Pascual Contursi",
    yearComposed: 1916,
    period: "Golden Age",
    musicalForm: "Tango",
    themes: ["nostalgia", "melancholy", "love", "loss"],
    culturalSignificance: "Considered the most famous tango worldwide, La Cumparsita is often called the 'tango anthem' and represents the soul of Argentine tango music.",
    historicalContext: "Composed during the golden age of tango in Buenos Aires, when the genre was gaining international recognition.",
    musicalCharacteristics: ["distinctive melody", "minor key modulations", "traditional 2/4 rhythm"],
    danceStyle: ["classic tango", "dramatic pauses", "intricate footwork"],
    notableRecordings: [
      {
        artist: "Carlos Gardel",
        orchestra: null,
        year: 1924,
        significance: "The definitive vocal interpretation that popularized the song worldwide"
      },
      {
        artist: "Juan D'Arienzo",
        orchestra: "Orquesta Juan D'Arienzo",
        year: 1937,
        significance: "The rhythmic interpretation that became the standard for dancers"
      }
    ],
    notablePerformers: [
      {
        name: "Carlos Gardel",
        role: "Singer",
        significance: "Made the song internationally famous with his vocal interpretation"
      }
    ],
    recommendedForDancing: true,
    danceRecommendations: "Perfect for advanced dancers, allows for dramatic interpretation and complex figures",
    story: "The lyrics tell of a little parade (cumparsita) that passes by, evoking memories of lost love and the passage of time.",
    inspiration: "Originally written as an instrumental march, later transformed into a tango with the addition of Contursi's poignant lyrics.",
    explanation: "La Cumparsita stands as the most recognizable tango composition worldwide..."
  },
  {
    title: "El Choclo",
    composer: "Ángel Villoldo",
    yearComposed: 1903,
    period: "Pre-Golden Age",
    musicalForm: "Tango",
    themes: ["passion", "sensuality", "Buenos Aires"],
    culturalSignificance: "One of the earliest and most influential tangos, establishing many conventions of the genre.",
    historicalContext: "Composed during tango's formative years in the neighborhoods of Buenos Aires.",
    musicalCharacteristics: ["syncopated rhythm", "passionate melody", "accordion-style phrasing"],
    danceStyle: ["sensual", "close embrace", "traditional tango"],
    notableRecordings: [
      {
        artist: "Francisco Canaro",
        orchestra: "Orquesta Francisco Canaro",
        year: 1926,
        significance: "Classic orchestral arrangement that defined the song's structure"
      }
    ],
    notablePerformers: [
      {
        name: "Francisco Canaro",
        role: "Orchestra Leader",
        significance: "Pioneer of tango orchestration and recording"
      }
    ],
    recommendedForDancing: true,
    danceRecommendations: "Excellent for close embrace dancing, moderate tempo suitable for all levels",
    explanation: "El Choclo represents the essence of early tango, with its infectious rhythm and passionate melody capturing the spirit of Buenos Aires in the early 1900s..."
  },
  // Add 3-5 more diverse samples covering different periods and styles
  // Include: Vals (3/4 time), Milonga, Contemporary tango
  // Ensure variety in periods: Pre-Golden Age, Golden Age, Post-Golden Age, Contemporary
];
```

**Files to update**:
- `setup-enhanced-database.js` (add sample data array)
- Ensure variety in musical forms, periods, and completeness of fields

**Why critical**: Developers need real enhanced data to test UI components and AI integration.

---

### 3. Playwright UI Testing Implementation
**Status**: ❌ **MISSING** - Mandatory per project requirements  
**Priority**: 🚨 **IMMEDIATE**  
**Estimate**: 6-8 hours  

**What to do**:
```javascript
// Per copilot-instructions.md: "MANDATORY: After any development work, 
// you MUST test the UI using Playwright MCP tools"

// Step 1: Activate Playwright tools
// Use activate_playwright_* functions to access browser testing

// Step 2: Create comprehensive UI tests
// - Test enhanced song detail display
// - Verify responsive design on mobile/tablet viewports  
// - Test progressive disclosure functionality
// - Validate loading states and error boundaries
// - Check accessibility (keyboard navigation, ARIA labels)

// Step 3: Test workflow
// Navigate to http://localhost:3001
// Test search functionality with sample songs
// Verify AI-generated content displays correctly
// Test error states and fallback scenarios
```

**Implementation steps**:
1. Activate Playwright MCP tools using available functions
2. Create test scenarios for enhanced song information display
3. Test responsive design across different viewport sizes
4. Validate error boundaries and loading states
5. Test accessibility compliance

**Why critical**: Explicitly mandated by project requirements for any development work.

---

## 🟡 **MEDIUM PRIORITY - QUALITY IMPROVEMENTS**

### 4. Enhanced Testing Suite
**Status**: ❌ **MISSING** - Quality assurance gap  
**Priority**: 🟡 **MEDIUM**  
**Estimate**: 8-10 hours  

**What to do**:
```javascript
// Current: Only basic App.test.tsx exists
// Need: Comprehensive testing for enhanced functionality

// Create test files:
// 1. src/components/songs/__tests__/EnhancedSongDetail.test.tsx
// 2. src/services/__tests__/enhancedGemini.test.ts
// 3. src/services/__tests__/firestore.test.ts
// 4. src/hooks/__tests__/useSearch.test.ts

// Test coverage needed:
// - Enhanced song information display with all field types
// - AI integration error handling and retry logic
// - Firestore enhanced schema conversion and validation
// - Progressive disclosure UI behavior
// - Error boundary behavior for AI-dependent components
```

**Test scenarios to implement**:
- Unit tests for enhanced song data display
- AI service failure handling and fallback mechanisms
- Firestore data conversion accuracy
- Error boundary recovery scenarios
- Loading state transitions

**Why important**: Ensures reliability of enhanced features and prevents regressions.

---

### 5. Performance Optimization
**Status**: ❌ **MISSING** - User experience impact  
**Priority**: 🟡 **MEDIUM**  
**Estimate**: 4-6 hours  

**What to do**:
```javascript
// Implement client-side caching for enhanced data
// Current: No caching strategy for AI responses

// Create: src/utils/enhancedSongCache.ts
const enhancedSongCache = {
  // Cache AI responses in localStorage
  cacheEnhancedSongData: (songId: string, enhancedData: Song) => {
    const cacheKey = `enhanced_song_${songId}`;
    const cacheData = {
      data: enhancedData,
      timestamp: Date.now(),
      version: '1.0' // For cache invalidation
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  },
  
  // Retrieve cached data with expiration check
  getCachedSongData: (songId: string): Song | null => {
    const cacheKey = `enhanced_song_${songId}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
    
    return isExpired ? null : data;
  },
  
  // Monitor cache size and cleanup
  cleanupExpiredCache: () => {
    // Implement size-based cleanup
    // Remove entries older than 7 days
    // Maintain max 100 cached songs
  }
};
```

**Optimization targets**:
- Reduce Firebase reads for frequently accessed songs
- Cache AI responses to avoid duplicate API calls
- Implement bundle size monitoring
- Optimize component lazy loading

**Why important**: Improves user experience and reduces Firebase/AI API costs.

---

## 🟢 **LOW PRIORITY - NICE TO HAVE**

### 6. Environment Configuration Enhancement
**Status**: 🟡 **PARTIAL** - Basic validation exists  
**Priority**: 🟢 **LOW**  
**Estimate**: 1-2 hours  

**What to do**:
```javascript
// Update check-env.js to validate enhanced feature requirements
// Current: Basic Firebase validation
// Add: Gemini API key validation, enhanced schema validation

const validateEnhancedEnvironment = () => {
  // Check REACT_APP_GEMINI_API_KEY
  // Validate Firebase project configuration for enhanced schema
  // Test AI service connectivity
  // Verify enhanced Firestore security rules
};
```

**Why low priority**: Basic environment validation already exists, this is just enhancement.

---

### 7. Error Boundary Enhancement
**Status**: 🟡 **PARTIAL** - Basic error boundary exists  
**Priority**: 🟢 **LOW**  
**Estimate**: 2-3 hours  

**What to do**:
```javascript
// Update src/components/common/ErrorBoundary.tsx
// Current: Generic error boundary
// Add: AI service failure specific handling

const EnhancedErrorBoundary = ({ children }) => {
  // Handle AI service failures gracefully
  // Provide fallback UI for enhanced components
  // Implement retry mechanisms for AI-dependent features
  // Show user-friendly messages for different error types
};
```

**Why low priority**: Current error boundary handles basic cases, this is incremental improvement.

---

## 🎯 **IMPLEMENTATION TIMELINE**

### **Week 1 - Critical Blockers** (Days 1-5):
- **Day 1-2**: Create database setup script with sample data
- **Day 3-5**: Implement mandatory Playwright UI testing

### **Week 2 - Quality Assurance** (Days 6-10):
- **Day 6-8**: Build comprehensive testing suite  
- **Day 9-10**: Implement performance optimization and caching

### **Future Sprints** (Post-MVP):
- Environment configuration enhancement
- Error boundary improvements
- Additional UI polish and optimizations

---

## 🚀 **DEFINITION OF DONE**

### **MVP Ready Criteria**:
✅ **All HIGH PRIORITY items completed**  
✅ **Database setup script working and tested**  
✅ **Sample enhanced songs displaying correctly**  
✅ **Playwright UI tests passing**  
✅ **Responsive design validated across viewports**  
✅ **AI integration working with fallback mechanisms**  
✅ **Enhanced song information displaying beautifully**

### **Production Ready Criteria**:
✅ **All MEDIUM PRIORITY items completed**  
✅ **Comprehensive test coverage (>80%)**  
✅ **Performance optimization implemented**  
✅ **Error handling robust across all scenarios**  
✅ **Caching strategy reducing API costs**

---

## 📋 **QUICK REFERENCE**

**Commands to run after completing HIGH PRIORITY items**:
```bash
# Setup development database
npm run setup:db

# Start development server
npm start

# Run comprehensive tests
npm test

# Run Playwright UI tests
# (Will be implemented with MCP tools activation)

# Build for production
npm run build
```

**Key files to focus on**:
- `setup-enhanced-database.js` (create)
- `src/components/songs/EnhancedSongDetail.tsx` (✅ done)
- `src/services/enhancedGemini.ts` (✅ done) 
- `src/services/firestore.ts` (✅ done)
- Test files (create comprehensive suite)

**Success metrics**:
- Users can search for any tango song and get rich, enhanced information
- Page loads in <3 seconds, cached responses in <1 second  
- AI success rate >85% with graceful fallbacks
- Responsive design works perfectly on all devices
- Zero critical bugs in enhanced song information flow