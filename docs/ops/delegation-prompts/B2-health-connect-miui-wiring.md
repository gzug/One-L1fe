# B2 — Health Connect Native Wiring + Xiaomi/MIUI Verification

**Target agent:** ChatGPT Codex (implementation) + Perplexity Pro (MIUI research)
**Workstream:** B (Android Build Feasibility)
**Depends on:** B1 (prebuild must run)
**Blocks:** B3 (sideload runbook depends on working HC ingest)

---

## Context

v1 target user runs a Xiaomi phone (MIUI 14 or HyperOS). Garmin data
flows Garmin watch → Garmin Connect app → Health Connect → our app.
`react-native-health-connect` is already a dependency; the
`HealthConnectPermissionGate` is already wired into tab navigation.

What is **not** done:

- `MainActivity.kt` Health Connect intent filter (documented in
  `apps/mobile/docs/health-connect-native-setup.md` but not yet
  applied to the generated Android project — needs to happen after
  every prebuild).
- `AndroidManifest.xml` permissions block for all required HC types.
- Post-prebuild automation so these patches survive `expo prebuild
  --clean`.
- MIUI-specific handling: background-process killing on Xiaomi can
  prevent Health Connect's own sync service and our app from
  completing ingest. This is documented user-space behavior and needs
  operational workarounds, not code changes.

## Goal

1. Make the Health Connect native setup reproducible through prebuild
   (so a clean build from B1 produces a working HC-ready APK).
2. Document and validate the MIUI-specific configuration the end user
   must apply, with a verification checklist.

## Deliverables

### 1. Expo config plugin

- `apps/mobile/plugins/with-health-connect.ts` — config plugin that:
  - Adds HC permissions to `AndroidManifest.xml`:
    `android.permission.health.READ_STEPS`, `READ_HEART_RATE`,
    `READ_SLEEP`, `READ_ACTIVE_CALORIES_BURNED`,
    `READ_EXERCISE`, `READ_WEIGHT`, `READ_RESTING_HEART_RATE`,
    `READ_HEART_RATE_VARIABILITY`, `READ_VO2_MAX`, `READ_BODY_FAT`,
    `READ_OXYGEN_SATURATION`, `READ_BLOOD_PRESSURE`.
  - Adds the `<activity-alias>` Health Connect rationale intent
    filter to `MainActivity` in the manifest.
  - Adds `MainActivity.kt` override for `onActivityResult` if still
    required by the current `react-native-health-connect` version.
  - Is wired via `app.json` `expo.plugins`.
- Remove the manual-patch requirement from
  `health-connect-native-setup.md` and replace with a note pointing
  at the plugin.

### 2. MIUI / HyperOS operational doc

- `apps/mobile/docs/xiaomi-miui-setup.md` — end-user runbook:
  - Enable **Autostart** for: Garmin Connect, Health Connect, One L1fe.
  - Set **Battery saver** → **No restrictions** for those three apps.
  - **Lock in recent apps** (padlock gesture) for One L1fe.
  - Disable **MIUI Optimization** if on HyperOS (toggle is under
    Developer Options).
  - Enable **Background activity** under app info for all three apps.
  - Verification: after 24h and a phone restart, Health Connect
    still shows fresh Garmin data and One L1fe's `wearable_sync_runs`
    table has a row dated within the last 12h.

### 3. Research deliverable (Perplexity Pro)

Separate one-page summary, attached as
`apps/mobile/docs/research/miui-background-constraints.md`:

- Which MIUI versions are currently shipping on common Xiaomi models
  (Redmi Note 13, Mi 13, Mi 14, Poco F5).
- Known bugs / workarounds in the last 12 months that affect Health
  Connect sync.
- Whether HyperOS 1.x / 2.x changes the background-process policy.
- Whether Xiaomi has an official "whitelist" or "protected apps" API
  app developers can target (likely no for sideloaded APKs).
- At least 3 recent (2025–2026) citations.

### 4. Validation test harness

- `apps/mobile/src/screens/HealthConnectDiagnosticScreen.tsx` —
  dev-only screen that reads a small sample from each permitted HC
  data type and shows record count + latest timestamp. Used for on-device
  verification. Guarded by `__DEV__` flag, not visible in release.

## Constraints

- Plugin must work with `react-native-health-connect` current version.
  If the version is outdated, flag it — do not upgrade in this prompt.
- No changes to domain layer.
- No changes to Supabase.
- Do not auto-generate or modify files that belong to users' phones
  (no shell-out to `adb`). The MIUI doc is a user-facing checklist.

## Acceptance criteria

- `expo prebuild --clean` produces a project where HC permissions
  and activity-alias are present in `AndroidManifest.xml` without
  any manual edits.
- APK built via B1 flow installs on a MIUI 14 device, grants HC
  permissions, and returns non-empty data in
  `HealthConnectDiagnosticScreen` after 24h with Garmin sync.
- Human operator + Opus review confirms Xiaomi runbook works end to
  end on the target device.

## Hand-back checklist for Opus review

- [ ] Config plugin present, wired in `app.json`.
- [ ] `health-connect-native-setup.md` updated to point at the plugin.
- [ ] MIUI doc covers all six operational steps.
- [ ] Research doc has 3+ citations from 2025–2026.
- [ ] Diagnostic screen gated by `__DEV__`.
- [ ] APK screenshot attached showing HC permission grant UI.
