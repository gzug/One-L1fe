---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-05-01
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Current facts

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- Canonical app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- Android device QA was run on `Pixel_9_Pro` against the checked-out v2 shell on 2026-05-02.
- `apps/mobile/prototypes/v1-marathon/` remains as the previous Marathon-focused snapshot.
- v2 has its own root, header, copy, and README.
- v2 may temporarily import unchanged components from `v1-marathon`; fork a component into `v2/` before changing v2-specific behavior.
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
- Android QA found a live blank-screen regression caused by mixed v2/v1 theme ownership; fixed locally on `qa/v2-home-trends-android-pass` by unifying the live v2 shell onto the legacy theme context used by rendered cards.

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

- Full-app shell files have not yet been reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated/accepted intentionally.
- External session summary and checked-out repo truth diverge: the live `main` shell still renders the older score/trend/profile flow and does not contain the claimed Home/Trends/bottom-nav surface.

## Next steps

1. Merge the Android QA fix from `qa/v2-home-trends-android-pass`.
2. Reconcile repo truth before further v2 QA: confirm whether PRs #117–#120 were actually merged into this checkout or whether the branch history summary is stale.
3. Preferred preview path: EAS preview build.
4. Local APK fallback: `cd apps/mobile/android && ./gradlew app:assembleRelease`.
5. APK check: `unzip -l apps/mobile/android/app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle`.
6. Extract pure Dot/Score domain work from issue #116 in a fresh code session; no UI/routing changes in that PR.
7. Start Blood Intake / Scanner research as v2 work, not v1 Marathon work.
