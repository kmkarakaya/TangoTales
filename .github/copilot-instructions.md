<!-- Copilot should follow every rule in this file for all code suggestions in this repository. -->

# GitHub Copilot Instructions

## Project Context

TangoTales — React (v18), TypeScript, Tailwind CSS, Firebase (Firestore, Hosting), Gemini AI API.
Constraint: use free-tier Firebase features only; keep logic client-side.

## Priorities

- Docs: short comments and high-level doc updates when adding features.
- Firebase: validate schema or workflow changes with Firebase MCP before committing.
- Tests: Jest for unit logic; Playwright MCP for UI/responsive checks.
- PRs: keep changes small and documented.

## React & Code Guidelines

- Prefer functional components and React Hooks.
- Export TypeScript interfaces for shared shapes.
- Keep components small; share UI in `src/components/common`.
- Provide loading and error states for network code.
- React.memo for performance optimization.

## Firebase rules (free-tier)

- Never use Firebase Admin SDK or Cloud Functions in this repo.
- Use Firebase v9+ modular SDK on the client only.
- Efficient Firestore queries (avoid N+1 patterns).
- Add loading/error handling and client-side caching where helpful.

## Key Features to Implement

### Song Search & Discovery

- Debounced search with auto-suggestions from Firestore.
- A-Z filtering with URL routing for deep linking.
- Popular songs sidebar (query by `searchCount`).
- Random discovery with efficient document selection.

### MCP Tools Available

#### Firebase MCP

- **MANDATORY Usage**: All database operations MUST use Firebase MCP tools.

##### Core Firebase Tools

- `activate_firebase_firebase_tools` — Project management, authentication, deployment.
- `activate_firebase_firestore_tools` — Database operations, queries, rules management.
- `activate_firebase_realtimedatabase_tools` — Real-time data sync (if needed).
- `activate_firebase_storage_tools` — File storage operations.
- `activate_firebase_authentication_tools` — User management.

##### Implementation Requirements

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

#### Playwright Browser Testing

- **MANDATORY Usage**: All UI testing MUST use Playwright MCP tools.

##### Core Playwright Tools

- `activate_playwright_browser_navigation` — Page navigation and routing.
- `activate_playwright_browser_interaction` — User interactions (click, type, hover).
- `activate_playwright_browser_screenshots_and_snapshots` — Visual documentation.
- `activate_playwright_browser_waiting` — Async operation handling.
- `activate_playwright_browser_evaluation` — JavaScript execution and debugging.
- `activate_playwright_browser_window_management` — Tab and viewport management.
- `activate_playwright_browser_console_and_network` — Debugging and monitoring.

##### Testing Workflow Requirements

```typescript
// Activate all necessary Playwright tools at start
await activate_playwright_browser_navigation();
await activate_playwright_browser_interaction();
await activate_playwright_browser_screenshots_and_snapshots();

// Standard testing pattern:
// 1. Navigate to localhost:3000
// 2. Test component functionality
// 3. Validate responsive design (3+ viewports)
// 4. Capture screenshots for documentation
// 5. Test error scenarios and edge cases
```

## Implementation Standards

### Database Operations

- **NEVER** use direct Firebase SDK calls without Firebase MCP validation.
- **ALWAYS** test security rules through Firebase MCP before deployment.
- **REQUIRED**: Use Firebase MCP for all schema changes and migrations.
- **MANDATORY**: Validate query performance through Firebase MCP tools.

### UI Development

- **NEVER** deploy UI changes without Playwright MCP testing.
- **ALWAYS** test responsive design on 3+ viewport sizes.
- **REQUIRED**: Capture component screenshots for documentation.
- **MANDATORY**: Test keyboard navigation and accessibility.

## Terminal Commands

**CRITICAL**: When running terminal commands, always use the correct directory navigation:

```powershell
# CORRECT way to navigate and start development server
cd "C:\Codes\Tango Songs\tangotales" ; npm start

# WRONG - This will fail
cd tangotales
npm start
```

**Required Terminal Command Format**:

- Use semicolon (;) to chain commands in PowerShell.
- Use full absolute path in quotes: "C:\Codes\Tango Songs\tangotales".
- Never use relative paths like `cd tangotales` — they don't work reliably.
- Always navigate to the React app directory BEFORE running npm commands.

## Minimal DB interfaces

The canonical interfaces live in `src/types/song.ts`. Below is a concise, accurate
representation of the main fields used across the app.

```typescript
interface Song {
  id: string;
  title: string;
  originalTitle?: string;
  alternativeTitles: string[];
  composer: string;
  lyricist?: string;
  yearComposed?: number;
  period?: string;
  musicalForm?: string;
  explanation: string;
  sources: string[];
  searchCount: number;
  averageRating: number;
  totalRatings: number;
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  metadata?: {
    aiResponseQuality?: 'excellent' | 'good' | 'partial' | 'failed';
    needsManualReview?: boolean;
    lastAIUpdate?: Date;
  };
}

interface Rating {
  id?: string;
  songId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}
```

## AI Integration

- Use Gemini API for structured JSON song explanations; calls must be explicit and user-initiated.
- Client-side rate limits: default MAX_CONCURRENT_AI_REQUESTS = 1, MIN_REQUEST_DELAY_MS = 2000.
- Save AI outputs with metadata and `needsManualReview` on first writes.
- Never print full API keys in logs; print presence only.

## UX and Accessibility

- Desktop-first responsive design with Tailwind CSS.
- Provide skeleton loaders and clear error states.
- Ensure ARIA labels, keyboard navigation, and focus management.
- Support dark and light themes via a ThemeContext.

## Testing & Quality Gates

- Unit tests (Jest): add unit tests for new service logic and for critical components.
- Playwright MCP: run responsive checks and capture screenshots for major UI changes.
- Pre-merge: npm run build, lint/type checks, unit tests, Playwright checks, Firebase MCP validation.

## Secrets & CI

- Store production keys in GitHub Secrets; never commit them.
- Use `.env.local` for local keys; do not commit env files.

## Terminal (PowerShell) examples

```powershell
# change directory to the project, then start the dev server
cd "C:\Codes\Tango Songs\tangotales"
npm start
```
