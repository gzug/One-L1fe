# Health Connect Native Setup

## Required: MainActivity.kt change (Android only)

After installing `react-native-health-connect`, the following change is required in
`android/app/src/main/java/.../MainActivity.kt`.

Add the import:
```kotlin
import com.healthconnect.reactnative.permission.HealthConnectPermissionDelegate
```

Add inside `MainActivity` class:
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  HealthConnectPermissionDelegate.setPermissionDelegate(this)
}
```

Without this change, `requestPermission()` will silently fail on Android.

## Required: AndroidManifest.xml

Add inside `<manifest>`:
```xml
<uses-permission android:name="android.permission.health.READ_STEPS" />
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />
<uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED" />
<uses-permission android:name="android.permission.health.READ_DISTANCE" />
<uses-permission android:name="android.permission.health.READ_SLEEP" />
```

Add inside `<application>`:
```xml
<activity
  android:name="androidx.health.connect.client.permission.HealthPermissionActivity"
  android:exported="true" />
```

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
