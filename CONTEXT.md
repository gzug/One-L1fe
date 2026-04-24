---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-04-24
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-04-24 — Codex/Claude (Increment 8 Home design refresh)

- Pulled Claude seed commit `201f315`: `apps/mobile/src/theme/tokens.ts`, dependency-free `DotIcons.tsx`, and hero demo fields in `syntheticDemoData.ts`
- Finished the warm Home UI in `apps/mobile/App.tsx`: greeting header, score hero, coverage/confidence meta, 2x2 icon Dot grid, current-update card, Ask entry, Doctor Prep/Menu action cards, and disclaimer
- Restyled `apps/mobile/AskOneL1feScreen.tsx` and `apps/mobile/FirstRunGuideOverlay.tsx` to the same warm token system
- Kept Nutrition visible/tappable but Coming Soon/no score effect; Doctor Prep and Menu stay Home actions, not Orbit Dots
- Verified `npm --prefix apps/mobile run typecheck`, `npm run test:domain`, `npm --prefix apps/mobile run export:web`, and `git diff --check`

## 2026-04-24 — Codex (Increment 7 first-run guided overlay)

- Added skipable 7-step first-run guide: Score, confidence/coverage, Dots, Ask, Doctor Prep, Menu, first data CTA
- Guide persists completion via native AsyncStorage and web localStorage; Home `i` reopens it
- Step 6 opens Menu behind the overlay; Step 7 routes `Yes, connect data` to `Activity > Wearable Sync`
- Android copy calls out Health Connect; web/iOS stays honest that Health Connect is Android-only in this prototype
- Verified `npm --prefix apps/mobile run typecheck` and `npm run test:domain`

## 2026-04-24 — Codex (Increment 6 synthetic 90-day presentation data)

- Added `packages/domain/syntheticDemoData.ts` for explicitly synthetic 90-day biomarker, wearable, sleep, HRV, activity, and habit summaries
- Home shows synthetic score values for Health, Mind & Sleep, Activity, plus current update; Nutrition remains Coming Soon/null score
- Ask One L1fe uses synthetic sourced facts for demo answers while showing sources, missing data, confidence, and safety boundaries
- `Mind & Sleep > Habits & Context` explains habit links as awareness-only context with no direct score effect
- Biomarker form shows Active / Missing / Not provided for every biomarker value; verified typecheck and domain tests

## 2026-04-24 — Codex (Increment 5 Ask One L1fe source-gated prototype)

- Added Home Ask One L1fe entry point and `apps/mobile/AskOneL1feScreen.tsx`
- Added `packages/domain/askOneL1fe.ts` as shared source/fact context plus deterministic answer builder
- V1 refuses personalized health answers without sourced facts and shows sources used, missing data, confidence, and safety boundaries
- Assertions cover no-data refusal, source overview, bounded confidence, excluded-source handling, and no fake score 0
- Verified `npm --prefix apps/mobile run typecheck` and `npm run test:domain`

## 2026-04-24 — Codex (brother Android sideload guide)

- Rewrote `docs/ops/sideload-guide.md` as a simple end-user guide for the brother tester on OnePlus 13R
- Guide assumes no shared Wi-Fi/country: APK link is sent via WhatsApp/Signal/email and opened directly on the phone
- Covers APK install, unknown-app permission, login, first-run guide, Garmin watch pairing, Garmin Connect sync, Health Connect sharing, One L1fe permissions, OnePlus battery settings, updates, and troubleshooting
- Docs-only content; no app validation needed for that section
