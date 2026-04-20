# Garmin Datenweg — Tech Debt Marker

> **Task 9** — Dokumentation des aktuellen Garmin-Datenpfads mit expliziten
> Hardware-Verification-TODOs für alle Schritte, die einen physischen Android-
> Device erfordern.

## Aktueller Datenweg (Stand April 2026)

```
Garmin Watch
    │  Bluetooth / Garmin Connect App (proprietär)
    ▼
Garmin Connect App (Android)
    │  schreibt Aktivitätsdaten in Android Health Connect
    ▼
Android Health Connect (OS-Layer)
    │  react-native-health-connect liest via HealthConnectClient
    ▼
wearablePermissions.ts  →  getGrantedPermissions / requestPermission
    │
    ▼
WearableSyncScreen.tsx  →  buildSyncRequest()
    │
    ▼
wearableSyncClient.ts   →  submitWearableSync()  (HTTP POST)
    │
    ▼
Supabase Edge Function: wearables-sync
    │  upsert in wearable_observations
    ▼
Postgres: wearable_observations  →  Evidence Registry
```

## Verifizierte Schritte (ohne Device, via Mocks)

| Schritt | Verifikation | Datei |
|---|---|---|
| Observation-Shape-Kontrakt | ✅ assertions-harness | `evidenceIngestMock.assertions.ts` |
| Permissions-Adapter-Logik | ✅ mock-harness | `wearablePermissions.test-harness.ts` |
| HTTP-Client Typsicherheit | ✅ TypeScript strict | `wearableSyncClient.ts` |
| Edge Function upsert | ✅ Supabase deployed | `supabase/functions/wearables-sync/` |

## TODOs — Hardware-Verification erforderlich

### HC-001 · Health Connect `initialize()` auf echtem Device

- **Was:** `hc.initialize()` muss `true` zurückgeben wenn Health Connect installiert ist
- **Warum offen:** Emulator gibt manchmal `false` zurück, echter Garmin-Nutzer-Flow ungetestet
- **Datei:** `apps/mobile/wearablePermissions.ts` → `createAndroidAdapter()`
- **Akzeptanzkriterium:** `initialize()` → `true` auf einem Pixel 7+ mit Health Connect ≥ 1.0

### HC-002 · Garmin Connect schreibt tatsächlich in Health Connect

- **Was:** Garmin Connect App muss als Health Connect Datenquelle registriert sein
- **Warum offen:** Garmin Connect Sync-Frequenz und -Vollständigkeit sind geräteabhängig
- **Akzeptanzkriterium:** `getGrantedPermissions()` liefert Steps, HeartRate, SleepSession nach manueller Sync

### HC-003 · Permission Dialog erscheint und ist vollständig

- **Was:** `requestPermission(GARMIN_READ_PERMISSIONS)` öffnet den HC-Dialog mit allen 5 Typen
- **Datei:** `apps/mobile/android/app/src/main/AndroidManifest.xml`
- **Akzeptanzkriterium:** Dialog zeigt Steps, HeartRate, ActiveCaloriesBurned, Distance, SleepSession

### HC-004 · End-to-End: Observation erscheint in Supabase

- **Was:** Nach Sync erscheint ein Datensatz in `wearable_observations` mit `source = 'garmin'`
- **Warum offen:** Benötigt echten Garmin-Schritt-Count und eine laufende Supabase-Session
- **Akzeptanzkriterium:** `SELECT * FROM wearable_observations WHERE metric_key = 'steps_daily' LIMIT 1` gibt Ergebnis zurück

### HC-005 · AndroidManifest Permission Strings gegen SDK-Version prüfen

- **Was:** `android.permission.health.READ_*` Strings müssen mit installierter HC SDK-Version übereinstimmen
- **Datei:** `apps/mobile/android/app/src/main/AndroidManifest.xml`
- **Akzeptanzkriterium:** `adb shell pm list permissions | grep health` zeigt identische Strings

## Nächste Schritte (priorisiert)

1. PR `claude/real-app-install-id` mergen → `WearableSyncScreen` auf echtem Device testen
2. HC-001 + HC-002 zusammen verifizieren (Garmin Connect Setup)
3. HC-003 als Screenshot-Regression dokumentieren
4. HC-004 als Acceptance Test in Supabase Playbook aufnehmen
