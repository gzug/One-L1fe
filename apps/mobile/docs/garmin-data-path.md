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
    │  Terra Webhook (OAuth)
    ▼
Terra API  ─────────────────────────────────────────────────────────────┐
    │  POST /webhooks/terra → Supabase Edge Function                    │
    ▼                                                                    │
wearables-sync (Edge Function)                                          │
    │  upsert observations                                              │
    ▼                                                                    │
wearable_observations (Supabase table)                                  │
    │  foreign key → wearable_sync_runs                                 │
    ▼                                                                    │
Health Connect (Android, on-device)  ──── direct path (native) ─────────┘
    │  react-native-health-connect reads Steps/HR/Sleep/etc.
    ▼
useWearableSync → submitWearableSync() → wearables-sync
```

---

## Two Ingestion Paths

### Path A — Terra API (Garmin Connect webhook)

| Step | Component | Notes |
|------|-----------|-------|
| 1 | User pairs Garmin in-app via Terra OAuth | `TECH-DEBT: hardware-verification` — requires real device + Garmin Connect login |
| 2 | Garmin Connect uploads to Terra servers | Automatic once paired |
| 3 | Terra fires webhook to Supabase Edge Function | Endpoint: `wearables-sync` |
| 4 | Edge function upserts rows in `wearable_observations` | Idempotent via `source_record_id` |
| 5 | `wearable_sync_runs` row written with `status = completed` | |

### Path B — Health Connect (Android, on-device, direct)

| Step | Component | Notes |
|------|-----------|-------|
| 1 | User grants permissions via `HealthConnectPermissionGate` | Tested without device via `wearablePermissions.assertions.ts` |
| 2 | `wearablePermissions.ts` → `getGrantedPermissions()` | `TECH-DEBT: hardware-verification` — `hc.initialize()` requires HC installed on device |
| 3 | `useWearableSync.ts` collects observations from HC | Reads Steps, HeartRate, SleepSession, ActiveCaloriesBurned, Distance |
| 4 | `submitWearableSync()` POSTs to `wearables-sync` edge function | Tested via `evidenceIngestMock.assertions.ts` |
| 5 | Edge function upserts `wearable_observations` | Same as Path A |

---

## Key Types

```
WearableObservationInput     → apps/mobile/wearableSyncClient.ts
WearableSyncRequest          → apps/mobile/wearableSyncClient.ts
WearablePermissionsAdapter   → apps/mobile/wearablePermissions.ts
ResolveWearableSourceRequest → apps/mobile/wearableSourceProvisioning.ts
```

---

## TECH-DEBT Registry

| ID | Location | Description | Unblock condition |
|----|----------|-------------|-------------------|
| `WEARABLE-TD-001` | `wearablePermissions.ts → createAndroidAdapter()` | `hc.initialize()` + `hc.getGrantedPermissions()` are not testable without Health Connect installed | Run on physical Android with HC |
| `WEARABLE-TD-002` | Terra webhook config | Terra OAuth pairing + webhook delivery unverified | Garmin device + Terra dashboard access |
| `WEARABLE-TD-003` | `useWearableSync.ts` | Actual HC record reads (`hc.readRecords()`) return empty on emulator | Run on physical device with real Garmin data synced |
| `WEARABLE-TD-004` | `wearable_observations` | Cursor-based incremental sync (`source_cursor`) not exercised | Integration test with ≥2 sync runs on real data |

---

## Android Health Connect — Expo Managed Workflow Note

> **Task 4 context:** In Expo Managed Workflow, `android/` is not committed to the repository.
> `MainActivity.kt` and `AndroidManifest.xml` are generated at build-time by `expo prebuild`
> and configured via `app.json` plugins.

The Health Connect plugin is declared in `apps/mobile/app.json`:

```json
"plugins": [
  ["react-native-health-connect", { "permissions": ["Steps", "HeartRate", "ActiveCaloriesBurned", "Distance", "SleepSession"] }]
]
```

This causes `expo prebuild` to:
1. Add `<uses-permission android:name="android.permission.health.READ_STEPS" />` (and equivalents) to `AndroidManifest.xml`
2. Register the Health Connect activity in `MainActivity.kt` automatically

**Do not hand-edit `android/` files** — they are regenerated on every prebuild.
If a native modification is required, create an `app.plugin.js` instead.
