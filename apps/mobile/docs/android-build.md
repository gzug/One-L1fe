# Android APK Build Runbook

This is the reproducible local build path for a sideloadable Android APK on Apple silicon.

## Prerequisites

- Node.js installed
- JDK 17 active
- Android SDK available at `ANDROID_SDK_ROOT`
- Mobile environment variables set as described in `docs/build-env.md`

## Local build sequence

1. Install dependencies from the repo root:

```bash
pnpm install
```

2. Generate the Android native project:

```bash
pnpm -C apps/mobile prebuild --platform android --clean
```

3. Apply the manual Health Connect patches described in `docs/health-connect-native-setup.md`.

4. Build the release APK:

```bash
cd apps/mobile/android
./gradlew assembleRelease
```

5. Collect the APK from:

```text
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Notes

- The Health Connect patch step is manual for B1 and will be automated in B2.
- The build should succeed before the Health Connect patches are applied; the patches are additive.
- If the machine uses `asdf`, ensure the repo is using JDK 17 before calling Gradle.

## EAS fallback

The same Expo profile can be used for APK builds:

```bash
eas build --profile preview-apk --platform android --local
```

Or run it remotely:

```bash
eas build --profile preview-apk --platform android
```

Release signing is stored via `eas credentials` and should never be committed.
