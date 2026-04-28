# apps/mobile

Expo mobile app for One L1fe.

## Active app path

The active root surface is **One L1fe v2 prototype**.

```text
App.tsx -> prototypes/v1-marathon/src/PrototypeV1MarathonScreen.tsx
```

The `v1-marathon` folder name is historical technical naming. The active user-facing product label is `One L1fe` with a small, low-emphasis `v2` marker. Do not show Marathon in the app header.

The previous authenticated minimum-slice shell is historical. Do not treat `LoginScreen.tsx`, `SessionBar.tsx`, or `MinimumSliceScreen.tsx` as the active root path unless a later PR explicitly restores that flow.

## What this app does now

- Renders the v2 prototype directly from `App.tsx`.
- Uses illustrative demo data where labelled.
- Shows a foreground Health Connect snapshot when Android permissions and records are available.
- Keeps Health Connect display-only: no background sync, no Supabase write, no score recomputation.
- Keeps product copy bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claims.

## How to run

```bash
cd apps/mobile
npm install
npx expo start --clear
# or: npx expo run:android
```

No `.env.local` prototype gate is required for the active app path.

## Build notes

- `apps/mobile/app.json` is the app-config source for Expo version fields.
- Native Android project exists and is used for Health Connect. Keep using this prebuild/native path for Android-only native features.
- Generated native files under `apps/mobile/android/` may drift and should not be edited unless intentionally accepting native project changes.
- For a sideloadable local Android APK, use release builds, not debug builds:

```bash
cd apps/mobile/android
./gradlew app:assembleRelease
unzip -l app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle
```

## Historical backend/auth files

These files are kept for future backend/domain work and are not safe to delete without import/reference audit:

| File | Current role |
|---|---|
| `LoginScreen.tsx` | Historical Supabase sign-in UI |
| `SessionBar.tsx` | Historical signed-in session UI |
| `mobileSupabaseAuth.ts` | Supabase mobile client/auth adapter; keep for later real-data path |
| `minimumSliceScreenController.ts` | Historical minimum-slice submit controller |
| `minimumSliceScreenModel.ts` | Historical minimum-slice screen model |
| `minimumSliceHostedConfig.ts` | Historical hosted function config |
| `.env.example` | Real Supabase env var template for later authenticated paths |
