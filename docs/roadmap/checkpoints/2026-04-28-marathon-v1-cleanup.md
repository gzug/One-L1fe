---
status: archived
canonical_for: snapshot
owner: repo
created: 2026-04-28
scope: repo
---

# Checkpoint — Marathon V1 Cleanup Complete

**Date:** 2026-04-28  
**Head commit:** `353d45c`  
**App version:** `0.2.2` / Android `versionCode: 4`

---

## What this snapshot captures

The end of the first structured cleanup pass after Marathon V1 was promoted to the root mobile app. All documentation now reflects the active codebase. No dead-path docs remain in agent-visible positions.

---

## State at snapshot

### Mobile app
- Active root: `apps/mobile/App.tsx` → `prototypes/v1-marathon/src/PrototypeV1MarathonScreen.tsx`
- Previous min-slice/auth shell: historical, not deleted, not active
- `app.json`: `version: 0.2.2`, `versionCode: 4`, `minSdkVersion: 26`, `userInterfaceStyle: automatic`
- Health Connect: foreground display-only snapshot — no background sync, no Supabase write, no score recomputation
- Health Connect manifest: trimmed to active foreground metrics only (Steps, Distance, RestingHeartRate, HeartRateVariabilityRmssd, ActiveCaloriesBurned, SleepSession)

### Prototype features landed
- Readiness orbit: score ring, segment bars, period selector, delta indicators
- Training Load delta: amber/muted only — never green/red
- Score colour system: `scoreColor()` bands (low / soft / steady / strong) wired across ring, chips, trend endpoint
- Score trend card: tap/drag crosshair inspection, per-series legend toggle, focused y-domain
- Today's Signals: two-line semantic chips with qualifier labels
- Blood Context home card: neutral copy, legend swatches, SVG icons
- Blood Results screen: toggle semantics (positive/warning/muted), panel overview prioritized
- Recommendations: V1 contract (Why · / Try · / scope)
- Wearable Sources card: provenance display per metric
- Health Connect native flow: real permission/status, no fake live sync
- Dark mode: LUMA-style near-black, hairline white-alpha borders, warm apricot accent
- AppHeader: primitive SVG icons — no Ionicons font dependency

### Repo / docs
- `MEMORY.md`: auth/min-slice shell marked historical
- `CHECKPOINT.md`: refreshed, EAS as preferred preview build path
- `apps/mobile/README.md`: Marathon V1 as active root, historical files documented
- `.gitignore`: local env files ignored, `.env.example` allowed
- `apps/mobile/.env.prototype`: deleted
- `copy.ts` demoInfoBody: no false product-framing, local-edit storage acknowledged

---

## Known open items at snapshot

- Full-app shell files (`LoginScreen.tsx`, `MinimumSliceScreen.tsx`, `useAuthSession.ts`, `mobileSupabaseAuth.ts`) not yet reference-audited for safe deletion
- `android/app/build.gradle` version values drift from `app.json` — intentionally not edited (generated/native)
- TypeScript typecheck not re-run after cleanup pass — last known clean: `4eda4c0`
- EAS preview APK not yet built from `0.2.2` — pending device validation
- `HeartRate` and `ExerciseSession` Health Connect permissions not declared — intentional until UI/ingest uses them

---

## Next phase

Post-cleanup, the prototype is feature-stable for device QA. The natural next work items are:
1. `eas build --profile preview` → install on OnePlus 13R → device QA pass
2. Reference-audit old shell files → safe deletion
3. Begin wiring real Health Connect data reads into the score/display layer
