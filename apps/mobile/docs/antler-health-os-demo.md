# Antler Health OS Android Demo

Status: branch-local demo for `scratch/antler-health-os-demo`.

## Scope

This APK opens directly into a reduced One L1fe Health OS demo. It does not require Supabase login for the Antler flow.

Included:

- Health Connect onboarding and permission request
- Garmin-origin data path through Android Health Connect only
- Live Health Connect reader for `Steps`, `SleepSession`, `HeartRate`, `RestingHeartRate`, `HeartRateVariabilityRmssd`, `ActiveCaloriesBurned`, and `Distance`
- Normalization to `steps_total`, `sleep_duration`, `sleep_session`, `resting_heart_rate`, `hrv`, `active_energy_burned`, and `distance_total`
- Valid `WearableSyncRequest` construction when Health Connect returns records
- Reduced Health OS report with Exercise, Sleep, Nutrition, Emotional Health, completeness, Garmin state, weakest pillar, opportunity, long-term risk, bottleneck, and max 3 actions
- Clearly labelled manual demo fallback when no Health Connect records are readable

Excluded:

- Direct Garmin API
- Terra OAuth
- Any claim that Garmin sync is live unless Health Connect records are readable on device
- Medical diagnosis or treatment recommendations

## Build APK Locally

From repo root:

```bash
cd apps/mobile
npm install
EXPO_PUBLIC_ANTLER_DEMO=1 npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

APK output:

```text
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

Debug APK is acceptable for the private sideload demo and not for Play Store distribution.

Alternative EAS internal APK:

```bash
cd apps/mobile
EXPO_PUBLIC_ANTLER_DEMO=1 npx eas build --platform android --profile preview
```

Do not push or submit this branch unless explicitly requested.

## Tester Guide

1. Install Android Health Connect if the phone does not already have it.
2. Open Garmin Connect and confirm the Garmin watch has synced recently.
3. In Garmin Connect / Health Connect settings, allow Garmin Connect to write health data to Health Connect.
4. Install the One L1fe APK.
5. Open One L1fe.
6. Tap `Grant Health Connect access` and approve Steps, Sleep, Heart Rate, Resting Heart Rate, HRV, Calories, and Distance.
7. Tap `Sync from Health Connect`.
8. If live records are readable, the report badge shows `Live Health Connect`.
9. If no records are readable, the app switches to `Manual demo fallback`. This is a report preview only and is labelled as manual demo data.

Expected live-state language:

- `Garmin-origin Health Connect records readable` only when Health Connect reports a Garmin-like data origin.
- `Health Connect records readable, Garmin origin not confirmed` when records exist but Health Connect does not expose Garmin as the origin.
- `No readable Health Connect records` when permissions exist but the phone has no matching records in the lookback window.

## Troubleshooting

- No permission dialog: confirm Android Health Connect is installed and enabled.
- No Garmin records: open Garmin Connect, wait for watch sync, then confirm Health Connect sharing is enabled for Garmin Connect.
- Only partial records: approve all requested Health Connect permissions and run sync again.
- Report shows manual fallback: this is intentional when live Health Connect records are unavailable. Do not present it as live Garmin data.
