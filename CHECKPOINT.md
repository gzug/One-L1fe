---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-05-02
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Current facts

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- Canonical app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- `apps/mobile/prototypes/v1-marathon/` remains as the previous Marathon-focused snapshot.
- v2 home has its own `HomeScreen` and forked components under `apps/mobile/prototypes/v2/src/`.
- v2 display data is centralized in `homeDataAdapter.ts` / `homeTypes.ts`; state (mode, timeRange, customRange) is owned by `V2Shell` in `OneL1feV2Screen.tsx` and passed to both `HomeScreen` and `TrendsScreen`.
- `TrendsScreen` renders One L1fe Score trend, Recovery metrics (Recovery, Sleep, HRV, Resting HR), and Activity metrics (Activity, Steps, Training, Calories) using existing `HomeDisplayData`. No new data sources.
- v2 shell has bottom nav with four tabs: Home, Trends (MVP live), Insights (placeholder), Profile (legacy).
- v2 home passed Android emulator QA on Pixel 9 Pro AVD (Android 15 / API 35).
- v2 may temporarily import unchanged non-home screens/data from `v1-marathon`; fork before changing v2-specific behavior.
- App config: `apps/mobile/app.json`. Expo `0.2.2`; Android `versionCode: 4`; `minSdkVersion: 26`.
- Health Connect: foreground display-only. No background sync, no Supabase write, no score recomputation.
- CI green on latest main.

## Run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

## Recently completed

- PR #115: repo truth-source cleanup.
- PR #109: `supabase/setup-cli@v2`, CI hygiene fixes.
- PR #117: v2 home redesign + data adapter boundary merged.
- PR #118: `homeDataAdapter` guardrail tests (37 assertions) merged.
- feat/trends-screen-mvp: TrendsScreen MVP + shared state lift — PR pending.

## Working rules

- Keep `One L1fe` as canonical app name.
- Keep `v2` visually secondary.
- Keep v1 Marathon stable unless explicitly fixing that snapshot.
- Fork v1 components into v2 before changing v2-specific behavior.
- Keep demo data labelled.
- Keep Health Connect claims display-only unless ingest is implemented.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not commit secrets or local build artifacts.
- Do not delete full-app/auth/backend files without import/reference audit.

## Current blockers

- Physical OnePlus-class Android device QA not yet run.
- `HomeScreen` still owns some internal state for Custom range picker UI — should remain there; only mode/timeRange/customRange values are lifted.
- Full-app shell files not yet reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated intentionally.

## Next steps

1. Merge `feat/trends-screen-mvp` PR after CI.
2. Run physical OnePlus-class Android QA.
3. Extract pure Dot/Score domain work from issue #116 (no UI/routing changes).
4. Start Blood Intake / Scanner research as v2 work.
5. EAS preview build when ready for broader QA.
