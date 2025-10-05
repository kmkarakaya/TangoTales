# 🎵 TangoTales

> Discover the stories behind classic tango songs

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase)](https://tangotales-app.web.app)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/kmkarakaya/TangoTales/actions)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 🔄 CI/CD Pipeline

TangoTales uses **GitHub Actions** for automated deployment with Firebase Hosting. See [`GITHUB_ACTIONS_COMPLETE.md`](tangotales/GITHUB_ACTIONS_COMPLETE.md) for the full CI/CD guide and workflow details.

### 🚀 Automatic Deployments
- **Production**: Push to `main` branch → Auto-deploy to [https://tangotales-app.web.app](https://tangotales-app.web.app)
- **Preview**: Pull Requests → Generate preview URLs for testing
- **Build Process**: `npm ci && npm run build` in CI environment
- **Status**: [![GitHub Actions](https://github.com/kmkarakaya/TangoTales/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/kmkarakaya/TangoTales/actions)

### 📁 Workflow Files
- `.github/workflows/firebase-hosting-merge.yml` - Production deployments
- `.github/workflows/firebase-hosting-pull-request.yml` - PR preview deployments

### 🔐 Security
- Firebase service account authentication
- GitHub secrets management for secure deployments
- Automatic cleanup of preview deployments

📖 **Complete CI/CD guide**: See [`GITHUB_ACTIONS_COMPLETE.md`](tangotales/GITHUB_ACTIONS_COMPLETE.md)

## 🚀 Local Development

A modern, responsive web application that helps users discover and explore the meanings, stories, and cultural context behind classic tango songs. TangoTales provides an intuitive interface for searching tango songs and accessing detailed explanations while building a community-driven knowledge base of musical stories.

## 🚀 Quick Start

**🎉 LIVE APP**: [https://tangotales-app.web.app](https://tangotales-app.web.app)

**Development Status**: ✅ **Rating System Enhanced!** Successfully completed comprehensive rating system PR with numeric averages (4.2/5.0), half-star precision (★⯨☆), loading states, error handling, and 14/14 test coverage. Advanced user feedback system with optimistic updates and backward compatibility complete. Tango validation system, user-controlled AI generation, Firebase integration, and automated deployment pipeline all operational.

> 📋 **Project Status**: All development progress is tracked in [`.github/prompts/status.md`](.github/prompts/status.md) with detailed work package summaries, technical achievements, and chronological development history.

```bash
# Clone and navigate to the React app
git clone https://github.com/kmkarakaya/TangoTales.git
cd TangoTales/tangotales

# Install dependencies
npm install

# Set up Firebase configuration
cp .env.example .env.local
# Edit .env.local with your Firebase project details (see FIREBASE_SETUP.md)

# Start development server
npm start
# ✅ App will be available at http://localhost:3001
```

### 🧪 **Testing Search Functionality**

The search system is now fully operational! To test:

1. **Visit**: http://localhost:3001
2. **Add Sample Data**: Open browser console and run:
   ```javascript
   window.populateSampleData()
   ```
3. **Search Available Songs**:
   - "La Cumparsita" (1916) - Most famous tango
   - "Por Una Cabeza" (1935) - Carlos Gardel classic
   - "El Choclo" (1903) - Early foundational tango
   - "Adiós Nonino" (1959) - Piazzolla tribute
   - "Libertango" (1974) - Revolutionary nuevo tango
4. **Test Features**:
   - Type to search with instant debounced results
   - Clear search with X button
   - Try "Show Popular Songs" button
   - Browse songs by A-Z letter navigation
   - Test responsive 3-column grid layout

> **🎵 LIVE**: Desktop-first landing page with clean 3-column layout (Browse by Letter | Search & Results | Popular Songs). Professional white cards on gradient background. 100% Tailwind CSS - zero custom CSS files. Next: Firebase data population and AI integration.

## 🎨 **Clean Modern Design**

TangoTales features a professional desktop-first interface with emphasis on clarity and usability:

- **� 3-Column Grid Layout**: Efficient desktop layout with Browse by Letter (left), Search & Results (center), Popular Songs (right)
- **🎨 Clean White Cards**: High-contrast white cards on beautiful tango gradient background
- **✨ Pure Tailwind CSS**: 100% utility-first styling - no custom CSS files or classes
- **📝 High Readability**: Black text on white cards ensures perfect readability
- **🎭 Professional Design**: Simple shadows, rounded corners, clean hover effects
- **📱 Responsive**: Mobile-optimized stacked layout with full desktop experience on larger screens
- **⚡ Performance**: No backdrop-filter or heavy effects - fast and smooth

**Design Philosophy**: Clean, professional, readable. White cards provide excellent contrast against the gradient background. Every element uses standard Tailwind utilities for easy maintenance and consistency.

![TangoTales Demo](docs/images/demo.png)

## ✨ Features

### 🔍 **Intelligent Song Search** ✅

- **Interactive Search Bar**: Real-time search with 300ms debouncing for optimal performance
- **Database-First Strategy**: Instant results from Firestore with client-side caching
- **Smart Matching**: Case-insensitive partial matching for song titles
- **Loading States**: Beautiful loading animations and error handling
- **Keyboard Navigation**: Full Enter key support and clear button functionality
- **Result Caching**: Avoid redundant database calls for better performance
- **Popular Songs**: Discover trending songs with one-click access
- **User-Controlled AI Research**: "Search with AI" button for non-existent songs - users choose when to generate content
 - **Enhanced Search UI & Service**: An `EnhancedSearchPage` and `EnhancedSearchService` provide advanced filtering, popular-term suggestions, and search-quality scoring. The `useEnhancedSearch` hook exposes debounced searches, suggestions, and popular-term retrieval for components.
 - **AI progress UI**: The search results and research flows use an `AIResearchProgress` component to display multi-step progress while an AI research job runs (uses `enhancedGeminiWithProgress` service to stream progress updates).

### 🤖 **AI-Powered Research** ✅ **USER-CONTROLLED**

- **User-Controlled Generation**: "Search with AI" button appears for non-existent songs - NO automatic AI calls
- **Gemini AI Integration**: Research unknown tango songs using Google's Gemini 2.0 Flash model
- **Comprehensive Analysis**: Get detailed information about song meaning, history, and cultural context
- **Explicit User Choice**: Users decide when to consume AI resources - cost-efficient approach
- **Auto-Save to Database**: Researched songs are automatically saved for future searches
- **Instant Results**: See AI-researched songs appear immediately at the top of search results
- **Rich Content**: Includes title translation, historical context, composer info, and source references
- **Smart Ordering**: Newly researched songs appear first, maintaining search context
- **Error Handling**: Graceful fallbacks with retry options for failed research attempts
- **Secure Configuration**: Environment variables for API keys with GitHub Secrets integration
- **Cost Optimization**: AI generation only triggered by explicit user action - no surprise API costs
 - **Progress & Streaming**: AI research uses an enhanced Gemini integration (`enhancedGeminiWithProgress`) that streams progress updates and supports robust JSON repair and fallback generation. The UI surfaces these progress updates via `AIResearchProgress`.

### 🎭 **Song Discovery** ✅

- **Search Results Display**: Beautiful song cards with metadata, ratings, and tags
- **Popular Songs**: One-click access to most-searched tango classics
- **Letter Filtering**: Browse songs alphabetically (A-Z navigation)
- **Song Metadata**: Display search counts, ratings, creation dates, and sources
- **Tag System**: Categorical organization with era, composer, and style tags
- **Responsive Cards**: Mobile-optimized song information display
- **Sample Database**: Pre-loaded with 5 classic tangos for immediate testing

### ⭐ **Community Feedback** ✅ ENHANCED

- **Advanced 5-Star Rating System** with precision features:
  - **Numeric Display**: Show exact averages (4.2/5.0) alongside stars
  - **Half-Star Support**: Precise decimal visualization (★★★★⯨ for 4.3)
  - **Loading States**: Visual feedback during submission (⏳ indicator)
  - **Error Handling**: Inline error messages for failed submissions
  - **Rating Persistence**: Optimistic updates with proper state management
  - **14/14 Test Coverage**: Comprehensive test suite ensuring reliability
- **User Experience**: Anonymous feedback collection (no login required)
- **Visual Feedback**: Immediate response with smooth animations and transitions
- **Backward Compatible**: All enhancements work seamlessly with existing implementations

### 🎨 **Modern User Experience**

- **Responsive Design**: Mobile-first approach with elegant desktop scaling
- **Loading States**: Smooth animations during API calls
- **Error Handling**: Graceful fallbacks for network issues
- **Accessibility**: Screen reader support and keyboard navigation
- **Dark/Light Theme**: Toggle between tango-inspired themes

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Firebase Firestore (Client SDK only)
- **AI Integration**: Google Gemini 2.0 Flash API (@google/genai v1.21.0)
- **Hosting**: Firebase Hosting with GitHub Actions CI/CD
- **Routing**: React Router v6
- **State Management**: React Context API
- **Testing**: Playwright MCP for end-to-end validation
- **Database Protection**: Multi-layer tango validation system

### 🎨 **Advanced Component System**

TangoTales features a sophisticated component architecture for rich user experiences:

- **📱 EnhancedSongDetail** (319 lines): Comprehensive song display with musical analysis, cultural context, notable recordings, and dance recommendations
- **⭐ StarRating System**: Advanced 5-star rating component with numeric average display (4.2/5.0), half-star precision (★⯨☆), loading states (⏳), comprehensive error handling, and optimistic updates
- **📱 MobileNav**: Responsive navigation with hamburger menu animations and popular songs quick access
- **🎯 useIntersectionObserver**: Performance optimization hook for lazy loading and scroll-based animations
- **🤖 Multi-Turn AI Engine**: 600+ line sophisticated conversation system with 5-turn information gathering
- **🔧 JSON Repair Algorithms**: Advanced parsing and repair for malformed AI responses with fallback generation
- **📊 Quality Assessment**: AI response evaluation system with excellent/good/partial/failed classification
- **🎵 Rich Sample Data**: 169-line comprehensive tango song database with full metadata structure
 - **⏱ AIResearchProgress**: Reusable component for rendering multi-step AI research progress in both inline and modal contexts
 - **🔎 EnhancedSearchService & Hook**: Backend service and `useEnhancedSearch` hook powering advanced filtering, suggestions, and popular-term metrics
 - **📈 AnalyticsDashboardPage**: Admin-facing analytics page that surfaces popular searches, usage metrics, and performance summaries

### 🛡️ **Database Integrity Protection**

TangoTales features a **comprehensive tango validation system** preventing fake songs from polluting the database:

- **🤖 Turn 0 AI Validation**: Gemini 2.5-Flash validates if search terms are legitimate Argentine tango songs
- **📊 Database Protection**: Firestore operations refuse to create entries for non-tango searches  
- **👤 User Education**: Clear error messages guide users to search for actual tango compositions (1880-present)
- **🚫 Strict Criteria**: Rejects random words, other music genres, and non-Spanish terms unless famous tangos
- **✅ Verified Protection**: Extensive testing confirms no fake entries created for terms like "jazz music", "yellow flower", etc.

**Example Validation Flow**:
```
User searches "jazz music" → Turn 0 detects not a tango → Database creation blocked → User sees educational message
```

## � Firebase Integration

TangoTales uses Firebase Firestore for data storage and Firebase Hosting for deployment, **exclusively on the FREE tier**.

### Database Schema

```typescript
// Songs Collection
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

// Ratings Collection  
interface Rating {
  id: string;
  songId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}
```

### Available Operations

- **Songs**: Create, read, search by title/letter, get popular/random selections
- **Ratings**: Add ratings, calculate averages, retrieve by song
- **Analytics**: Track search counts, maintain song statistics

📖 **Complete Firebase setup guide**: See [`FIREBASE_SETUP.md`](tangotales/FIREBASE_SETUP.md)

## �🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI
- System environment variables configured

### Environment Variables

Set the following system environment variables:

**Windows (PowerShell):**

```powershell
$env:REACT_APP_GEMINI_API_KEY="your_gemini_api_key"
$env:REACT_APP_FIREBASE_API_KEY="your_firebase_api_key"
$env:REACT_APP_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
$env:REACT_APP_FIREBASE_PROJECT_ID="your_project_id"
$env:REACT_APP_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
$env:REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
$env:REACT_APP_FIREBASE_APP_ID="your_app_id"
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tangotales.git
   cd tangotales
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up Firebase**

   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase project
   firebase init
   # Select: Firestore Database, Hosting
   # Configure as single-page application: Yes
   ```
4. **Configure Firestore Rules**

   Update `firestore.rules`:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /songs/{songId} {
         allow read: if true;
         allow write: if true;
       }
       match /ratings/{ratingId} {
         allow read, write: if true;
       }
     }
   }
   ```
5. **Deploy Firestore rules**

   ```bash
   firebase deploy --only firestore:rules
   ```
6. **Start development server**

   ```bash
   npm start
   ```

Visit `http://localhost:3000` to see the app in action!

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── StarRating.tsx        # Enhanced rating system (61 lines)
│   │   └── StarRating.test.tsx   # Comprehensive test suite (14 tests)
│   ├── search/          # Search-related components
│   │   ├── SearchBar.tsx
│   │   └── SearchResults.tsx
│   ├── songs/           # Song display components
│   │   ├── SongCard.tsx
│   │   └── SongDetail.tsx
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   └── navigation/      # Navigation components
├── hooks/               # Custom React hooks
│   ├── useSearch.ts
│   └── useAISearch.ts
├── services/            # API and Firebase services
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── enhancedSearch.ts
│   ├── enhancedGemini.ts
│   ├── enhancedGeminiWithProgress.ts
│   ├── responseParser.ts
│   ├── performance.ts
│   └── analytics.ts
├── utils/               # Utility functions
│   ├── textFormatter.ts
│   └── aiResponseParser.ts
├── contexts/            # React Context providers
│   └── SearchContext.tsx
├── types/               # TypeScript type definitions
│   └── song.ts
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── SearchPage.tsx
│   ├── EnhancedSearchPage.tsx   # Advanced search UI with filters and suggestions
│   └── AnalyticsDashboardPage.tsx  # Admin/analytics dashboard for search & usage metrics
└── styles/              # Global CSS and theme
    └── theme.ts
```

## 🎨 Design System

### Color Palette

- **Primary**: Deep Tango Red (`#C41E3A`)
- **Accent**: Elegant Gold (`#FFD700`)
- **Dark Mode**: Charcoal backgrounds with warm accents
- **Typography**: Modern serif for headings, clean sans-serif for body

### Components

All components follow a consistent design system with:

- Responsive breakpoints (mobile-first)
- Smooth transitions and hover effects
- Accessibility best practices
- Consistent spacing and typography

## 📊 Database Schema

### Songs Collection

```typescript
interface Song {
  id: string;                    // Auto-generated document ID
  title: string;                 // Song title
  explanation: string;           // Detailed explanation (300-800 words)
  sources: string[];            // Array of reference URLs
  createdAt: Timestamp;         // Creation timestamp
  searchCount: number;          // How many times searched
  averageRating: number;        // Average user rating (0-5)
```

## Recent changes

- 2025-10-05: Updated unit test `tangotales/src/App.test.tsx` to assert the site title "TangoTales" instead of the default CRA sample text. See `status.md` for details.

## Developer notes (tests)

- When running tests for the React app in `tangotales`, you may encounter module resolution errors if dependencies are not installed or the environment differs from the one used to prepare the repo. A recent test run produced the following error:

  - "Cannot find module 'react-router-dom' from 'src/App.tsx'"

- The project lists `react-router-dom` in `tangotales/package.json`. Typical fixes:

  1. Ensure dependencies are installed for the React app:

     ```powershell
     cd "C:\Codes\Tango Songs\tangotales" ; npm ci
     ```

  2. If you prefer not to install additional runtime deps in your test environment, mock `react-router-dom` for Jest by adding a lightweight mock in `tangotales/src/setupTests.ts`, for example:

     ```ts
     // ...existing code in setupTests.ts
     // Mock react-router-dom to avoid importing the full router in unit tests
     jest.mock('react-router-dom', () => {
       const React = require('react');
       return {
         BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
         Routes: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
         Route: () => null,
         Link: ({ children }: any) => React.createElement('a', null, children),
       };
     });
     ```

  3. After installing deps or adding the mock, re-run the tests:

     ```powershell
     cd "C:\Codes\Tango Songs\tangotales" ; npm test -- --watchAll=false
     ```

- If you want, I can either install the missing dependency in the project or add the Jest mock and re-run tests. Tell me which you'd prefer.
  totalRatings: number;         // Total number of ratings
  tags: string[];               // Genre, era, themes, etc.
}
```

### Ratings Collection

```typescript
interface Rating {
  id: string;                   // Auto-generated document ID
  songId: string;               // Reference to song
  rating: number;               // Rating value (1-5)
  comment?: string;             // Optional user comment
  timestamp: Timestamp;         // Rating timestamp
}
```

## 🤖 AI Integration

TangoTales uses Google's Gemini AI API to research and generate explanations for songs not yet in the database.

### Structured Prompt

```javascript
const prompt = `Research and explain the tango song '${songTitle}'. Respond in this EXACT JSON format:
{
  "explanation": "Detailed explanation covering historical background, lyrical meaning, cultural significance, and interesting stories. 300-800 words for tango enthusiasts.",
  "sources": ["URL1", "URL2", "URL3"],
  "tags": ["tag1", "tag2", "tag3"]
}`;
```

### Response Processing

- Validates JSON structure
- Sanitizes explanation content
- Verifies source URL formats
- Generates fallback data for malformed responses

## 🔥 Firebase Free Tier Compliance

**✅ This project uses ONLY free Firebase services:**

- **Firestore Database**: Client SDK only, 50K reads/day, 20K writes/day
- **Firebase Hosting**: 10GB storage, 360MB/day transfer
- **No Cloud Functions**: All logic runs client-side
- **No Firebase Extensions**: No paid integrations
- **No Admin SDK**: Client-side operations only

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be available at `https://your-project-id.web.app`

## 🚀 Development Status

**Current Phase**: Advanced Component System & Documentation Audit Complete 🎵  
**Last Updated**: October 3, 2025  
**React App Status**: ✅ Running with comprehensive UI system, advanced AI integration, and performance optimizations on localhost:3001  
**Documentation Status**: ✅ Major codebase audit completed - discovered extensive undocumented features now properly catalogued  
**Component System**: ✅ EnhancedSongDetail (319 lines), StarRating, MobileNav, useIntersectionObserver, multi-turn AI (600+ lines)

### ✅ Completed Features

**Step 1: Project Setup & Environment Configuration** ✅
- [X] React 18 + TypeScript project initialized
- [X] All dependencies installed (Firebase, Gemini AI, Tailwind CSS, React Router)  
- [X] Complete project folder structure created
- [X] TypeScript interfaces for Song, Rating, and SearchResult
- [X] Basic routing with React Router (HomePage, SearchPage, NotFoundPage)
- [X] Tailwind CSS configured with custom tango color palette
- [X] Environment variables configuration with validation
- [X] Common UI components (LoadingSpinner, ErrorMessage, ErrorBoundary)
- [X] Responsive homepage with tango theme and glassmorphism design
- [X] Theme system for consistent styling

**Step 2: Firebase Firestore Integration** ✅
- [X] Live Firebase project created and deployed (tangotales-app.web.app)
- [X] Firestore database with security rules and indexes
- [X] Complete Firebase service layer with all CRUD operations
- [X] GitHub Actions CI/CD pipeline with auto-deployment
- [X] Environment configuration with real Firebase credentials
- [X] Database schema with Song and Rating collections
- [X] Free tier compliance (client SDK only, no Cloud Functions)

**Step 3: Basic Search Functionality** ✅
- [X] SearchContext for global state management
- [X] useSearch hook with 300ms debounced search
- [X] Interactive SearchBar component with keyboard navigation
- [X] SearchResults component with beautiful song cards
- [X] Database-first search strategy with result caching
- [X] Popular songs and letter filtering support
- [X] Loading states, error handling, and "no results" messaging
- [X] Full integration with existing Firestore service layer

**Step 4: Phase 1 Clean Slate Implementation** ✅
- [X] Removed migration complexity and unnecessary setup buttons
- [X] AI-powered search function with on-demand song generation
- [X] Integration with songInformationService for comprehensive AI content
- [X] Database cleanup utility - removed all 13 old songs
- [X] Clean database ready for AI-generated content
- [X] Comprehensive Playwright MCP testing across all viewports
- [X] Responsive design validation (desktop, tablet, mobile)
- [X] Updated copilot instructions for mandatory UI testing

**Step 5: User-Controlled AI Generation & Tango Validation** ✅
- [X] Implemented user-controlled "Search with AI" button functionality
- [X] Removed automatic AI generation for non-existent songs (cost optimization)
- [X] Created comprehensive tango validation system preventing fake songs
- [X] Turn 0 AI validation with strict tango song criteria
- [X] Database protection preventing non-tango entries
- [X] User-friendly error messaging for validation failures
- [X] Educational guidance about Argentine tango repertoire (1880-present)
- [X] Extensive Playwright MCP testing of complete validation flow

**Step 6: Advanced Component System & Performance Optimization** ✅
- [X] EnhancedSongDetail component (319 lines) - comprehensive song display with musical analysis
- [X] StarRating system - interactive 5-star rating with hover effects and averages
- [X] MobileNav component - responsive hamburger menu with animations
- [X] useIntersectionObserver hook - performance optimization for lazy loading
- [X] Multi-turn AI conversation system (5 turns) in enhancedGemini.ts (600+ lines)
- [X] Advanced JSON parsing and repair algorithms for AI responses
- [X] Response quality assessment and fallback data generation
- [X] Comprehensive sample data system with 5 fully structured tango songs
- [X] SearchPage and NotFoundPage - complete routing system
- [X] Configuration validation utilities for development environment

**Step 7: Project Documentation Consolidation** ✅
- [X] Consolidated duplicate status files into single organized location
- [X] Merged all development history preserving chronological order
- [X] Eliminated file redundancy and improved project organization
- [X] Established single source of truth for project status tracking
- [X] Updated README with latest project status and achievements
- [X] Comprehensive codebase audit revealing undocumented advanced features

## 🎯 Roadmap

### Phase 1: Foundation ✅ COMPLETED

**Step 1**: Project Setup & Environment Configuration ✅  
**Step 2**: Firebase Firestore Integration ✅  
**Step 3**: Basic Search Functionality ✅  
**Step 4**: Song Explanation Display Component � NEXT  
**Step 5**: Gemini AI API Integration ✅ **COMPLETED - USER-CONTROLLED**  

### Phase 2: Core Features � IN PROGRESS

- [X] Firebase Firestore database setup and security rules
- [X] Client-side Firebase SDK integration  
- [X] Search functionality (database-first with caching)
- [ ] Enhanced song explanation display with formatting 🔄 NEXT
- [X] Gemini AI integration for new song research ✅ **USER-CONTROLLED COMPLETE**
- [X] Client-side rate limiting for AI requests ✅ **MVP COMPLETE** (max 1 concurrent, 2-second delays)
- [X] Error handling and loading states

### Phase 3: Discovery Features 📋 PLANNED

- [ ] Alphabetical navigation (A-Z filtering)
- [ ] Popular songs sidebar
- [ ] Random song discovery
- [ ] Search history and caching

### Phase 4: User Experience 📋 PLANNED

- [ ] Rating system (5-star with comments)
- [ ] Mobile optimization and responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 5: Polish & Advanced Features 📋 PLANNED

- [ ] Dark/light theme toggle
- [ ] Search auto-suggestions
- [ ] Advanced caching strategies
- [ ] SEO optimization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Add proper error handling and loading states

## � Project Links

### 🌐 **Live Application**
- **Production Site**: [https://tangotales-app.web.app](https://tangotales-app.web.app)
- **Firebase Console**: [https://console.firebase.google.com/project/tangotales-app](https://console.firebase.google.com/project/tangotales-app)

### 📊 **Development & CI/CD**
- **GitHub Repository**: [https://github.com/kmkarakaya/TangoTales](https://github.com/kmkarakaya/TangoTales)
- **GitHub Actions**: [https://github.com/kmkarakaya/TangoTales/actions](https://github.com/kmkarakaya/TangoTales/actions)
- **Issues & Features**: [https://github.com/kmkarakaya/TangoTales/issues](https://github.com/kmkarakaya/TangoTales/issues)

### 📚 **Documentation**
- **Firebase Setup Guide**: [`FIREBASE_SETUP.md`](tangotales/FIREBASE_SETUP.md)
- **GitHub Actions Guide**: [`GITHUB_ACTIONS_COMPLETE.md`](tangotales/GITHUB_ACTIONS_COMPLETE.md)
- **Project Status**: [`.github/prompts/status.md`](.github/prompts/status.md)

## �📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎵 Acknowledgments

- **Tango Community**: For the rich musical heritage that inspires this project
- **Firebase**: For providing excellent free-tier services
- **Google Gemini AI**: For enabling intelligent content generation
- **React Team**: For the amazing development framework

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/tangotales/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/tangotales/discussions)

---

<p align="center">
  <strong>🎵 Discover the stories behind every tango 🎵</strong>
</p>

<p align="center">
  Made with ❤️ for the tango community
</p>
