# Health Connect Native Setup

> **Manual patches are no longer required.**
> All AndroidManifest.xml permissions, the activity-alias rationale intent filter,
> and the MainActivity.kt delegate are applied automatically by the Expo config plugin.
> See [`plugins/with-health-connect.ts`](../plugins/with-health-connect.ts).

## How the plugin works

The plugin (`apps/mobile/plugins/with-health-connect.ts`) runs during `expo prebuild` and:

1. **Adds all HC read permissions** to `AndroidManifest.xml`.
2. **Adds the `ViewPermissionUsageActivity` activity-alias** so the system can display
   Health Connect's rationale screen when the user navigates to it from Settings.
3. **Patches `MainActivity.kt`** to call
   `HealthConnectPermissionDelegate.setPermissionDelegate(this)` in `onCreate`,
   which is required by `react-native-health-connect` ≥3.x for `requestPermission()` to work.

## Running prebuild

```bash
cd apps/mobile
npx expo prebuild --clean   # re-generates android/ from scratch, plugin runs automatically
```

After prebuild, verify in the generated manifest:

```bash
grep -c 'android.permission.health' apps/mobile/android/app/src/main/AndroidManifest.xml
# should print 13
grep 'ViewPermissionUsageActivity' apps/mobile/android/app/src/main/AndroidManifest.xml
# should return a match
```

## Declared permissions

| Permission | Forerunner 255 surfaces data? |
|---|---|
| READ_STEPS | ✅ |
| READ_HEART_RATE | ✅ |
| READ_RESTING_HEART_RATE | ✅ |
| READ_HEART_RATE_VARIABILITY | ✅ (Rmssd) |
| READ_ACTIVE_CALORIES_BURNED | ✅ |
| READ_SLEEP | ✅ |
| READ_EXERCISE | ✅ |
| READ_DISTANCE | ✅ |
| READ_VO2_MAX | ✅ |
| READ_OXYGEN_SATURATION | ✅ |
| READ_WEIGHT | ⚠ Only if Garmin scale is paired |
| READ_BODY_FAT | ❌ Not recorded by FR255 |
| READ_BLOOD_PRESSURE | ❌ Not supported by FR255 |

## iOS

No action needed yet. iOS stub returns `unavailable` until the HealthKit adapter slice is built.
When iOS support is added: install `@kingstinct/react-native-healthkit` and implement
`createIOSAdapter()` in `wearablePermissions.ts`.
