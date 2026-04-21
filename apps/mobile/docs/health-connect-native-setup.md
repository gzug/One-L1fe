# Health Connect Native Setup

This app now uses the Expo config plugin at [`apps/mobile/plugins/with-health-connect.ts`](/Users/ufo/Documents/Codex/2026-04-18-plugin-creator-users-ufo-codex-skills/work/One-L1fe/apps/mobile/plugins/with-health-connect.ts), so the Android manifest permissions, Health Connect rationale routing, and `MainActivity` delegate wiring survive `expo prebuild --clean`.

If you need to inspect the generated native files, run `expo prebuild --clean` and check the Android project output. No manual patching is required in `MainActivity.kt` or `AndroidManifest.xml`.

## Manifest coverage

The plugin injects the required Health Connect read permissions for the app’s Android flow, including:
- `android.permission.health.READ_STEPS`
- `android.permission.health.READ_HEART_RATE`
- `android.permission.health.READ_SLEEP`
- `android.permission.health.READ_ACTIVE_CALORIES_BURNED`
- `android.permission.health.READ_EXERCISE`
- `android.permission.health.READ_WEIGHT`
- `android.permission.health.READ_RESTING_HEART_RATE`
- `android.permission.health.READ_HEART_RATE_VARIABILITY`
- `android.permission.health.READ_VO2_MAX`
- `android.permission.health.READ_BODY_FAT`
- `android.permission.health.READ_OXYGEN_SATURATION`
- `android.permission.health.READ_BLOOD_PRESSURE`
- `android.permission.health.READ_DISTANCE`

The plugin also adds the Health Connect rationale entry points needed on Android 13 and Android 14+.

## npm install

```bash
cd apps/mobile
npm install react-native-health-connect
```

## iOS

No action needed yet. iOS stub returns `unavailable` until HealthKit adapter slice is built.
When iOS support is added: install `@kingstinct/react-native-healthkit` and implement
`createIOSAdapter()` in `wearablePermissions.ts`.

## WearableSyncScreen wiring

Wrap `WearableSyncScreen` in `App.tsx`:

```tsx
import HealthConnectPermissionGate from './HealthConnectPermissionGate.tsx';

// In the wearable-sync tab:
<HealthConnectPermissionGate>
  <WearableSyncScreen />
</HealthConnectPermissionGate>
```
