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
- Essential for understanding current patterns and best practices

### Firebase MCP - PRIMARY DATABASE TOOL

**MANDATORY Usage**: All database operations MUST use Firebase MCP tools

#### Core Firebase Tools
- `activate_firebase_firebase_tools` - Project management, authentication, deployment  
- `activate_firebase_firestore_tools` - Database operations, queries, rules management
- `activate_firebase_realtimedatabase_tools` - Real-time data sync (if needed)
- `activate_firebase_storage_tools` - File storage operations
- `activate_firebase_authentication_tools` - User management

#### Implementation Requirements
```typescript
// Always activate Firebase tools before database operations
await activate_firebase_firebase_tools();
await activate_firebase_firestore_tools();

// Use for:
// - Schema validation and updates
// - Security rules testing and deployment  
// - Data migration scripts
// - Query optimization and testing
// - Real-time listener setup
// - Performance monitoring
```

### Playwright Browser Testing - PRIMARY TESTING TOOL

**MANDATORY Usage**: All UI testing MUST use Playwright MCP tools

#### Core Playwright Tools
- `activate_playwright_browser_navigation` - Page navigation and routing
- `activate_playwright_browser_interaction` - User interactions (click, type, hover)
- `activate_playwright_browser_screenshots_and_snapshots` - Visual documentation
- `activate_playwright_browser_waiting` - Async operation handling
- `activate_playwright_browser_evaluation` - JavaScript execution and debugging
- `activate_playwright_browser_window_management` - Tab and viewport management
- `activate_playwright_browser_console_and_network` - Debugging and monitoring

#### Testing Workflow Requirements
```typescript
// Activate all necessary Playwright tools at start
await activate_playwright_browser_navigation();
await activate_playwright_browser_interaction();
await activate_playwright_browser_screenshots_and_snapshots();

// Standard testing pattern:
// 1. Navigate to localhost:3001
// 2. Test component functionality
// 3. Validate responsive design (3+ viewports)
// 4. Capture screenshots for documentation
// 5. Test error scenarios and edge cases
```

### GitHub MCP

- Repository operations, PR management, issue tracking
- Activate appropriate categories as needed
- Use for deployment coordination and version control

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

## MCP Integration Patterns

### Firebase Integration Workflow
```typescript
// ALWAYS start with Firebase tool activation
await activate_firebase_firebase_tools();
await activate_firebase_firestore_tools();

// Pattern for database schema updates:
// 1. Create/update TypeScript interfaces
// 2. Use Firebase MCP to validate Firestore rules
// 3. Test schema changes with sample data
// 4. Deploy rules and migration scripts
// 5. Validate with real data operations
```

### Playwright Testing Workflow  
```typescript
// ALWAYS activate required Playwright tools
await activate_playwright_browser_navigation();
await activate_playwright_browser_interaction();
await activate_playwright_browser_screenshots_and_snapshots();
await activate_playwright_browser_waiting();

// Pattern for component testing:
// 1. Navigate to development server
// 2. Test component rendering and functionality
// 3. Validate responsive design (mobile/tablet/desktop)
// 4. Capture screenshots for documentation
// 5. Test error states and edge cases
// 6. Validate accessibility features
```

### Implementation Standards

#### Database Operations
- **NEVER** use direct Firebase SDK calls without Firebase MCP validation
- **ALWAYS** test security rules through Firebase MCP before deployment
- **REQUIRED** use Firebase MCP for all schema changes and migrations
- **MANDATORY** validate query performance through Firebase MCP tools

#### UI Development  
- **NEVER** deploy UI changes without Playwright MCP testing
- **ALWAYS** test responsive design on 3+ viewport sizes
- **REQUIRED** capture component screenshots for documentation
- **MANDATORY** test keyboard navigation and accessibility

#### Quality Gates
Before any code commit:
- [ ] Firebase MCP validation completed for database changes
- [ ] Playwright MCP testing completed for UI changes  
- [ ] Screenshots captured for new/modified components
- [ ] Responsive design validated on multiple viewports
- [ ] Error handling tested through both MCP tools

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

## Secrets & CI

- Store all production API keys and deployment credentials in GitHub Actions Secrets. Do NOT commit secrets to the repository or print them in logs.
- Never log secret values, partial keys, or key lengths from production code or build scripts; log only presence/absence (for example: "Gemini key: present") and only in development environments when absolutely necessary.
- For local development, use `.env.local` with non-production keys and never commit `.env` files.
