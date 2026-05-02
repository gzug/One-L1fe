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
- v2 has its own root, header, copy, and README.
- v2 home has its own `HomeScreen` and home-rendered component forks under `apps/mobile/prototypes/v2/src/`; these use the v2 theme provider.
- v2 home now uses a calm green/mint score-first structure: a persistent global header with Demo/User Data and time range controls, one main One L1fe Score card with Recovery/Activity inner rings, contributor tree, a separate compact score trend card, Recovery/Activity metric charts, Health Inputs, Nutrition Hub, Notes & Ideas, secondary source status, and bounded safety note.
- v2 home display data is centralized behind `apps/mobile/prototypes/v2/src/data/homeDataAdapter.ts` and `homeTypes.ts`; `HomeScreen` should mostly render `HomeDisplayData` and keep interaction state.
- v2 shell has a local-state bottom navigation bar with exactly four tabs: Home, Trends, Insights, Profile. Trends and Insights are placeholders; Profile maps to the existing legacy Profile screen.
- v2 home passed Android emulator QA on a Pixel 9 Pro AVD, Android 15 / API 35, with light/dark visual checks and Biomarkers CTA verification.
- v2 may temporarily import unchanged non-home screens/data from `v1-marathon`; fork a component into `v2/` before changing v2-specific behavior.
- Previous authenticated minimum-slice/full-app shell: historical, not active root path.
- App config source: `apps/mobile/app.json`.
- Current Expo version: `0.2.2`; Android `versionCode: 4`; Android `minSdkVersion: 26`.
- Native Android project exists and Health Connect is integrated. Keep using this native/prebuild path for Android-only native features.
- Generated native Android file still has historical version values; do not edit generated native files unless intentionally accepting native drift.
- Health Connect: foreground display-only snapshot. No background sync, no Supabase write, no score recomputation.
- Wearable provisioning now uses real app install identity via `apps/mobile/appInstallId.ts`; the old hardcoded mock identity is not active code.
- CI is green on the latest dependency/workflow update after repo hygiene and Supabase validation fixes.

## Run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

## Recently completed

- Repo truth-source cleanup merged in PR #115.
- `MEMORY.md` startup-rule duplication removed on `main`.
- Root and mobile TypeScript checks passed locally on 2026-05-01.
- Stale broad PRs #99, #101, #105, and #108 closed after preserving extraction work in issue #116.
- PR #109 merged: `supabase/setup-cli@v2`, native Android resource hygiene exception, optional hygiene roots, and linked Supabase lint scoped to `public` schema.
- v2 Batch 1 completed: active home ownership was separated into `screens/HomeScreen.tsx`, v2 home components were forked from v1 to remove the home theme-provider mismatch, and a v2 `TimeRange` type was added.
- v2 Batch 2 completed: active home IA was redesigned around a single One L1fe Score and separate Recovery, Activity, and Biomarkers summary cards without domain scoring or package changes.
- v2 Batch 3 completed: Pixel 9 Pro Android emulator QA passed after home polish; Recovery/Activity non-ready details now use a non-interactive "Coming soon" chip.
- v2 Batch 4 completed: active Home gained Demo/User Data mode, global time range with local Custom range picker, multi-ring score card, contributor legend, Recovery/Activity metric toggles with SVG charts, Health Inputs, Nutrition Hub, and restored persistent Notes & Ideas.
- v2 Batch 5 completed: active Home gained the polished persistent header, compact score trend placement, refined score/legend hierarchy, Android-friendly bottom navigation shell, and placeholder top-level Trends/Insights tabs.
- v2 Batch 6 completed: active Home gained a v2-local display adapter/types boundary for Demo/User Data, range-filtered trend data, contributor groups, metric charts, Health Inputs, and Nutrition Hub without scoring or package changes.

## Working rules

- Keep `One L1fe` as canonical app name.
- Keep `v2` visually secondary to the app name.
- Keep v1 Marathon stable unless explicitly fixing that snapshot.
- Fork v1 components into v2 before changing v2-specific behavior.
- Keep demo data labelled.
- Keep Health Connect claims display-only unless ingest is implemented.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not commit secrets or local build artifacts.
- Do not delete full-app/auth/backend files without import/reference audit.

## Current blockers

- Physical OnePlus-class Android device QA has not yet run.
- Full-app shell files have not yet been reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated/accepted intentionally.

## Next steps

1. v2 Batch 7: use the new Home display adapter as the only integration point for any future runtime/user data wiring; keep domain scoring changes separate.
2. Run physical OnePlus-class Android QA when a device is available.
3. Preferred preview path: EAS preview build.
4. Local APK fallback: `cd apps/mobile/android && ./gradlew app:assembleRelease`.
5. APK check: `unzip -l apps/mobile/android/app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle`.
6. Extract pure Dot/Score domain work from issue #116 in a fresh code session; no UI/routing changes in that PR.
7. Start Blood Intake / Scanner research as v2 work, not v1 Marathon work.
