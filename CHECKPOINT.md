---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-28
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Current facts

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- UI identity: `One L1fe` with a small, low-emphasis `v2` label. Do not show Marathon in the product header.
- Canonical app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v1-marathon/src/PrototypeV1MarathonScreen.tsx`.
- Note: the folder/component path still says `v1-marathon`; this is historical technical naming, not current UI/product framing.
- Previous authenticated minimum-slice/full-app shell: historical, not active root path.
- No `.env.local` prototype gate is required.
- App config source: `apps/mobile/app.json`.
- Current Expo version: `0.2.2`; Android `versionCode: 4`; Android `minSdkVersion: 26`.
- Native Android project exists and Health Connect is integrated. Keep using this native/prebuild path for Android-only native features.
- Generated native Android file still has historical version values; do not edit generated native files unless intentionally accepting native drift.
- Health Connect: foreground display-only snapshot. No background sync, no Supabase write, no score recomputation.

## Run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

## Completed

- Marathon-labelled prototype promoted into a broader One L1fe v2 prototype.
- Header copy now removes Marathon and shows subtle `v2`.
- `apps/mobile/README.md` updated to match active root path.
- `.gitignore` now ignores local env files.
- Demo modal copy states local edits may be stored on-device.
- Release APK guidance remains: use release build and verify bundled JS.

## Working rules

- Keep `One L1fe` as canonical app name.
- Keep `v2` visually secondary to the app name.
- Keep demo data labelled.
- Keep Health Connect claims display-only unless ingest is implemented.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not commit secrets or local build artifacts.
- Do not delete full-app/auth/backend files without import/reference audit.

## Current blockers

- Full-app shell files have not yet been reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated/accepted intentionally.
- Device QA not yet run for the v2 header/state.

## Next steps

1. Validate TypeScript: `npm --prefix apps/mobile run typecheck`.
2. Preferred preview path: EAS preview build.
3. Local APK fallback: `cd apps/mobile/android && ./gradlew app:assembleRelease`.
4. APK check: `unzip -l apps/mobile/android/app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle`.
5. Device QA on Android.
6. Start Scanner research/spike only after v2 device QA.
