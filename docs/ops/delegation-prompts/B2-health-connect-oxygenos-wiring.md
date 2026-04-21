# B2 — Health Connect Native Wiring + OxygenOS Verification

**Target agent:** ChatGPT Codex (implementation) + Perplexity Pro (OxygenOS research)
**Workstream:** B (Android Build Feasibility)
**Depends on:** B1 (prebuild must run)
**Blocks:** B3 (sideload runbook depends on working HC ingest)

---

## Context

v1 target device stack is fixed:

- **Watch:** Garmin Forerunner 255.
- **Phone:** OnePlus 13R running OxygenOS 15 (Android 15 base, global ROM —
  not the Chinese ColorOS build).

Data flow: Forerunner 255 → Garmin Connect app on the phone → Health
Connect → One L1fe app. `react-native-health-connect` is already a
dependency; `HealthConnectPermissionGate` is wired into tab navigation.

What is **not** done:

- `MainActivity.kt` Health Connect rationale intent filter (documented
  in `apps/mobile/docs/health-connect-native-setup.md`, not yet applied
  after prebuild).
- `AndroidManifest.xml` permissions block for all required HC types.
- Post-prebuild automation so patches survive `expo prebuild --clean`.
- OxygenOS-specific operational configuration: OnePlus 13R's battery
  optimization can still suspend background sync even though OxygenOS
  15 is less aggressive than MIUI. Needs a verified end-user checklist.

## Goal

1. Make the Health Connect native setup reproducible through prebuild
   (a clean build from B1 produces a working HC-ready APK).
2. Document and validate the OxygenOS 15 configuration the end user
   must apply, with an on-device verification checklist.

## Deliverables

### 1. Expo config plugin

- `apps/mobile/plugins/with-health-connect.ts` — config plugin that:
  - Adds HC permissions to `AndroidManifest.xml`:
    `android.permission.health.READ_STEPS`, `READ_HEART_RATE`,
    `READ_SLEEP`, `READ_ACTIVE_CALORIES_BURNED`,
    `READ_EXERCISE`, `READ_WEIGHT`, `READ_RESTING_HEART_RATE`,
    `READ_HEART_RATE_VARIABILITY`, `READ_VO2_MAX`, `READ_BODY_FAT`,
    `READ_OXYGEN_SATURATION`, `READ_BLOOD_PRESSURE`.
    *Note:* Forerunner 255 does not record BloodPressure or BodyFat;
    permission is declared but data may simply be empty.
  - Adds the `<activity-alias>` Health Connect rationale intent
    filter to `MainActivity` in the manifest.
  - Adds `MainActivity.kt` override for `onActivityResult` if still
    required by the current `react-native-health-connect` version.
  - Is wired via `app.json` `expo.plugins`.
- Remove the manual-patch requirement from
  `health-connect-native-setup.md` and replace with a note pointing
  at the plugin.

### 2. OxygenOS 15 operational doc

- `apps/mobile/docs/oneplus-oxygenos-setup.md` — end-user runbook,
  steps verified on OnePlus 13R / OxygenOS 15:
  - **Auto-launch**: Settings → Apps → Special app access → Auto-launch
    — enable for Garmin Connect, Health Connect, One L1fe.
  - **Battery**: Settings → Battery → Battery optimization — set all
    three apps to **Don't optimize** (aka "Unrestricted").
  - **Deep optimization / Advanced optimization**: Settings → Battery
    → More settings — disable for the three apps.
  - **Sleep standby optimization**: Settings → Battery → More settings
    — disable globally while verifying; re-enable later if desired.
  - **Background activity**: long-press app → App info → Battery usage
    — allow background activity for all three.
  - **Lock in recents**: swipe app in recents down, tap padlock.
- Verification checkpoint: after 24h + phone restart, Health Connect
  shows Garmin data with timestamps within the last 12h, and One L1fe
  `wearable_sync_runs` table has a row within 12h.

### 3. Research deliverable (Perplexity Pro)

Separate one-page summary, attached as
`apps/mobile/docs/research/oxygenos-background-constraints.md`:

- OxygenOS 15 background-process policy vs. earlier OxygenOS 13/14 and
  vs. ColorOS (India builds in particular).
- Known bugs / workarounds in the last 12 months that affect Health
  Connect sync on OnePlus devices.
- Whether OnePlus 13R has any model-specific quirks vs. the OnePlus 13.
- Status of Android 15 Health Connect on OxygenOS (Android 15 shipped
  Health Connect as a platform component; confirm this is the case
  on OxygenOS 15 rather than the standalone Google Play app).
- At least 3 recent (2025–2026) citations.

### 4. Garmin Forerunner 255 → Health Connect coverage note

Short inline section in
`apps/mobile/docs/research/oxygenos-background-constraints.md` (or
sibling file) listing what the 255 surfaces into HC:

- **Reliably present:** Steps, HeartRate, RestingHeartRate,
  HeartRateVariabilityRms (Rmssd), ActiveCaloriesBurned,
  TotalCaloriesBurned, ExerciseSession, SleepSession, Distance,
  Vo2Max, OxygenSaturation.
- **Not available in HC (even though Garmin records them):** Body
  Battery, Stress, Training Readiness, Race Predictor, HRV Status.
  Note this is an HC limitation, not a Garmin Connect bug.
- **Conditional:** Weight only if the user has a Garmin scale paired;
  BloodPressure not supported by Forerunner 255.

### 5. Validation test harness

- `apps/mobile/src/screens/HealthConnectDiagnosticScreen.tsx` —
  dev-only screen reading a small sample from each permitted HC data
  type and showing record count + latest timestamp. Guarded by
  `__DEV__`, invisible in release builds.

## Constraints

- Plugin must work with `react-native-health-connect` current version.
  Flag outdated versions — do not upgrade in this prompt.
- No changes to domain layer.
- No Supabase changes.
- No shell-out to `adb` inside the app. End-user doc is a checklist.

## Acceptance criteria

- `expo prebuild --clean` produces a project where HC permissions
  and activity-alias are present in `AndroidManifest.xml` without
  any manual edits.
- APK built via B1 flow installs on OnePlus 13R / OxygenOS 15,
  grants HC permissions, and returns non-empty data in
  `HealthConnectDiagnosticScreen` after 24h with Garmin 255 sync.
- Operator confirms the OxygenOS runbook works end to end.

## Hand-back checklist for Opus review

- [ ] Config plugin present, wired in `app.json`.
- [ ] `health-connect-native-setup.md` updated to point at the plugin.
- [ ] OxygenOS doc covers all six operational steps (Auto-launch,
      Battery optimization, Deep optimization, Sleep standby,
      Background activity, Lock in recents).
- [ ] Research doc has 3+ citations from 2025–2026 and calls out
      OxygenOS 15 vs ColorOS distinction.
- [ ] Forerunner 255 coverage note enumerates HC-reliable vs
      HC-unavailable Garmin metrics.
- [ ] Diagnostic screen gated by `__DEV__`.
- [ ] APK screenshot attached showing HC permission grant UI.
