# 🎵 TangoTales - Phase 1: Core Functionality Implementation Plan

## 📋 Phase 1 Overview

**Goal**: Build the foundational architecture and core search functionality for TangoTales

**Status**: ✅ **COMPLETE** - All core functionality implemented with desktop-first UI

**Key Deliverables**:
- [x] Set up React project with TypeScript
- [x] Implement Firebase Firestore integration
- [x] Create basic search functionality with debouncing
- [x] Build song explanation display component
- [x] Desktop-first 3-column grid layout
- [x] 100% Tailwind CSS implementation
- [ ] Integrate Gemini AI API for new song research (PLANNED)

---

## 🚀 Step-by-Step Implementation Plan

### **Step 1: Project Setup & Environment Configuration**

#### 1.1 Initialize React Project with TypeScript
- [ ] Create new React app with TypeScript template
  ```bash
  npx create-react-app tangotales --template typescript
  cd tangotales
  ```
- [ ] Install required dependencies:
  ```bash
  npm install firebase
  npm install @google/generative-ai
  npm install tailwindcss postcss autoprefixer
  npm install react-router-dom @types/react-router-dom
  ```
- [ ] Initialize Tailwind CSS configuration
  ```bash
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.js` for content paths
- [ ] Update `src/index.css` with Tailwind directives

#### 1.2 Project Structure Setup
- [ ] Create folder structure:
  ```
  src/
  ├── components/
  │   ├── common/
  │   ├── search/
  │   ├── songs/
  │   └── layout/
  ├── hooks/
  ├── services/
  ├── utils/
  ├── contexts/
  ├── types/
  └── styles/
  ```
- [ ] Create TypeScript type definitions in `src/types/`
- [ ] Set up basic routing structure with React Router

#### 1.3 Environment Variables Setup
- [ ] Configure system environment variables:
  - Set `GEMINI_API_KEY` in system environment
  - Set Firebase config variables in system environment
- [ ] Access environment variables in React using `process.env.REACT_APP_*`
- [ ] Create build-time environment variable mapping
- [ ] Document required environment variables in README

---

### **Step 2: Firebase Firestore Integration** ✅ COMPLETE

#### 2.1 Firebase Project Setup (Using Firebase CLI) ✅
- [x] Install Firebase CLI: `npm install -g firebase-tools`
- [x] Login to Firebase: `firebase login`
- [x] Initialize Firebase project: `firebase init`
  - Selected Firestore Database (FREE tier)
  - Selected Hosting (FREE tier)
  - Configured for single-page application
- [x] Configure `firebase.json` for hosting settings
- [x] Set up Firestore security rules in `firestore.rules` for public read/write
- [x] Deploy rules: `firebase deploy --only firestore:rules`

#### 2.2 Firebase Service Implementation (FREE Tier Only) ✅
- [x] Create `src/services/firebase.ts`:
  - Initialize Firebase app with environment variables
  - Export Firestore database instance
  - Use Firebase v9+ modular SDK
  
- [x] Create `src/services/firestore.ts` (Client SDK operations only):
  - `searchSongsByTitle(query: string)` - Search songs by title with Firestore queries
  - `getPopularSongs(limit: number)` - Get most-searched songs ordered by searchCount
  - `getSongsByLetter(letter: string)` - Filter songs by first letter
  - `getSongById(songId: string)` - Retrieve single song document
  - All functions use client-side Firestore operations (no Admin SDK)

#### 2.3 TypeScript Interfaces ✅
- [x] Create `src/types/song.ts`:
  ```typescript
  interface Song {
    id: string;
    title: string;
    explanation: string;
    sources: string[];
    createdAt: Timestamp;
    searchCount: number;
    averageRating: number;
    totalRatings: number;
    tags: string[];
  }
  
  interface Rating {
    id?: string;
    songId: string;
    rating: number;
    comment?: string;
    timestamp: Timestamp;
  }
  ```

---

### **Step 3: Basic Search Functionality** ✅ COMPLETE

#### 3.1 Search Context Setup ✅
- [x] Create `src/contexts/SearchContext.tsx`:
  - Search query state
  - Search results state (Song[])
  - Loading states (boolean)
  - Error handling state (string | null)
  - hasSearched flag for UI states
  - clearSearch() function for resetting state

#### 3.2 Search Hook Implementation ✅
- [x] Create `src/hooks/useSearch.ts`:
  - `performSearch(query: string)` function with debouncing (300ms)
  - `loadPopularSongs()` function to fetch top songs
  - `loadSongsByLetter(letter: string)` function for A-Z navigation
  - Search result caching using useRef Map
  - Error handling and retry logic
  - Integration with SearchContext for centralized state

#### 3.3 Search Components ✅
- [x] Create `src/components/search/SearchBar.tsx`:
  - Input field with Tailwind styling (`bg-white/10 rounded-lg shadow-md`)
  - Search icon (🎵) and search button (🔍)
  - Loading spinner integration during search
  - Keyboard navigation (Enter to search)
  - Focus states with ring effects (`ring-2 ring-yellow-400/50`)
  - Debounced onChange handler (300ms delay)
  - Clear button functionality
  
- [x] Create `src/components/search/SearchResults.tsx`:
  - Display list of found songs using SongCard components
  - "No results" state with helpful message
  - Loading state with LoadingSpinner component
  - Error message display with ErrorMessage component
  - "Show Popular Songs" button for discovering content
  - White card containers (`bg-white rounded-lg shadow-md`)

#### 3.4 Search Logic Implementation ✅
- [x] Implement search algorithm:
  - Check Firestore first for existing songs using `searchSongsByTitle()`
  - Client-side caching to avoid redundant Firestore queries
  - Search by title with Firestore range queries
  - Return results ordered by searchCount (descending)
  - Handle empty queries gracefully
  - Error boundaries for API failures

#### 3.5 Additional Discovery Features ✅
- [x] Create `src/components/navigation/AlphabetNav.tsx`:
  - A-Z button grid for filtering songs by first letter
  - Gray backgrounds with red hover states
  - Responsive flex-wrap layout
  - Integration with `getSongsByLetter()` service
  
- [x] Popular Songs Sidebar:
  - Toggle button to load popular songs
  - Display in right sidebar (3-column grid layout)
  - "Show Popular Songs" button with click handler
  - Integration with `getPopularSongs()` service

---

### **Step 4: Song Explanation Display Component** ✅ PARTIALLY COMPLETE

#### 4.1 Song Display Components ✅
- [x] Create `src/components/songs/SongCard.tsx`:
  - Song title display with truncation
  - Clean white card background (`bg-white/10 rounded-lg border`)
  - Search count indicator (🔍 icon + count)
  - Rating display with star emojis (⭐)
  - Rank badge for popular songs (#1, #2, etc.)
  - Musical note icon (🎵)
  - Hover effects (`hover:bg-white/20 hover:shadow-lg hover:-translate-y-1`)
  - Click handler for song selection

- [ ] Create `src/components/songs/SongDetail.tsx`:
  - Full song information layout (NOT YET IMPLEMENTED)
  - Formatted explanation text
  - Metadata section (created date, search count)
  - Sources as clickable links
  - Rating section placeholder

#### 4.2 Content Formatting ⚠️ BASIC IMPLEMENTATION
- [ ] Create `src/utils/textFormatter.ts`:
  - Basic text display (no special formatting yet)
  - Truncation handled in components
  - Date formatting (NOT YET IMPLEMENTED)

#### 4.3 Loading and Error States ✅
- [x] Create `src/components/common/LoadingSpinner.tsx`:
  - Spinner animation with size variants (sm, md, lg)
  - Optional loading message
  - Tailwind-only styling (no custom CSS)
  
- [x] Create `src/components/common/ErrorMessage.tsx`:
  - Error display with red styling
  - Icon support
  - Clean white card presentation
  
- [x] Create `src/components/common/ErrorBoundary.tsx`:
  - React Error Boundary for catching component errors
  - Fallback UI with tango emoji (🎭)
  - "Try Again" button to reload page
  - Tailwind styling (`bg-white rounded-lg shadow-md`)

---

### **Step 5: Gemini AI API Integration**

#### 5.1 Gemini Service Setup
- [ ] Create `src/services/gemini.ts`:
  - Initialize Gemini AI client
  - Create prompt template for tango song research
  - Implement `generateSongExplanation(songTitle: string)` function
  - Add error handling and retry logic

#### 5.2 AI Integration Logic
- [ ] Create `src/hooks/useAISearch.ts`:
  - Check if song exists in database first
  - If not found, trigger Gemini AI search
  - Format AI response into Song interface
  - Extract sources from AI response
  - Save new song to Firestore
  - Handle rate limiting and API errors

#### 5.3 Prompt Engineering (Structured Output)
- [ ] Design structured prompt for Gemini that matches database schema:
  ```
  "Research and explain the tango song '{songTitle}'. Respond in this EXACT JSON format:
  {
    \"explanation\": \"Detailed explanation covering: historical background, lyrical meaning and themes, cultural significance in tango, interesting stories about creation or performances. Write 2-3 paragraphs suitable for tango enthusiasts.\",
    \"sources\": [\"URL1\", \"URL2\", \"URL3\"],
    \"tags\": [\"tag1\", \"tag2\", \"tag3\"]
  }
  
  Requirements:
  - explanation: 300-800 words, engaging and informative
  - sources: Include 2-5 relevant URLs if available
  - tags: 3-6 relevant tags (era, style, composer, themes, etc.)
  - Use only factual, verifiable information
  - If song not found, return explanation: 'Song information not found' with empty arrays"
  ```

#### 5.4 Response Processing (Structured JSON)
- [ ] Create `src/utils/aiResponseParser.ts`:
  - Parse JSON response from Gemini into Song interface
  - Validate required fields (explanation, sources, tags)
  - Sanitize and clean explanation text
  - Validate source URLs format
  - Handle malformed JSON with fallback parsing
  - Generate default values for missing fields:
    ```typescript
    interface GeminiResponse {
      explanation: string;
      sources: string[];
      tags: string[];
    }
    
    const parseAIResponse = (response: string): GeminiResponse => {
      // Parse JSON and validate structure
      // Fallback to regex extraction if JSON parsing fails
      // Return structured data matching database schema
    }
    ```

---

### **Step 6: Basic Layout and Navigation** ✅ COMPLETE

#### 6.1 Main Layout Components ✅
- [x] Create `src/pages/HomePage.tsx`:
  - Desktop-first 3-column grid layout (`lg:grid-cols-12`)
  - Left sidebar: Browse by Letter (2 columns)
  - Center content: Search + Results (7 columns)
  - Right sidebar: Popular Songs (3 columns)
  - Feature cards section (3-column grid on desktop)
  - White header with shadow (`bg-white shadow-md`)
  - Gradient background (`bg-gradient-to-br from-tango-red`)
  - Footer with copyright

- [x] Header section (inline in HomePage):
  - 🎵 TangoTales logo
  - Tagline: "Discover the stories behind classic tango songs"
  - Clean white background with shadow
  - Responsive padding

- [x] Footer section (inline in HomePage):
  - Copyright notice
  - Simple centered text
  - Gradient background continuation

#### 6.2 Basic Routing Setup ✅
- [x] Create `src/pages/HomePage.tsx`:
  - Main landing page with 3-column layout
  - Search functionality integration
  - AlphabetNav and Popular Songs sections

- [x] Create `src/pages/SearchPage.tsx`:
  - Dedicated search results page
  - Full-width search results display

- [x] Create `src/pages/NotFoundPage.tsx`:
  - 404 error page
  - Clean error message

- [x] Set up React Router in `src/App.tsx`:
  - Route definitions for /, /search, /404
  - SearchProvider wrapper for state management
  - ErrorBoundary wrapper for error handling
  - Navigation between pages

#### 6.3 Navigation Components ✅
- [x] Create `src/components/navigation/AlphabetNav.tsx`:
  - A-Z button grid for letter filtering
  - Gray buttons (`bg-gray-100`) with red hover (`hover:bg-tango-red`)
  - Responsive flex-wrap layout
  - White card container

- [x] Create `src/components/navigation/MobileNav.tsx`:
  - Mobile menu toggle button
  - Hamburger icon animation
  - Slide-out menu overlay
  - Popular songs in mobile view
  - Navigation links (About, Contact, GitHub)

---

### **Step 7: Basic Styling and Theming** ✅ COMPLETE

#### 7.1 Design System Setup ✅
- [x] Configure `tailwind.config.js`:
  - Define tango color palette:
    - `tango-red`: #C41E3A (primary)
    - `tango-gold`: #FFD700 (accent)
    - `tango-dark-red`: #A11729 (darker variant)
    - `tango-light-red`: #E85D75 (lighter variant)
  - Content paths for purging unused styles
  - No custom plugins needed

- [x] Create `src/styles/theme.ts`:
  - Color constants exported for programmatic use
  - Consistent color references across components

#### 7.2 Component Styling ✅
- [x] Style all components with 100% Tailwind CSS:
  - **No custom CSS files** (removed HomePage.css, cleaned App.css)
  - **White cards**: `bg-white rounded-lg shadow-md border border-gray-200`
  - **Gradient background**: `bg-gradient-to-br from-tango-red via-red-800 to-red-900`
  - **Responsive spacing**: `p-4 md:p-6 lg:p-8` patterns
  - **Typography**: `font-semibold`, `text-lg`, `text-gray-700` for hierarchy
  - **Hover states**: `hover:bg-white/20`, `hover:-translate-y-1`, `hover:shadow-lg`
  - **Loading states**: Spinner animations with Tailwind utilities
  - **Focus states**: `focus:ring-2 focus:ring-tango-red` for accessibility

#### 7.3 Responsive Design Implementation ✅
- [x] Desktop-first responsive design (changed from mobile-first):
  - **Desktop (lg: 1024px+)**: 3-column grid (`lg:grid-cols-12`)
  - **Tablet (md: 768px+)**: 2-column layouts
  - **Mobile (default)**: Stacked single-column layout
  - **Grid system**: 12-column grid with custom spans (2-7-3 split)
  - **Breakpoint usage**: `lg:block hidden` for sidebar visibility
  - **Flexible layouts**: `flex-wrap` for button grids

#### 7.4 Performance Optimizations ✅
- [x] Tailwind CSS v3.4.17 (downgraded from v4 for stability)
- [x] PostCSS configuration with autoprefixer
- [x] React Scripts build tooling (removed CRACO)
- [x] No backdrop-filter (removed for performance)
- [x] No custom CSS files (zero technical debt)
- [x] Purge unused styles in production build

---

### **Step 8: Testing and Error Handling**

#### 8.1 Error Boundaries
- [ ] Create `src/components/common/ErrorBoundary.tsx`:
  - Catch JavaScript errors in component tree
  - Display fallback UI
  - Log errors for debugging

#### 8.2 API Error Handling
- [ ] Implement comprehensive error handling:
  - Network connectivity issues
  - Firebase quota exceeded
  - Gemini API rate limits
  - Invalid song search queries
  - Database write failures

#### 8.3 Basic Testing Setup
- [ ] Set up Jest and React Testing Library
- [ ] Create basic tests for:
  - Search functionality
  - Song display components
  - Firebase service functions
  - Gemini AI integration

---

### **Step 9: Performance Optimization**

#### 9.1 Loading Optimization
- [ ] Implement loading states for all async operations
- [ ] Add skeleton screens for better perceived performance
- [ ] Optimize Firebase queries with proper indexing

#### 9.2 Caching Strategy
- [ ] Implement basic client-side caching:
  - Cache search results in memory
  - Cache song details to avoid redundant API calls
  - Use browser localStorage for recent searches

---

### **Step 10: Phase 1 Testing and Validation**

#### 10.1 Functional Testing
- [ ] Test core user flow:
  1. User searches for existing song → displays from database
  2. User searches for new song → triggers AI research → saves to database
  3. Song details display correctly with all metadata
  4. Error states work properly

#### 10.2 Performance Testing
- [ ] Test with slow network connections
- [ ] Verify Firebase read/write operations
- [ ] Test Gemini AI response times
- [ ] Validate mobile responsiveness

#### 10.3 Bug Fixes and Polish
- [ ] Fix any discovered issues
- [ ] Improve user experience based on testing
- [ ] Optimize performance bottlenecks
- [ ] Prepare for Phase 2 development

---

## 🔥 Firebase Free Tier Compliance Checklist

**CRITICAL: Ensure all implementations use ONLY free tier features**

- [ ] **Firestore Database**: Use Web SDK v9 client-side only
- [ ] **Firebase Hosting**: Static file hosting for React build
- [ ] **No Cloud Functions**: All logic runs in browser
- [ ] **No Firebase Extensions**: No paid integrations
- [ ] **No Admin SDK**: Client SDK operations only
- [ ] **Security Rules**: Simple rules suitable for public app
- [ ] **Quotas**: Stay within free tier limits:
  - Firestore: 50K reads/day, 20K writes/day
  - Hosting: 10GB storage, 360MB/day transfer
  - No server-side code that could trigger billing

### Environment Variables Setup (System Level)
- [ ] Set system environment variables:
  ```bash
  # Windows (PowerShell)
  $env:REACT_APP_GEMINI_API_KEY="your_gemini_api_key"
  $env:REACT_APP_FIREBASE_API_KEY="your_firebase_api_key"
  $env:REACT_APP_FIREBASE_PROJECT_ID="your_project_id"
  
  # Access in React code
  const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
  ```

---

## ✅ Phase 1 Completion Criteria

**Before moving to Phase 2, ensure:**
- [ ] Users can successfully search for tango songs
- [ ] New songs trigger AI research and get saved to database
- [ ] Existing songs are retrieved from database quickly
- [ ] All components render properly on mobile and desktop
- [ ] Error handling works for common failure scenarios
- [ ] Basic responsive design is implemented
- [ ] Firebase integration is stable and secure
- [ ] Gemini AI integration produces quality explanations

---

## 🔧 Development Environment Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase project created and configured
- [ ] Gemini AI API key obtained
- [ ] Git repository initialized
- [ ] IDE/Editor configured for React + TypeScript
- [ ] Browser dev tools ready for debugging

---

## 📚 Resources and References

### Documentation
- [React TypeScript Documentation](https://react.dev/learn/typescript)
- [Firebase Web SDK Guide](https://firebase.google.com/docs/web/setup)
- [Gemini AI API Documentation](https://ai.google.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Code Quality
- ESLint configuration for React + TypeScript
- Prettier for code formatting
- Git hooks for pre-commit validation
- Component documentation with JSDoc

This detailed implementation plan provides a clear roadmap for building the core functionality of TangoTales while maintaining code quality and following best practices.
