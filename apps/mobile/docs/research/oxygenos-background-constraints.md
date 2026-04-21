# OxygenOS 15 Background Constraints

This note summarizes the background-execution and Health Connect constraints relevant to a OnePlus 13R running OxygenOS 15 on Android 15.

## Short version

- On Android 14 and higher, Health Connect is part of the Android framework, so there is no separate Health Connect APK to install in the normal case.
- Health Connect permissions still need to be declared in the manifest, and the app must provide the permission rationale entry point.
- OxygenOS 15 is still an OEM battery-managed environment. Even when the platform supports Health Connect natively, auto-launch, unrestricted battery mode, and background activity allowances can still determine whether sync remains fresh after the app is backgrounded or the phone reboots.
- Compared with OxygenOS 13/14, OxygenOS 15 presents the same practical problem for health sync: you still have to whitelist the relevant apps if you want background reads to stay reliable.
- Compared with ColorOS, the user-facing labels may differ slightly, but the operational concern is the same: OEM battery policy can stop background work unless the app is explicitly allowed to run.

## What changed in Android 15 / OxygenOS 15

Android’s Health Connect documentation says that:
- starting with Android 14, Health Connect is part of the Android framework,
- Android 13 and lower still use the standalone app,
- apps should declare the relevant `android.permission.health.*` permissions in `AndroidManifest.xml`,
- apps should also expose a rationale activity or activity alias for the Health Connect privacy-policy link.

OxygenOS 15 on the OnePlus 13R ships on Android 15, which means the device should use the framework-backed Health Connect path rather than depending on the standalone Play Store APK. That is an inference from the Android platform docs plus OnePlus’s OxygenOS 15 device positioning, not a device-specific API guarantee.

## Known operational constraints

1. Background execution can still be interrupted by battery policy.
2. Auto-launch and unrestricted battery access matter for Garmin Connect, Health Connect, and One L1fe.
3. Reboot testing matters because some OEM restrictions only show up after a restart.
4. Health Connect reads can appear empty if the phone has not been allowed to keep the companion apps alive long enough for Garmin Connect to flush its data.

## OnePlus 13R / OxygenOS 15 notes

OnePlus says the OnePlus 13R ships with OxygenOS 15 based on Android 15. The device is not the China-only ColorOS build, so instructions that refer to OxygenOS system settings should be followed, not ColorOS screenshots.

There is no public sign of a 13R-only Health Connect API quirk separate from the OnePlus 13. The practical difference is mostly hardware configuration and battery behavior, not a different Health Connect contract.

## Garmin Forerunner 255 -> Health Connect coverage note

Garmin documentation for the Garmin Health / Connect stack shows that the watch family can produce the following kinds of signals:

### Reliably present in Health Connect in the intended Garmin Connect bridge

- Steps
- Heart rate
- Resting heart rate
- Heart rate variability RMS / RMSSD
- Active calories burned
- Total calories burned
- Exercise session
- Sleep session
- Distance
- VO2 max
- Oxygen saturation

### Not available in Health Connect from the Forerunner 255 path

- Body Battery
- Stress
- Training Readiness
- Race Predictor
- HRV Status

These are limitations of the Garmin Connect / Health Connect bridge surface, not evidence that the watch is failing.

### Conditional

- Weight: available only if a Garmin scale is paired and the user is actually syncing that data
- Blood pressure: not supported by the Forerunner 255 path

## Recent citations

- Android Developers, *Get started with Health Connect* (updated 2026): https://developer.android.com/health-and-fitness/health-connect/get-started
- Android Developers, *HealthPermissions reference* (updated 2026): https://developer.android.com/reference/kotlin/android/health/connect/HealthPermissions
- OnePlus, *OnePlus 13R* product page showing OxygenOS 15 on Android 15: https://www.oneplus.com/us/13r/specs
- OnePlus, *OxygenOS 15 Launch Event*: https://www.oneplus.com/us/oxygenos15
- OnePlus, *OxygenOS 14.0 User Manual* for auto-launch, battery optimization, and sleep standby optimization paths: https://service.oneplus.com/content/dam/support/user-manuals/common/OxygenOS_14.0_User_Manual.pdf

