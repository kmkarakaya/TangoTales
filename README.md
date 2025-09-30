# 🎵 TangoTales

> Discover the stories behind classic tango songs

[![Firebase](https://img.shields.io/badge/Firebase-Free%20Tier-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A modern, responsive web application that helps users discover and explore the meanings, stories, and cultural context behind classic tango songs. TangoTales provides an intuitive interface for searching tango songs and accessing detailed explanations while building a community-driven knowledge base of musical stories.

## 🚀 Quick Start

**Development Status**: Step 1 Complete - React app successfully set up and running!

```bash
# Clone and navigate to the React app
git clone https://github.com/kmkarakaya/TangoTales.git
cd TangoTales/tangotales

# Install dependencies
npm install

# Start development server
npm start
# ✅ App will be available at http://localhost:3001
```

> **Note**: The app currently shows the homepage and basic navigation. Database integration and AI features are coming in the next development phase.

![TangoTales Demo](docs/images/demo.png)

## ✨ Features

### 🔍 **Intelligent Song Search**

- Clean, prominent search bar with auto-suggestions
- Two-tier search system: database first, then AI-powered research
- Smart search with fuzzy matching for partial song titles
- Automatic saving of new explanations for future reference

### 🎭 **Song Discovery**

- **A-Z Navigation**: Filter songs alphabetically
- **Popular Songs**: Top 10 most-searched songs sidebar
- **Random Discovery**: "Surprise Me" button for exploration
- **Search Statistics**: Visual indicators of database growth
- **Browser History**: Leverage native browser search history

### ⭐ **Community Feedback**

- 5-star rating system for song explanations
- Optional comment system for detailed feedback
- Average rating display for content quality assessment
- Anonymous feedback collection (no login required)

### 🎨 **Modern User Experience**

- **Responsive Design**: Mobile-first approach with elegant desktop scaling
- **Loading States**: Smooth animations during API calls
- **Error Handling**: Graceful fallbacks for network issues
- **Accessibility**: Screen reader support and keyboard navigation
- **Dark/Light Theme**: Toggle between tango-inspired themes

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Firebase Firestore (Client SDK only)
- **AI Integration**: Google Gemini AI API
- **Hosting**: Firebase Hosting
- **Routing**: React Router v6
- **State Management**: React Context API

## 🚀 Quick Start

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
│   │   └── ErrorBoundary.tsx
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
│   └── gemini.ts
├── utils/               # Utility functions
│   ├── textFormatter.ts
│   └── aiResponseParser.ts
├── contexts/            # React Context providers
│   └── SearchContext.tsx
├── types/               # TypeScript type definitions
│   └── song.ts
├── pages/               # Page components
│   ├── HomePage.tsx
│   └── SearchPage.tsx
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

**Current Phase**: Step 1 Complete - Project Setup & Environment Configuration  
**Last Updated**: September 30, 2025  
**React App Status**: ✅ Running successfully on localhost:3001

### ✅ Completed Features

**Step 1: Project Setup & Environment Configuration**
- [X] React 18 + TypeScript project initialized
- [X] All dependencies installed (Firebase, Gemini AI, Tailwind CSS, React Router)  
- [X] Complete project folder structure created
- [X] TypeScript interfaces for Song, Rating, and SearchResult
- [X] Basic routing with React Router (HomePage, SearchPage, NotFoundPage)
- [X] Tailwind CSS configured with custom tango color palette
- [X] Environment variables configuration with validation
- [X] Common UI components (LoadingSpinner, ErrorMessage, ErrorBoundary)
- [X] Responsive homepage with tango theme
- [X] Theme system for consistent styling

## 🎯 Roadmap

### Phase 1: Foundation ✅ COMPLETED

**Step 1**: Project Setup & Environment Configuration ✅  
**Step 2**: Firebase Firestore Integration 🔄 NEXT  
**Step 3**: Basic Search Functionality 📋 PLANNED  
**Step 4**: Song Explanation Display Component 📋 PLANNED  
**Step 5**: Gemini AI API Integration 📋 PLANNED  

### Phase 2: Core Features 📋 PLANNED

- [ ] Firebase Firestore database setup and security rules
- [ ] Client-side Firebase SDK integration  
- [ ] Search functionality (database + AI fallback)
- [ ] Song explanation display with formatting
- [ ] Gemini AI integration for new song research
- [ ] Error handling and loading states

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

## 📝 License

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
