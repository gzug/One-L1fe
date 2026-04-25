# Garmin Data Path — Technical Documentation

> **Last updated:** 2026-04-20  
> **Status:** Partial — steps marked `[TECH-DEBT: hardware-verification]` require a physical
> Garmin device + active Garmin Connect pairing to validate end-to-end.

---

## Overview

```
Garmin Watch
    │  Bluetooth sync
    ▼
Garmin Connect App (Android/iOS)
    │  Health Connect sharing
    ▼
Health Connect (Android, on-device)
    │  react-native-health-connect reads Steps/HR/Sleep/etc.
    ▼
healthConnectGarminReader → normalized observations → reduced Health OS report
    │
    └── optional signed-in submit: useWearableSync → wearables-sync
```

---

## Ingestion Paths

### Path A — Android Health Connect, primary for Antler demo

| Step | Component | Notes |
|------|-----------|-------|
| 1 | User pairs Garmin watch in Garmin Connect | Garmin Connect must be syncing on the Android phone |
| 2 | Garmin Connect shares into Android Health Connect | Enabled in Garmin Connect / Health Connect settings |
| 3 | One L1fe requests Health Connect permissions | `Steps`, `SleepSession`, `HeartRate`, `RestingHeartRate`, `HeartRateVariabilityRmssd`, `ActiveCaloriesBurned`, `Distance` |
| 4 | `healthConnectGarminReader.ts` reads Health Connect records | Live claim only when records are returned |
| 5 | Reader normalizes observations | `steps_total`, `sleep_duration`, `sleep_session`, `resting_heart_rate`, `hrv`, `active_energy_burned`, `distance_total`; `heart_rate` is retained as supporting context |
| 6 | Demo report renders local Health OS output | Manual fallback is explicitly labelled when no live records are readable |

### Path B — Signed-in backend submit, optional outside reduced demo

| Step | Component | Notes |
|------|-----------|-------|
| 1 | User signs in | Reduced Antler demo does not require this path |
| 2 | `WearableSyncScreen` provisions `source_kind = health_connect`, `vendor_name = garmin` | No Terra OAuth and no direct Garmin API |
| 3 | `healthConnectGarminReader.ts` builds a non-empty `WearableSyncRequest` | No placeholder `as any` request |
| 4 | `submitWearableSync()` POSTs to `wearables-sync` | Backend rejects empty observations; app does not submit if Health Connect returns none |
| 5 | Edge function upserts observations | Idempotent by native Health Connect record id |

---

## Key Types

```
WearableObservationInput       → apps/mobile/wearableSyncClient.ts
WearableSyncRequest            → apps/mobile/wearableSyncClient.ts
HealthConnectGarminReadResult  → apps/mobile/healthConnectGarminReader.ts
WearablePermissionsAdapter     → apps/mobile/wearablePermissions.ts
ResolveWearableSourceRequest   → apps/mobile/wearableSourceProvisioning.ts
```

---

## TECH-DEBT Registry

| ID | Location | Description | Unblock condition |
|----|----------|-------------|-------------------|
| `WEARABLE-TD-001` | `wearablePermissions.ts → createAndroidAdapter()` | `hc.initialize()` + `hc.getGrantedPermissions()` are not testable without Health Connect installed | Run on physical Android with HC |
| `WEARABLE-TD-002` | Terra webhook config | Deferred. Not used in Antler demo. | Separate post-demo scope |
| `WEARABLE-TD-003` | `healthConnectGarminReader.ts` | Actual HC record reads (`hc.readRecords()`) may return empty on emulator | Run on physical Android with Garmin Connect sharing to HC |
| `WEARABLE-TD-004` | `wearable_observations` | Cursor-based incremental sync (`source_cursor`) not exercised | Integration test with ≥2 sync runs on real data |

---

## Android Health Connect — Expo Managed Workflow Note

> **Task 4 context:** In Expo Managed Workflow, `android/` is not committed to the repository.
> `MainActivity.kt` and `AndroidManifest.xml` are generated at build-time by `expo prebuild`
> and configured via `app.json` plugins.

The Health Connect plugin is declared in `apps/mobile/app.json`:

```json
"plugins": [
  "./plugins/with-health-connect"
]
```

This causes `expo prebuild` to:
1. Add Health Connect read permissions to `AndroidManifest.xml`
2. Register the Health Connect activity in `MainActivity.kt` automatically

**Do not hand-edit `android/` files** — they are regenerated on every prebuild.
If a native modification is required, create an `app.plugin.js` instead.
