# One L1fe — Prototype V1 - Marathon

Status: branch-local Android prototype on `claude/antler-health-os-demo-O6PNI`.

This branch is the reduced demo version of One L1fe for a marathon-readiness presentation. User-facing app name/subline is **Prototype V1 - Marathon**.

Legacy implementation names remain in a few places (`AntlerHealthOsDemoScreen.tsx`, `EXPO_PUBLIC_ANTLER_DEMO`) because changing them is a mechanical rename with avoidable build risk. Do not use "Antler Health OS" as product language.

## Purpose

Create a small, understandable APK/demo path that shows how One L1fe can connect training, recovery, wearable data, and biomarkers for marathon preparation.

This is not the full One L1fe application and not the canonical `main` branch state.

## Runtime behavior

`apps/mobile/App.tsx` currently opens the prototype directly unless this environment variable is set:

```bash
EXPO_PUBLIC_ANTLER_DEMO=0
```

Default behavior on this branch: open the reduced prototype without Supabase login.

## Current file map

| Concern | Current file |
| --- | --- |
| Preferred prototype screen import | `apps/mobile/PrototypeV1MarathonScreen.tsx` |
| Current implementation screen | `apps/mobile/AntlerHealthOsDemoScreen.tsx` |
| Expo app name/package config | `apps/mobile/app.json` |
| Light/dark visual system | `apps/mobile/healthOsTheme.ts` |
| Real Data vs Demo data mode | `apps/mobile/healthOsDataMode.ts` |
| Readiness report logic | `apps/mobile/healthOsDemoReport.ts` |
| Real biomarker panel constants | `apps/mobile/realBiomarkerPanels.ts` |
| Biomarker progress rows | `apps/mobile/biomarkerProgress.ts` |
| Health Connect/Garmin reader | `apps/mobile/healthConnectGarminReader.ts` |
| Health Connect signal display rows | `apps/mobile/healthConnectSignalRows.ts` |
| Local marathon notes | `apps/mobile/marathonNotesStorage.ts` |
| Health Connect permissions hook | `apps/mobile/useWearablePermissions.ts` |
| Android Health Connect config plugin | `apps/mobile/plugins/with-health-connect.js` |

## Current scope

Included:

- Android-first prototype shell.
- No Supabase login required for the prototype path.
- Health Connect onboarding and permission request.
- Garmin-origin data path through Android Health Connect.
- Reader coverage for Steps, SleepSession, HeartRate, RestingHeartRate, HRV RMSSD, ActiveCaloriesBurned, and Distance.
- Normalized wearable keys for display/reporting.
- Real Data / Demo data mode switch.
- Light / Dark appearance toggle.
- Real biomarker panel constants for prototype context.
- Local-only profile and notes draft fields.

Excluded:

- Direct Garmin API.
- Terra OAuth.
- Store release pipeline.
- Production medical claims.
- Diagnosis, treatment, emergency guidance, or clinical recommendation behavior.
- Claiming live Garmin sync unless Health Connect returns readable records.

## Visual direction

Current design direction for this branch:

- dark, calm, premium, data-focused
- apricot as primary accent
- soft elevated cards instead of hard developer rectangles
- high contrast text and large touch targets
- fewer technical labels on user-facing surfaces
- demo state visible but not dominant

## Data modes

| Mode | Behavior |
| --- | --- |
| Real Data | Only real values are shown. Missing Garmin / Health Connect fields remain empty. |
| Demo data | Real values stay real. Missing live fields are filled with clearly labelled demo placeholders. |

Demo values must stay visibly labelled and visually distinct. Code may keep `synthetic` internally, but user-facing copy should prefer `Demo value`.

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

Debug APK is acceptable only for private sideload testing, not Play Store distribution.

## Tester guide

1. Install or enable Android Health Connect.
2. Open Garmin Connect and confirm the watch has synced recently.
3. In Garmin Connect / Health Connect settings, allow Garmin Connect to write data to Health Connect.
4. Install the APK.
5. Open Prototype V1 - Marathon.
6. Grant Health Connect access for steps, sleep, heart rate, resting heart rate, HRV, calories, and distance.
7. Tap Sync from Health Connect.
8. If records are readable, the report shows live source labels.
9. If records are missing, Real Data keeps fields empty; Demo data shows labelled placeholders.

## Known cleanup debt

- `AntlerHealthOsDemoScreen.tsx` should eventually be renamed to `PrototypeV1MarathonScreen.tsx`.
- `EXPO_PUBLIC_ANTLER_DEMO` should eventually be renamed to a neutral prototype flag.
- The large screen file should be split into focused components before further feature work.
- Remaining in-screen subline text should be changed from `Marathon readiness` to `Prototype V1 - Marathon` in a safe file-edit pass.
- Home screen still needs a true score-ring/layout pass once the large screen file is safely editable.

## Agent rule for this branch

When working on this branch, start with:

1. `CHECKPOINT.md`
2. `apps/mobile/docs/prototype-v1-marathon.md`
3. Only then inspect the implementation files listed above.

Do not infer current prototype state from old Antler naming, `scratch/*` branches, or the broader Dot/Score refactor checkpoint history.
