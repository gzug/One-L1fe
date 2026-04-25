# One L1fe — V1 Marathon (Android Demo)

Status: branch-local prototype on `claude/antler-health-os-demo-O6PNI`, based on `scratch/antler-health-os-demo`.

This was previously presented as the "Antler Health OS" demo. The user-facing app, copy, and doc are now framed as **One L1fe — V1 Marathon**: a feature-reduced prototype for training support toward the Brisbane Marathon. The screen entry point and Expo wiring keep their existing file names (`AntlerHealthOsDemoScreen.tsx`, `EXPO_PUBLIC_ANTLER_DEMO`) so the build path is unchanged.

## Scope

This APK opens directly into the One L1fe — V1 Marathon view. It does not require Supabase login.

Included:

- Health Connect onboarding and permission request
- Garmin-origin data path through Android Health Connect only
- Live Health Connect reader for `Steps`, `SleepSession`, `HeartRate`, `RestingHeartRate`, `HeartRateVariabilityRmssd`, `ActiveCaloriesBurned`, and `Distance`
- Normalization to `steps_total`, `sleep_duration`, `sleep_session`, `resting_heart_rate`, `hrv`, `active_energy_burned`, and `distance_total`
- Valid `WearableSyncRequest` construction when Health Connect returns records
- Real biomarker panels from Oct 2023 (Danish hospital lab) and Apr 2025 (ALAB) sourced from `data/notion-export/05_1_Biomarker Panel Tabel.csv`
- Reduced training readiness report with Exercise, Sleep, Nutrition, Emotional Health, completeness, Garmin state, weakest pillar, biggest opportunity, long-term risk, bottleneck, and max 3 next training actions
- Visible **Real Data** vs **Demo Filled** mode toggle
- Visible **Light** / **Dark** appearance toggle
- "Planned Modules" section listing future hubs that are documented in the repo

Excluded:

- Direct Garmin API
- Terra OAuth
- Any claim that Garmin sync is live unless Health Connect records are readable on device
- Medical diagnosis or treatment recommendations
- Any subjective-only wellness experience — manual / subjective inputs are listed only as supporting context

## Data modes

| Mode          | Behaviour                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Real Data     | Only real values are shown. Missing Garmin / Health Connect fields stay empty — never invented.     |
| Demo Filled   | Real values stay real. Missing live fields are filled with clearly labelled synthetic placeholders. |

Synthetic tiles always use the amber `Synthetic demo` styling and stay visually distinguishable in both Light and Dark themes.

## Appearance

| Theme | Notes                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| Light | Modern, athletic, minimal sport surface. Synthetic data still highlighted in amber.    |
| Dark  | Dark graphite background, off-white text, muted teal/green accent, amber for synthetic only. No bright wellness colours. |

## File map

| Concern                                          | File                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| UI / sections / toggles / planned modules        | `apps/mobile/AntlerHealthOsDemoScreen.tsx`                    |
| Light / dark theme tokens                        | `apps/mobile/healthOsTheme.ts`                                |
| Real vs Demo Filled data mode + biomarker tiles  | `apps/mobile/healthOsDataMode.ts`                             |
| Training readiness report logic                  | `apps/mobile/healthOsDemoReport.ts`                           |
| Real biomarker panels (Oct 2023 + Apr 2025)      | `apps/mobile/realBiomarkerPanels.ts`                          |
| Health Connect / Garmin reader                   | `apps/mobile/healthConnectGarminReader.ts`                    |
| Wearable permissions hook                        | `apps/mobile/useWearablePermissions.ts`                       |

## Build APK locally

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

## Tester guide

1. Install Android Health Connect if the phone does not already have it.
2. Open Garmin Connect and confirm the Garmin watch has synced recently.
3. In Garmin Connect / Health Connect settings, allow Garmin Connect to write health data to Health Connect.
4. Install the One L1fe APK.
5. Open One L1fe — V1 Marathon.
6. Tap **Grant Health Connect access** and approve Steps, Sleep, Heart Rate, Resting Heart Rate, HRV, Calories, and Distance.
7. Tap **Sync from Health Connect**.
8. If live records are readable, the report shows live source labels and the badge stays in the active data mode.
9. If no records are readable, leaving the mode on **Real Data** will keep the live signals empty. Switching to **Demo Filled** shows synthetic placeholders, all clearly labelled.

Expected live-state language:

- `Garmin-origin Health Connect records readable` only when Health Connect reports a Garmin-like data origin.
- `Health Connect records readable, Garmin origin not confirmed` when records exist but Health Connect does not expose Garmin as the origin.
- `No live Health Connect data available yet` when permissions exist but the phone has no matching records in the lookback window and Real Data Mode is active.

## Planned modules surfaced in the demo

Listed for orientation only; they are not part of the V1 Marathon prototype:

- **Recovery & Wearable Hub** — `docs/architecture/wearable-metric-keys-v1.md`
- **Biomarker Hub** — `docs/architecture/biomarker-model.md`
- **Data Coverage Hub** — `docs/architecture/v1-rule-matrix.md`
- **Clinician Handoff** — `docs/product/one-l1fe-documentation.md`
- **Genetics / DNA Module** — `docs/product/one-l1fe-documentation.md`

## Troubleshooting

- No permission dialog: confirm Android Health Connect is installed and enabled.
- No Garmin records: open Garmin Connect, wait for watch sync, then confirm Health Connect sharing is enabled for Garmin Connect.
- Only partial records: approve all requested Health Connect permissions and run sync again.
- Empty live signals in Real Data Mode: this is intentional when live Health Connect records are unavailable. Switch to Demo Filled only for previews — synthetic data must never be presented as live Garmin data.
