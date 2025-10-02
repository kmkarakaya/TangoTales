# GitHub Copilot Instructions

## Project Context: TangoTales

**Tech Stack**: React 18, TypeScript, Tailwind CSS, Firebase (Firestore, Hosting), Gemini AI API
**Constraint**: Free-tier Firebase only, client-side logic, responsive design

## Code Generation Guidelines

### React Best Practices

- Functional components with hooks (useState, useEffect, useContext, custom hooks)
- TypeScript interfaces for all props and state
- Small, reusable components with proper error boundaries
- React.memo for performance optimization

### Firebase Integration

- Firebase v9+ modular SDK, client-side operations only
- Efficient Firestore queries (avoid N+1 patterns)
- Proper loading states and error handling
- Client-side caching to reduce Firebase reads

### Code Structure

```
src/
├── components/
│   ├── common/          # Button, Loading, ErrorBoundary
│   ├── search/          # SearchBar, SearchResults, AutoSuggest
│   ├── songs/           # SongCard, SongDetail, RatingSystem
│   └── navigation/      # AlphabetNav, Sidebar, Header
├── hooks/               # useFirestore, useGemini, useSearch
├── services/            # firebase.ts, gemini.ts, storage.ts
├── types/               # Song, Rating, SearchResult interfaces
└── contexts/            # SongContext, ThemeContext, SearchContext
```

### Database Schema

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
  id: string;
  songId: string;
  rating: number;
  comment?: string;
  timestamp: Timestamp;
}
```

## Key Features to Implement

### Song Search & Discovery

- Debounced search with auto-suggestions from Firestore
- A-Z filtering with URL routing for deep linking
- Popular songs sidebar (query by searchCount)
- Random discovery with efficient document selection

### AI Integration

- Gemini API for structured JSON song explanations
- Auto-save AI responses to Firestore with metadata
- Client-side rate limiting and graceful fallbacks

### UI/UX Requirements

- Desktop-first responsive design with Tailwind CSS
- Loading states with skeleton screens
- Accessibility (ARIA labels, keyboard navigation)
- Dark/light theme support
- Error boundaries for API-dependent components

## MCP Tools Available

### Context7 Documentation

- `mcp_context7_resolve-library-id` + `mcp_context7_get-library-docs`
- Use for React, Firebase, Tailwind CSS documentation

### Firebase MCP

- Activate with `activate_firebase_firebase_tools` and `activate_firebase_firestore_tools`
- Use for project setup, Firestore operations, deployment

### GitHub MCP

- Repository operations, PR management, issue tracking
- Activate appropriate categories as needed

### Playwright Browser Testing

- UI testing, responsive design validation
- Activate with `activate_playwright_*` functions

## Development Priorities

1. **Documentation**: Context7 for current React/Firebase patterns
2. **Firebase**: Firebase MCP for database operations and hosting
3. **Testing**: Playwright for responsive design validation
4. **Collaboration**: GitHub MCP for repository management

## Testing Requirements

**MANDATORY**: After any development work, you MUST test the UI using Playwright MCP tools:

1. **Activate Playwright Tools**: Use `activate_playwright_*` functions to access browser testing capabilities
2. **UI Validation**: Test responsive design, component functionality, and user interactions
3. **Cross-browser Testing**: Verify compatibility across different viewport sizes
4. **Error Scenarios**: Test loading states, error boundaries, and edge cases
5. **Accessibility**: Validate keyboard navigation and screen reader compatibility

**Testing Workflow**:
- Navigate to http://localhost:3001 using Playwright browser navigation
- Test search functionality with real queries
- Verify AI-generated content displays correctly
- Check responsive design on mobile/tablet viewports
- Test error states and loading indicators

## Terminal Commands

**CRITICAL**: When running terminal commands, always use the correct directory navigation:

```bash
# CORRECT way to navigate and start development server
cd "C:\Codes\Tango Songs\tangotales" ; npm start

# WRONG - This will fail
cd tangotales
npm start
```

**Required Terminal Command Format**:
- Use semicolon (`;`) to chain commands in PowerShell
- Use full absolute path in quotes: `"C:\Codes\Tango Songs\tangotales"`
- Never use relative paths like `cd tangotales` - they don't work reliably
- Always navigate to the React app directory BEFORE running npm commands

**Remember**: Maintain free-tier Firebase constraints - no server-side code, Cloud Functions, or Admin SDK usage.
