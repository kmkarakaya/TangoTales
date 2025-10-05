# Plan: Client-side rate limits (Gemini) & Firebase free-tier constraints

Summary
- Enforce conservative, client-side rate limits per Gemini model to reduce cost and abuse risk (no server proxy allowed on free-tier).
- Implement concurrency, per-request cooldown, and per-client daily caps. Surface friendly UI messages when limits block a request.
- Keep all enforcement configurable via a single config object so values can be tuned.

Constraints
- Firebase free-tier only: no server-side proxies, no Admin SDK. All logic must run client-side; secrets come from GitHub Actions at deploy time and must never be logged.
- Client-only enforcement is advisory and can be bypassed by malicious users. Use conservative defaults and telemetry to detect abuse.

Defaults and rationale (derived from image limits)
- Global concurrency per client: maxConcurrentResearch = 1
- Debounce for search UI: default 300ms
- Minimum cooldown between requests: 4s; enforce per-model cooldowns computed from conservative per-client RPM
- Per-client daily cap: conservative fraction of model RPD (default: 10% of RPD)

Per-model client-side defaults (conservative)
- Gemini 2.5 Pro (RPM 5, RPD 100)
  - per-client RPM: 2
  - cooldownBetweenRequests: 30s
  - maxConcurrentRequests: 1
  - per-client daily cap: 10
- Gemini 2.5 Flash (RPM 10, RPD 250)
  - per-client RPM: 5
  - cooldown: 12s
  - maxConcurrent: 1
  - daily cap: 25
- Gemini 2.5 Flash Preview (RPM 10, RPD 250)
  - per-client RPM: 5
  - cooldown: 12s
  - maxConcurrent: 1
  - daily cap: 25
- Gemini 2.5 Flash-Lite (RPM 15, RPD 1000)
  - per-client RPM: 7
  - cooldown: 9s
  - maxConcurrent: 1
  - daily cap: 100
- Gemini 2.5 Flash-Lite Preview (RPM 15, RPD 1000)
  - per-client RPM: 7
  - cooldown: 9s
  - maxConcurrent: 1
  - daily cap: 100
- Gemini 2.0 Flash (RPM 15, RPD 200)
  - per-client RPM: 7
  - cooldown: 9s
  - maxConcurrent: 1
  - daily cap: 20
- Gemini 2.0 Flash-Lite (RPM 30, RPD 200)
  - per-client RPM: 15
  - cooldown: 4s
  - maxConcurrent: 1
  - daily cap: 20

Enforcement design (client-side)
- Concurrency cap: reject or queue requests beyond maxConcurrentRequests. Expose queue position via progress updates.
- Cooldown: track lastRequestAt per client; disallow new requests until cooldown elapses; show remaining time in UI.
- Daily cap: track daily usage (local storage + server-aggregated telemetry if available); block when reached and advise contact/try later.
- Cancellation & staleness: support per-request IDs; ignore stale responses; persist only completed, non-stale results.
- Session GC: cap in-memory sessions and evict by LRU/TTL to avoid memory growth.

Free-tier Firebase-specific mitigations
- Secrets: store production keys in GitHub Actions secrets, never log values in client or CI artifacts.
- Writes: mark AI-generated saves with `needsManualReview` and `sanitized` payload; prefer manual approval workflow for public writes.
- Firestore costs: avoid fetching 2x pages unnecessarily; prefer precomputed tokens or smaller indexes; document required composite indexes.
- Security rules: restrict who can write AI-generated documents; require authenticated users and validate fields in rules where possible.

Telemetry & tuning
- Emit non-sensitive analytics for rate-limit hits, parse failures, and AI call counts to tune defaults.
- Make all limits configurable and add remote override possibility (with secure control) for emergency adjustments.

Next actions
- Add a single config file with the above defaults and model-specific entries.
- Implement client-side enforcement in enhancedGeminiWithProgress and useEnhancedSearch debounce/caching checks.
- Add UI messaging for blocked requests and admin telemetry events.

-- SIMPLIFIED MVP PLAN ---------------------------------

**Goal**: Prevent accidental API abuse with minimal, client-side concurrency limiting.

**Core MVP Need**: Stop multiple simultaneous AI research requests that could cause unexpected costs.

**Files to change (minimal)**:
1. `tangotales/src/utils/config.ts` — add simple rate limit constants (or create new file if needed)
2. `tangotales/src/services/enhancedGeminiWithProgress.ts` — add basic concurrency check before AI calls

**MVP Implementation (ultra-simple)**:
```typescript
// In config.ts - just add these constants
export const RATE_LIMITS = {
  MAX_CONCURRENT_AI_REQUESTS: 1,
  MIN_REQUEST_DELAY_MS: 2000
};

// In enhancedGeminiWithProgress.ts - add this pattern
let activeRequests = 0;
let lastRequestTime = 0;

async function makeAIRequest() {
  // Simple concurrency check
  if (activeRequests >= RATE_LIMITS.MAX_CONCURRENT_AI_REQUESTS) {
    throw new Error('Another AI request is in progress. Please wait.');
  }
  
  // Simple delay check  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMITS.MIN_REQUEST_DELAY_MS) {
    const waitTime = RATE_LIMITS.MIN_REQUEST_DELAY_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  activeRequests++;
  lastRequestTime = Date.now();
  
  try {
    // existing AI call logic
  } finally {
    activeRequests--;
  }
}
```

**What this MVP provides**:
- Prevents multiple concurrent AI requests (max 1 at a time)
- Enforces 2-second minimum delay between requests  
- Simple error message if user tries concurrent requests
- No localStorage, no queues, no complex state management

**What this MVP skips** (can add later):
- Per-model limits (use single global limit for now)
- Daily caps (monitor usage manually first)
- Queuing system (just reject with error message)
- Complex telemetry (use existing analytics if needed)
- Sanitization pipeline (existing parser is fine for MVP)
- Cross-tab coordination (single tab constraint acceptable for MVP)

**Implementation steps**:
1. Add rate limit constants to config
2. Add concurrency + delay check to `enhancedGeminiWithProgress.ts`
3. Test manually in UI (trigger multiple rapid requests)
4. Run existing test suite to ensure no regressions

**Time estimate**: 30 minutes implementation + 15 minutes testing

**Success criteria**:
- User cannot start multiple AI research requests simultaneously
- UI shows appropriate error message when concurrent request attempted
- No breaking changes to existing functionality

This MVP gives us 80% of the protection with 20% of the complexity. We can iterate and add queuing, per-model limits, and daily caps in future releases once this basic protection is working.


