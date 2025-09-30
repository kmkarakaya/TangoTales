# 🎵 TangoTales - Phase 1: Core Functionality Implementation Plan

## 📋 Phase 1 Overview (Week 1-2)

**Goal**: Build the foundational architecture and core search functionality for TangoTales

**Key Deliverables**:
- [ ] Set up React project with TypeScript
- [ ] Implement Firebase Firestore integration
- [ ] Create basic search functionality
- [ ] Build song explanation display component
- [ ] Integrate Gemini AI API for new song research

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

### **Step 2: Firebase Firestore Integration**

#### 2.1 Firebase Project Setup (Using Firebase CLI)
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Initialize Firebase project: `firebase init`
  - Select Firestore Database (FREE tier)
  - Select Hosting (FREE tier)
  - Configure for single-page application
- [ ] Configure `firebase.json` for hosting settings
- [ ] Set up Firestore security rules in `firestore.rules` for public read/write:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Songs collection - public read, controlled write
      match /songs/{songId} {
        allow read: if true;
        allow write: if true; // FREE tier - simplified rules
      }
      // Ratings collection - public read/write
      match /ratings/{ratingId} {
        allow read, write: if true;
      }
    }
  }
  ```
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

#### 2.2 Firebase Service Implementation (FREE Tier Only)
- [ ] Create `src/services/firebase.ts`:
  ```typescript
  import { initializeApp } from 'firebase/app';
  import { getFirestore } from 'firebase/firestore';
  
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
  
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  ```
- [ ] Create `src/services/firestore.ts` (Client SDK operations only):
  ```typescript
  import { 
    doc, getDoc, setDoc, updateDoc, increment,
    collection, query, where, orderBy, limit, getDocs, addDoc 
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // FREE tier compliant functions:
  export const getSongById = async (songId: string) => {
    const songDoc = await getDoc(doc(db, 'songs', songId));
    return songDoc.exists() ? songDoc.data() : null;
  };
  
  export const searchSongsByTitle = async (searchQuery: string) => {
    const q = query(
      collection(db, 'songs'),
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff'),
      orderBy('searchCount', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  ```

#### 2.3 TypeScript Interfaces
- [ ] Create `src/types/song.ts`:
  ```typescript
  interface Song {
    id: string;
    title: string;
    explanation: string;
    sources: string[];
    createdAt: Date;
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
    timestamp: Date;
  }
  ```

---

### **Step 3: Basic Search Functionality**

#### 3.1 Search Context Setup
- [ ] Create `src/contexts/SearchContext.tsx`:
  - Search query state
  - Search results state
  - Loading states
  - Error handling state
  - Search history (browser-based)

#### 3.2 Search Hook Implementation
- [ ] Create `src/hooks/useSearch.ts`:
  - `searchSongs(query: string)` function
  - Debounced search functionality
  - Search result caching
  - Error handling and retry logic

#### 3.3 Search Components
- [ ] Create `src/components/search/SearchBar.tsx`:
  - Input field with proper styling
  - Search icon and clear button
  - Loading spinner integration
  - Keyboard navigation (Enter to search)
  
- [ ] Create `src/components/search/SearchResults.tsx`:
  - Display list of found songs
  - "No results" state
  - Loading skeleton components
  - Click handlers for song selection

#### 3.4 Search Logic Implementation
- [ ] Implement search algorithm:
  - Check Firestore first for existing songs
  - Fuzzy search functionality for partial matches
  - Search by title (case-insensitive)
  - Return results ordered by search count and relevance

---

### **Step 4: Song Explanation Display Component**

#### 4.1 Song Display Components
- [ ] Create `src/components/songs/SongCard.tsx`:
  - Song title display
  - Explanation content area
  - Search count indicator
  - Rating display (stars)
  - Sources list display
  - Tags display

- [ ] Create `src/components/songs/SongDetail.tsx`:
  - Full song information layout
  - Formatted explanation text
  - Metadata section (created date, search count)
  - Sources as clickable links
  - Rating section placeholder

#### 4.2 Content Formatting
- [ ] Create `src/utils/textFormatter.ts`:
  - Format explanation text with proper paragraphs
  - Sanitize HTML content
  - Truncate long explanations with "Read more"
  - Format timestamps and dates

#### 4.3 Loading and Error States
- [ ] Create `src/components/common/LoadingSpinner.tsx`
- [ ] Create `src/components/common/ErrorMessage.tsx`
- [ ] Create `src/components/common/EmptyState.tsx`

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

### **Step 6: Basic Layout and Navigation**

#### 6.1 Main Layout Components
- [ ] Create `src/components/layout/Header.tsx`:
  - TangoTales logo
  - Search bar integration
  - Simple navigation menu

- [ ] Create `src/components/layout/Footer.tsx`:
  - About link
  - GitHub repository link
  - Copyright information

- [ ] Create `src/components/layout/MainLayout.tsx`:
  - Header and footer wrapper
  - Main content area
  - Responsive grid system

#### 6.2 Basic Routing Setup
- [ ] Create `src/pages/HomePage.tsx`:
  - Welcome message
  - Featured search bar
  - Basic instructions

- [ ] Create `src/pages/SearchPage.tsx`:
  - Search results display
  - Song detail view integration

- [ ] Set up React Router in `src/App.tsx`:
  - Route definitions
  - 404 page handling
  - Navigation between pages

---

### **Step 7: Basic Styling and Theming**

#### 7.1 Design System Setup
- [ ] Create `src/styles/theme.ts`:
  - Define color palette (tango red #C41E3A, gold #FFD700)
  - Typography scale
  - Spacing system
  - Component variants

#### 7.2 Component Styling
- [ ] Style all created components with Tailwind CSS:
  - Responsive design principles
  - Consistent spacing and typography
  - Hover states and transitions
  - Loading state animations

#### 7.3 Basic Responsiveness
- [ ] Implement mobile-first responsive design:
  - Mobile layout (320px+)
  - Tablet layout (768px+)
  - Desktop layout (1024px+)

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
