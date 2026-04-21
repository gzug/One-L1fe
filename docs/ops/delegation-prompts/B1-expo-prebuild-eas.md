# B1 — Expo Prebuild + EAS Config for Android APK

**Target agent:** ChatGPT Codex
**Workstream:** B (Android Build Feasibility)
**Depends on:** none
**Blocks:** B2 (native Health Connect needs prebuild), B3 (sideload runbook)

---

## Context

The app is React Native + Expo. Target: sideloadable Android APK for
one user (brother, Xiaomi phone). Build host: Mac Mini M4 (Apple
silicon, local). No Google Play Store distribution. No iOS in v1.

Existing mobile code lives in `apps/mobile/`. Native setup notes in
`apps/mobile/docs/health-connect-native-setup.md` describe the manual
`MainActivity.kt` + `AndroidManifest.xml` patches Health Connect needs
(applied after prebuild).

## Goal

Produce a reproducible local APK build path on Mac Mini M4, plus an
EAS build config as a fallback, so the human operator can hit
"build → APK on disk" with a single command.

## Deliverables

### 1. Local build path (primary)

- `apps/mobile/eas.json` — profile `preview-apk`:
  - `developmentClient: false`
  - `distribution: "internal"`
  - Android-only build type `apk` (not aab)
  - Environment variables documented in `apps/mobile/docs/build-env.md`
- A documented local-build sequence in `apps/mobile/docs/android-build.md`:
  1. `pnpm install`
  2. `pnpm -C apps/mobile prebuild --platform android --clean`
  3. Apply Health Connect patches per `health-connect-native-setup.md`
     (flag that this is manual, will be automated in B2).
  4. `cd apps/mobile/android && ./gradlew assembleRelease`
  5. Output path: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

### 2. EAS build path (fallback)

- Same `eas.json` profile usable via `eas build --profile preview-apk
  --platform android --local` (local) or without `--local` (remote EAS).
- Document credentials management: signing key stored via
  `eas credentials`, **never** committed.

### 3. Signing

- Generate a dedicated debug-signing keystore once, checked into
  `apps/mobile/android/keystores/dev.keystore.example` as reference
  (placeholder file). Real keystore stored outside repo with path
  documented in `docs/build-env.md`.
- Release signing via EAS-managed keys; do not commit `.p12` or
  `.keystore` binaries.

### 4. Sanity check

- Add a CI job (GitHub Actions) that runs `expo prebuild
  --platform android` on every push to a `release/*` branch, and
  asserts the prebuild completes without error. No actual APK build
  in CI — that stays local / on-demand EAS.

## Constraints

- Mac Mini M4 (arm64). Must work on Apple silicon; if any step
  requires Rosetta, document it.
- JDK version pinned: document the version in `docs/android-build.md`
  and check via `.tool-versions` or `asdf` if already configured.
- Android SDK management: must work with both Android Studio-managed
  SDK and `sdkmanager` CLI.
- No Play Store policies. APK, not AAB.
- Build must succeed **before** Health Connect patches are applied
  (the patches are additive, not prerequisites for a minimal APK).

## Acceptance criteria

- Clean checkout on a Mac with only Node + JDK + Android SDK
  installed runs the documented sequence to a working APK.
- APK installs via `adb install` on a Xiaomi phone running
  MIUI 14 / HyperOS and opens without crashing.
- EAS fallback documented and tested once by human operator.
- `release/*` CI job passes.

## Hand-back checklist for Opus review

- [ ] `eas.json` profile `preview-apk` present and correct.
- [ ] Local build docs cover: JDK version, Android SDK path,
      prebuild command, gradle command, APK output path.
- [ ] No keystores committed.
- [ ] CI job added for prebuild sanity.
- [ ] APK size reported in PR description (baseline for later
      regression checks).
