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

- Device QA not yet run for v2.
- Full-app shell files have not yet been reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated/accepted intentionally.

## Next steps

1. Device QA on Android for the active v2 prototype.
2. Preferred preview path: EAS preview build.
3. Local APK fallback: `cd apps/mobile/android && ./gradlew app:assembleRelease`.
4. APK check: `unzip -l apps/mobile/android/app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle`.
5. Extract pure Dot/Score domain work from issue #116 in a fresh code session; no UI/routing changes in that PR.
6. Start Blood Intake / Scanner research as v2 work, not v1 Marathon work.
