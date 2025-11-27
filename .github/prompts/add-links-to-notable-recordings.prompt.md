# Feature request (architect-level): Add actionable links to Notable Recordings in the Song Detail Card

IMPORTANT: this file is a developer-ready blueprint. The branch `feature/add-links-to-notable-recordings` already exists and all changes should be made there.

## Feature Goal (concise)

Add optional, accessible, and secure external link controls to each Notable Recording card in the Song Detail UI. Links must open in a new tab, be keyboard-focusable, expose descriptive aria labels, and be stored in Firestore together with the existing research data. Backwards compatibility is required: records without `links` must render unchanged.

## High-level contract

- Input (developer): update LLM Phase 4 (recordings) to include per-recording links; extend TypeScript types; update parser and Firestore write path; render links in UI components.
- Output (runtime): `songs` Firestore documents may include `notableRecordings.recordings[i].links[]` where each link is { label?, url, type? }. UI shows icon buttons for these links.
- Error modes: Malformed URLs should be discarded; missing `links` is valid; parser should attempt URL-recovery heuristics and store aggregated `recordingSources` regardless.

## Background / Context

- The app already renders a `Notable Recordings` section as small cards inside the song detail view. Each recording card currently displays details such as title, performers, year, album, and style, and includes an availability indicator/button that in the UI is labelled✅ Available (preserve exact spelling when searching code). The enhancement should integrate links into this existing structure without breaking current behaviors.
- Song documents currently include a `notableRecordings` array in Firestore. Adding an optional `links` array to each notable recording is a backward-compatible extension.

## Component Affected

- Primary: Song detail card component (likely under `src/components/songs/` or similar), specifically the subcomponent that renders the Notable Recordings entries.
- New/Support: Presentational component `NotableRecordingLinks.tsx` (proposed location: `src/components/common/`), and a small URL-to-provider util.
- Types: `src/types/song.ts` will be extended to include `NotableRecordingLink` and optional `links` on `NotableRecording`.

## Data Model (proposal)

Add an optional `links` array to each `NotableRecording` entry. Minimal proposal:

```ts
interface NotableRecordingLink {
  label?: string;   // e.g. "YouTube", "Archive.org"
  url: string;      // required absolute URL
  type?: string;    // optional host/type hint: "youtube" | "archive" | "spotify" | "other"
}

interface NotableRecording {
  title: string;
  performers?: string;
  year?: number;
  album?: string;
  style?: string;
  links?: NotableRecordingLink[];
}
```

Notes:

- The `type` field is optional; when omitted the UI should infer provider from the URL.
- Existing documents without `links` must render unchanged.

## UX / Interaction Requirements

- Render zero or more actionable link controls for each recording when `links` exist.
- Place link controls adjacent to the existing availability indicator/button (✅ Available) so availability and actions are grouped visually.
- Controls are icon buttons with accessible labels/tooltips and open links in a new tab with `rel="noopener noreferrer"`.
- Keyboard focus must reach each link; aria-labels must be descriptive (e.g., "Open YouTube recording in new tab").
- Visual design: compact icons, optional short hover label; avoid visual clutter.

Accessibility

- Provide `aria-label` and `title` for each control.
- Ensure clear focus outlines for keyboard users and minimum target sizes or a visible focus target.

Security & Privacy

- Treat links as external targets; do not preload or proxy content.
- Always use `target="_blank"` and `rel="noopener noreferrer"`.

Telemetry / Analytics (optional)

- Optionally emit a click event with { songId, recordingIndex, linkType } if analytics are enabled. Make this optional and configurable.

## Implementation Steps (Skeleton)

1. Discovery & Codewalk (30–60m)

   - Locate the file(s) that render Notable Recordings under `src/components/`.
   - Confirm the exact markup and the availability control named `avaliable` to ensure the integration point.
2. Types & Contracts (15–30m)

   - Update `src/types/song.ts`: add `NotableRecordingLink` and extend `NotableRecording`.
   - Export the new interfaces for reuse.
3. Presentational Component (2–3 hours)

   - Create `src/components/common/NotableRecordingLinks.tsx`:
     - Props: `links: NotableRecordingLink[]`, `songId?: string`, `recordingIndex?: number`.
     - Render a horizontal list of icon buttons. Each button uses an inferred or specified provider icon and a tooltip.
     - Buttons open links in a new tab and include `aria-label` and `title` attributes.
   - Add a small helper like `inferProvider(url: string): string` to map known hosts to types.
4. Integration (1–2 hours)

   - Import and render `NotableRecordingLinks` inside each recording card, placing it beside the availability indicator `✅ Available`.
   - Avoid changing existing behavior of `✅ Available` — ensure tests verify the indicator remains.
5. Testing (2 hours)

   - Unit tests (Jest + React Testing Library):
     - Render with no links (verify unchanged).
     - Render with multiple links (verify `target`/`rel` and `aria-label`).
     - Axe accessibility checks where available.
6. Playwright Smoke Test (optional, 30–60m)

   - Add a smoke test that loads a song page, focuses the recording card, tabs to the link, and screenshots the result.
7. Documentation & PR (30–60m)

   - Document the new `links` shape and how to add them to Firestore (manual process recommended).
   - Create a focused PR on `feature/add-links-to-notable-recordings` with screenshots and tests.

## Acceptance Criteria (Draft)

Core acceptance:

- AC-1: Songs with `notableRecordings[].links` render each link as an interactive control that opens the URL in a new tab with `rel="noopener noreferrer"`.
- AC-2: Songs without `links` render the Notable Recordings section identically to current behavior; the `✅ Available` indicator remains present and functional.
- AC-3: All link controls are keyboard-focusable and expose descriptive `aria-label` values for screen readers.
- AC-4: Unit tests cover rendering with and without links and assert `target`/`rel` and `aria-label` correctness.

Optional acceptance:

- AC-5: Provider icons are shown for recognized hosts (using `type` or URL inference).
- AC-6: Playwright smoke test validates keyboard navigation and provides a visual snapshot.

## Rollout, Migration & Monitoring

- Rollout: implement on the feature branch; keep changes small and covered by unit tests.
- Migration: do not run an automatic Firestore migration. If curating `links` is desired, provide a manual script or migration instructions in the PR.
- Monitoring: no backend changes required. If analytics are enabled for link clicks, verify events after deployment.

## Risks & Mitigations

- Visual regressions to recording cards — mitigate with focused visual tests and small CSS scope.
- Breaking the `✅ Available` control — mitigate by explicitly preserving markup and adding a regression unit test asserting its presence.

## Next steps (actionable)

1. Confirm whether analytics should be emitted for link clicks.
2. Approve the `NotableRecordingLink` data shape or provide feedback.
3. Assign implementation to a developer and begin with types + presentational component.

---

## Current Workflow & Feature Understanding

This section documents the exact end-to-end flow for how Notable Recordings are requested from the LLM, parsed, stored in Firestore, and rendered in the UI — and it lists the precise files/functions to change to add per-recording actionable links.

- LLM interaction (where the prompt lives)

  - Primary multi-phase flow: `src/services/enhancedGeminiWithProgress.ts` (Phase 4 / recordings prompt). There is also an older multi-turn flow in `src/services/enhancedGemini.ts` that requests `notableRecordings` in Turn 4.
  - The Phase 4 prompt already asks the LLM for three structures: `notableRecordings` (array), `currentAvailability`, and `recordingSources` (URLs). To include per-recording links we should request an explicit `links` array inside each recording object in the Phase 4 prompt (and mirror the change in the other flow in `enhancedGemini.ts`).
- Expected LLM JSON shape (current + recommended extension)

  - Current (already requested):
    - notableRecordings: { recordings: [{ artist, year, album, style, availability, significance, ... }], searchFindings: [...] }
    - currentAvailability: { streamingPlatforms[], purchaseLinks[], freeResources[], searchFindings[] }
    - recordingSources: [{ title, url, type, content }]
  - Recommended (add inside each recording):
    - recordings[].links?: [{ label?: string; url: string; type?: string }]
  - Rationale: keeping `recordingSources` is still useful as an aggregated list, but embedding `links` on each recording is simpler for direct UI rendering and preserves backwards compatibility.
- Parsing & recovery points

  - Primary parsing/repair helpers: `src/services/responseParser.ts` and `parseJSONWithRepair` usage in `enhancedGemini*.ts`.
  - `enhancedGeminiWithProgress.ts` currently contains URL-extraction heuristics (regex) that scan raw LLM text and populate `recordingSources` / `currentAvailability`. Expand this block to associate recovered URLs with the nearest recording (e.g., by matching artist + year + album text or by adding `recordingIndex` when the LLM supplies links in-line).
  - Add robust validation in `parsePhaseResponse` (or similar) to accept `links` arrays and ensure each `url` is absolute (starts with http/https) before saving.
- Firestore persistence (where phase data is saved)

  - Files: `src/services/firestore.ts` (functions: `createEnhancedSong`, `createSongWithAI`, `updateSongWithEnhancedData`, `updateSongWithResearchData`). Phase-to-field mapping uses `getPhaseFieldName` (e.g., `'notable_recordings'` → `'notableRecordings'`).
  - Current behavior: Phase 4 writes `notableRecordings`, `currentAvailability`, and `recordingSources` as top-level fields on the `songs` document (see `updateDoc(songRef, updateData)` in `enhancedGeminiWithProgress.ts`).
  - Recommendation: persist `links` inside each `notableRecordings.recordings[i].links` when available. This is backward-compatible (existing documents without `links` remain valid). Optionally keep `recordingSources` as an aggregated list for auditing/search.
- Types to change

  - `src/types/song.ts`:
    - Add interface `NotableRecordingLink { label?: string; url: string; type?: string }
    - Extend `EnhancedRecording` to include `links?: NotableRecordingLink[]` (or add a new `NotableRecording` alias if preferred).
  - Updating types early avoids widespread `any` and helps TypeScript catch missing handling points in components.
- UI rendering points (where to add link controls)

  - Files to edit:
    - `src/components/songs/EnhancedSongDetail.tsx` — primary song detail rendering (two Notable Recordings render blocks exist here; add link controls alongside the availability indicator in the per-recording card).
    - `src/components/songs/DetailedSongModal.tsx` — modal variant (if present) that shows the same recording details.
    - `src/components/songs/EnhancedSongCard.tsx` and `src/components/search/SearchResults.tsx` — smaller previews may need compact link affordances.
    - New presentational: `src/components/common/NotableRecordingLinks.tsx` (recommended) — implement the small icon-button list and `inferProvider(url)` helper.
  - Preserve existing `availability` rendering and the exact `avaliable` wording in DOM where applicable (search code for the misspelling `avaliable` if you need to match CSS/test selectors).
- Acceptance testing & QA

  - Unit tests: add Jest + RTL tests for `NotableRecordingLinks` and for the modified rendering in `EnhancedSongDetail` (no-links vs links present). Assert `target`, `rel`, `aria-label` and keyboard focusability.
  - Playwright: smoke test that loads a song page, verifies the availability indicator is present, tabs to the link control, and opens a link (or asserts the link href) in the DOM snapshot.
- Migration considerations

  - No automatic DB migration required. New links can be added manually or by a curated script. Keep `recordingSources` writes as-is for older records to allow auditing.
- Files & functions summary (exact places to change)

  - LLM prompts & parsing
    - src/services/enhancedGeminiWithProgress.ts (Phase 4 prompt, URL-recovery + Firestore write)
    - src/services/enhancedGemini.ts (Turn/phase that emits notableRecordings)
    - src/services/responseParser.ts (validation and parsing helpers)
  - Persistence
    - src/services/firestore.ts (createEnhancedSong, createSongWithAI, updateSongWithEnhancedData, updateSongWithResearchData)
  - Types
    - src/types/song.ts (add NotableRecordingLink and extend EnhancedRecording)
  - UI
    - src/components/songs/EnhancedSongDetail.tsx
    - src/components/songs/DetailedSongModal.tsx
    - src/components/songs/EnhancedSongCard.tsx
    - src/components/search/SearchResults.tsx
    - src/components/common/NotableRecordingLinks.tsx (new)
