---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-05-02
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated by closing agents.
For startup: read after CHECKPOINT.md. Never load `memory/` or `docs/archive/` at startup.

---

## 2026-05-02 — Codex (v2 QA fixes: logo, charts, test results)

- Addressed concrete Android/UI issues after the premium-calm reset: removed the empty font-loading gate that caused a white screen, refined the O+1 logo geometry, and applied a Manrope-based brand wordmark for the active v2 shell.
- Home now removes the floating ring glyph, renames `Medical Test Results` to `Test Results`, swaps Nutrition to a fork/knife icon, strengthens disabled styling, and supports expandable contributor rows using existing `contributors.inputs` data only.
- Trends and Home score charts now use a shared interactive chart primitive with tap inspection, tooltip, and dashed vertical guide; bar charts were rebuilt into the same visual language.
- Forked the active Blood Results flow into `apps/mobile/prototypes/v2/src/screens/BloodResultsScreenV2.tsx` so Test Results now render in v2 instead of dropping into the legacy v1 surface; no backend/domain/scoring/auth/native config changes.
- `cd apps/mobile && npm run typecheck` passes; Android `Pixel_9_Pro` QA captured updated Home, Trends with tooltip, Profile, and Test Results screenshots.

## 2026-05-03 — Codex (v2 follow-up QA closeout)

- Rechecked the unfinished parts from the prior pass: `Test Results` Compare mode now visibly renders the panel overview plus marker comparison cards, and Home dark mode was recaptured after the chart changes.
- Added Android hardware-back handling in `OneL1feV2Screen.tsx` so the active shell route stack unwinds `blood -> profile -> home` instead of depending on the system back default.
- `cd apps/mobile && npm run typecheck` still passes after the navigation change.

## 2026-05-02 — Codex (v2 full premium-calm visual reset)

- Implemented the v2 visual reset around Genoa `#31796D`: updated light/dark tokens, removed orange action styling from v2 UI, added a reusable refined O+1 `BrandMarkV2`, and aligned header/bottom nav.
- Kept Home functional boundaries intact while retuning its palette and icon/metric colors; Nutrition remains coming soon and demo/user states remain labelled.
- Rebuilt Trends into the same premium-calm shell with hero, range chips, score trend card, and quiet sage analytics cards using existing `HomeDisplayData`.
- Added v2 Insights placeholder and Profile shell; Profile now hands off to legacy Blood Results only when requested.
- `cd apps/mobile && npm run typecheck` passes; Android `Pixel_9_Pro` emulator QA captured light Home and dark Home/Trends/Insights/Profile, fixing a clipped logo mark found during QA.

## 2026-05-02 — Codex (Android QA for v2 Home screenshot batch)

- Ran Android QA on `Pixel_9_Pro` emulator (`1280x2856`, `427dp` wide, Android 15), a OnePlus 13R-class tall phone screen.
- Rebuilt/launched with `npx expo run:android --device Pixel_9_Pro` because the installed build did not deep-link into Metro and initially showed an older embedded bundle.
- Found the score card wide layout stretching contributor rows off-screen and letting bottom nav cover unfinished card content.
- Fixed only v2 UI layout: phone-width split now uses compact contributor row spacing/icon/type sizes while keeping tablet/wide behavior available.
- `cd apps/mobile && npm run typecheck` passes; no backend, Supabase, domain, auth, native config, scoring, or v1-marathon changes.

## 2026-05-02 — Codex (v2 Home screenshot UI batch)

- v2 Home moved closer to the provided health-dashboard screenshot: larger header/brand area with logo placeholder, score-first circular module, flat Recovery/Activity/Medical Test Results/Nutrition contributor list, large One Health Score Trend card, and screenshot-style bottom nav.
- Data-mode toggle now lives in the Home score card; global header keeps only brand, time range, theme, and profile controls.
- Batch stayed UI-only in `apps/mobile/prototypes/v2/src/`; no Supabase, backend, domain, scoring, auth, native config, or navigation library changes.
- Nutrition remains visually disabled / coming soon; Health Connect remains foreground display-only.
- `cd apps/mobile && npm run typecheck` passes; no `npm test` script exists in `apps/mobile/package.json`.

## 2026-05-02 — Codex (v2 Home + Trends)

- Active app path remains `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`; v2 Home is separated from the legacy v1 ThemeProvider boundary.
- Home is score-first: persistent header, Demo/User Data mode, global time range with Custom picker, multi-ring One L1fe Score, contributor legend, score trend, Recovery/Activity cards, Health Inputs, Nutrition Hub, Notes & Ideas, source status, safety note, and bottom nav.
- `homeDataAdapter.ts` / `homeTypes.ts` define the v2 `HomeDisplayData` boundary; guardrail tests cover demo/user data, time ranges, empty states, blood panel scoping, and future contributors.
- Trends MVP is live and uses existing `HomeDisplayData` only for Score, Recovery, Sleep, HRV, Resting HR, Activity, Steps, Training, and Calories; Insights remains a placeholder.
- No package, `packages/domain/`, active entry, navigation library, runtime scoring, or backend changes were introduced. CI is green; physical OnePlus-class QA is still pending.
