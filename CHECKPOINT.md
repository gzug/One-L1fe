---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-26
supersedes: []
superseded_by: null
scope: branch
---

# CHECKPOINT.md — Prototype V1 Marathon Branch

## Verdict

This branch is the reduced Android prototype for the incubator/demo path now named **One L1fe — Prototype V1 Marathon**.

It is not the full One L1fe app state on `main`. Treat this branch as a focused APK/demo branch whose purpose is to show a narrow marathon-readiness experience without requiring Supabase login.

## Active branch

- Branch: `claude/antler-health-os-demo-O6PNI`
- Product framing: `One L1fe — Prototype V1 Marathon`
- Runtime entry: `apps/mobile/App.tsx` returns `AntlerHealthOsDemoScreen` unless `EXPO_PUBLIC_ANTLER_DEMO=0`
- Primary screen: `apps/mobile/AntlerHealthOsDemoScreen.tsx`
- Current canonical doc: `apps/mobile/docs/prototype-v1-marathon.md`

## What is current

- `apps/mobile/AntlerHealthOsDemoScreen.tsx` — current UI shell for the reduced marathon prototype.
- `apps/mobile/healthOsTheme.ts` — current light/dark visual token set for this prototype.
- `apps/mobile/healthOsDataMode.ts` — current Real Data vs Demo Filled switch and biomarker tile mapping.
- `apps/mobile/healthOsDemoReport.ts` — current readiness report calculation and copy.
- `apps/mobile/realBiomarkerPanels.ts` — current static real biomarker panel data used by the prototype.
- `apps/mobile/healthConnectGarminReader.ts` — current Android Health Connect reader for Garmin-origin wearable data.
- `apps/mobile/healthConnectSignalRows.ts` — current wearable signal display rows.
- `apps/mobile/biomarkerProgress.ts` — current biomarker progress display rows.
- `apps/mobile/marathonNotesStorage.ts` — current local-only notes persistence.
- `apps/mobile/docs/prototype-v1-marathon.md` — current status, scope, file map, and tester guide.

## What is intentionally not current for this branch

- `main` app flow with Supabase login is not the default runtime on this branch.
- `scratch/antler-health-os-demo` is an older branch-level predecessor and should not be treated as canonical.
- `scratch/antler-demo-monday` is identical to `main` and does not contain the current reduced prototype.
- The old "Antler Health OS" naming is obsolete for user-facing copy. Keep legacy file/env names only when renaming would add avoidable build risk.

## Boundaries

Included:

- Android-first APK/demo path.
- Health Connect permission flow.
- Garmin-origin Health Connect data read path.
- Real Data vs Demo Filled mode.
- Light/dark mode.
- Static real biomarker panels for demo context.
- Local-only profile and notes drafts.

Excluded:

- Direct Garmin API.
- Terra OAuth.
- Store release pipeline.
- Medical diagnosis or treatment advice.
- Claiming live Garmin sync unless Health Connect returns readable records.

## Cleanup decisions in this session

- Reframed the branch checkpoint around **Prototype V1 Marathon**.
- Consolidated the canonical prototype documentation into `apps/mobile/docs/prototype-v1-marathon.md`.
- Marked old Antler naming as legacy implementation detail, not product language.
- Updated the Expo app display name to `One L1fe Prototype V1 Marathon`.
- Removed the obsolete `apps/mobile/docs/antler-health-os-demo.md` file after replacing it with the canonical prototype doc.

## Next steps

1. Rename `AntlerHealthOsDemoScreen.tsx` and `EXPO_PUBLIC_ANTLER_DEMO` only in a separate mechanical rename commit, if desired. Current names are tolerated to avoid build-path churn.
2. Replace remaining in-screen text `Marathon readiness` with `Prototype V1 Marathon` after fetching/editing the large screen file safely.
3. Run `npm --prefix apps/mobile run typecheck` and an Android APK build from a normal dev environment.
4. Test on the target Android phone with Garmin Connect -> Health Connect sharing enabled.
