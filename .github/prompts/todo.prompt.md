# Main Instruction

Purpose

- Fix broken or mismatched links shown on the Song Detail Card UI; ensure link metadata matches landing-page content; implement reliable URL validation and correct Gemini Search grounding extraction; fix the detail-card auto-close behavior; and remove a redundant "square" loading UI while preserving the progress bar. Validate all fixes with interactive Playwright MCP sessions.

Scope

- Update the code paths that parse Gemini Search grounding results and render links for all Song Detail Card sections (Notable Recordings, Sources, Videos, Notable Performances, etc.).
- Add a URL validation utility and metadata matching logic.
- Implement click-away auto-close for the Song Detail Card and proper focus management.
- Remove the redundant "Loading... AI Research in Progress..." square UI while keeping the progress bar.
- Add unit tests for the URL validator and Playwright MCP interactive tests that exercise links and popup behavior.

**User observations:**

- Bug 1:

  - Some of the links provided for all the various section of the song detail card still are broken. Example landing pages show errors such as:
    "404. That’s an error. The requested URL /grounding-api-redirect/... was not found on this server." or "This video isn't available anymore" or "The page you're looking for can't be found".
  - Requested action: implement or improve a mechanism to check each returned URL in the LLM search grounding to verify it is not broken. Some pages load but the expected content is missing.
  - Ensure Gemini search grounding results are used correctly (structured metadata) and not raw LLM freeform text. Check usage against the Gemini Search docs and ensure all six conversation turns properly extract domains and URLs from the search results.
- Bug 2:

  - Some links' displayed metadata does not match the landing page content. Example: a "Notable Recordings" link shows metadata "Orquesta Típica Misteriosa Buenos Aires feat. Carlos Rossi Year: 2020 Album: El sonido de Di Sarli (EP) Style: Modern" but clicking lands on "Grandes letristas de tango - Enrique Santos Discépolo - Tormenta" — the orchestra/artist is completely different.
  - Requested action: review and fix the logic that extracts and displays link metadata from Gemini grounding across all card sections and all conversation turns, because displayed info is sometimes unrelated to the landing page.
- Bug 3:

  - Auto-close for the Song Detail Card is not working. When the detail card pops up (after clicking More or a song summary), clicking outside (for example into the search bar) does not close it; the card remains and obscures the app surface.
  - Requested action: make the popup close when the user clicks anywhere outside it (click-away), and verify this with Playwright MCP.
- Bug 4:

  - When searching a new song, a square box labeled "Loading... AI Research in Progress..." appears at the bottom. This UI is redundant because a progress bar already exists.
  - Requested action: remove the square loading box without breaking the progress bar; keep the progress bar and ensure it functions.

Constraints

- Use the project's client-side Firebase only (no Admin SDK or Cloud Functions).
- Use Gemini Search grounding structured fields (domain, url, title, snippet) — do not rely on freeform LLM text output for canonical URLs or metadata.
- Use Playwright MCP for interactive browser testing and capture screenshots when failures occur.

High-level ordered plan

1. Add or improve URL validation utilities
   - Prefer HEAD; fall back to a limited GET (e.g., first 32KB) if HEAD is not allowed.
   - Follow redirects (with a reasonable limit) and confirm eventual HTTP 200.
   - Check Content-Type (expect text/html or known video host content-types).
   - Extract `<title>` and a short text snippet from the landing page for metadata matching.
   - If unavailable or mismatched, mark as invalid or unverified (see acceptance criteria).
2. Make Gemini grounding parsing robust
   - Read structured fields from the Gemini Search response object exactly as returned by the API (domain, canonical url, title, snippet).
   - For every conversation turn in the pipeline, ensure URLs/domains are extracted and stored consistently.
3. Implement metadata-to-link matching
   - Compare the landing page title/first paragraph to metadata tokens (artist, orchestra, track, album, year).
   - Require at least one strong token match (conservative threshold) to mark verified.
   - If no match, try alternative grounding entries; if none match, mark as unverified.
4. Update rendering logic
   - Only show links that are verified OR show them with a clear “(unverified)” badge and tooltip explaining the reason.
   - Log grounding objects and validation results for failed cases (do not log secrets).
5. Popup auto-close and focus management
   - Implement click-away overlay detection and close card when clicking outside or focusing the search input.
   - Return focus to the appropriate element and maintain accessible keyboard behavior (ESC to close, focus trap if modal-like behavior is used).
6. Remove the square loading UI
   - Find the component rendering the square (likely under `src/components/common`, e.g., `AIResearchProgress`) and remove or hide it while preserving the progress bar.
   - Keep a11y attributes for the progress indicator.
7. Testing with Playwright MCP
   - Create interactive Playwright MCP tests that open the app, open several Song Detail Cards, click every link, and assert: HTTP status is valid and landing page title/snippet matches metadata.
   - Verify popup auto-close and that the redundant square loading UI is not present while the progress bar functions.

Acceptance criteria

- Links rendered on the Song Detail Card are either verified or clearly labeled as unverified.
- Clicking a link must not land users on obvious 404s, removed videos, or unrelated content without a visible warning.
- Gemini grounding metadata must be sourced from structured fields, not freeform LLM output.
- The Song Detail Card must close when the user clicks outside it or focuses the search bar; ESC must close it too.
- The square “Loading... AI Research in Progress...” UI is removed; the progress bar remains and updates correctly.
- Playwright MCP interactive tests verify link validity, metadata matching, popup auto-close, and removal of the square loading UI.

Concrete implementation notes and heuristics

- Gemini Search grounding: inspect the raw response from the API and use fields such as canonical url/target, domain, title, and snippet.
- URL validation heuristics:
  - Use HEAD, then GET on failure. Limit GET body reads (e.g., 32KB) to avoid large downloads.
  - Treat 200 and 2xx as acceptable; accept a single 3xx redirect chain ending in 200.
  - Consider content-type; skip content types that are obviously binary unless the metadata expects media.
  - Extract `<title>` and first meaningful paragraph; normalize and compare tokens with metadata (case-insensitive, strip punctuation).
- Matching thresholds:
  - Require at least one exact token match among title or snippet (artist, orchestra, song title). If only looser fields match (album/year), mark unverified but allow showing with badge.
- UI behavior:
  - For unverified links show a small badge: “unverified” with a tooltip showing validation failure (404, content mismatch, etc.).
  - Add minimal telemetry logging for failed validations.

Playwright MCP test checklist (interactive)

- Open the app in an interactive Playwright session.
- For 5+ songs:
  - Open Song Detail Card.
  - Click each link in every section.
  - For each link assert:
    - The navigation resolves to HTTP 200 (after redirects), and
    - The landing page title or first ~200 characters contains at least one metadata token (artist/orchestra/song title).
  - Click outside the card and assert the card is removed and the underlying view regains focus.
  - Trigger AI research flow and assert the progress bar appears and updates; the square loading UI is not present.
  - Capture screenshots for any failures and include the original grounding object in logs.

Small tests and documentation

- Add unit tests for the validator: happy path (200 + matching title), 404, HEAD-fail but GET-ok, and content mismatch.
- Add a short README snippet into `.github/prompts/README.md` or repo docs describing the verification rules and UI behaviors.

When to surface failures to users

- If no verified grounding is found, render the best candidate with an “unverified” badge and a tooltip that explains why (e.g., "Referenced page returned 404" or "Landing page title did not match metadata").

Short checklist summary for the agent

- [ ] Implement URL validation utility (unit tests)
- [ ] Parse Gemini grounding from structured fields (update code where necessary)
- [ ] Match landing-page title/snippet to metadata and mark verified/unverified
- [ ] Update UI to show unverified badge and logging
- [ ] Fix popup click-away auto-close and focus management
- [ ] Remove square Loading UI; preserve and test the progress bar
- [ ] Add interactive Playwright MCP tests and run them

Reference

- Gemini Search grounding docs: https://ai.google.dev/gemini-api/docs/google-search#javascript

NOTE: Use the repository conventions (React + TypeScript + Tailwind) and the MCP servers available in the dev environment (Playwright MCP, Firebase MCP, etc.).
