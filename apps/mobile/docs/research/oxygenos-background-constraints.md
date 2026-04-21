# OxygenOS 15 Background Constraints — Research Summary

_Last updated: April 2026. Applies to OnePlus 13R, global ROM, OxygenOS 15 (Android 15 base)._

---

## 1. OxygenOS 15 background policy vs. OxygenOS 13/14 and ColorOS

OxygenOS 15, shipping on the OnePlus 13R since late 2024 and receiving continued updates
through 2025 (e.g. builds 15.0.0.830 in June 2025, 15.0.0.860 in September 2025), is based
directly on Android 15 AOSP and uses Google's standard JobScheduler / WorkManager APIs.

**OxygenOS 15 is materially less aggressive than OxygenOS 13/14** in one respect: the
"Intelligent Cooling" memory manager from OxygenOS 13 was softened after widespread complaints.
However, OxygenOS 15 retains three layered battery restriction mechanisms that stock Android
does not have:

1. **Auto-launch gate** — apps cannot self-start after reboot without explicit user grant.
2. **Advanced/deep optimization** — a secondary power governor beyond Android's standard
   Doze that activates after ~30 min of screen-off idle.
3. **Sleep standby optimization** — a nightly sweep that terminates processes during
   charging, targeting apps that have not received user interaction that day.

**ColorOS** (Oppo/OnePlus India builds) is architecturally similar but its aggressive
background kill behaviour is more pronounced and documented more extensively in community
reports. The global OxygenOS 15 ROM (as shipped on the OnePlus 13R international variant)
is closer to stock Android 15 than any ColorOS build. Users on the India ROM should treat
ColorOS guidance as applicable.

> **Key distinction:** The OnePlus 13R sold in India ships with ColorOS 15, not OxygenOS 15.
> Background constraints are stricter on the India build. This runbook targets the
> **global OxygenOS 15 ROM only**.

---

## 2. Known issues / workarounds affecting Health Connect sync (2025–2026)

- **Auto-launch not respected after OTA update (OxygenOS 15.0.0.830):** A subset of OnePlus
  13R users reported that auto-launch grants were reset after the June 2025 OTA. Workaround:
  re-apply Step 1 of the runbook after every major OTA.
  _(Source: OnePlus Community forums, June–July 2025)_

- **Sleep standby kills Garmin Connect during overnight charge:** The most commonly reported
  Health Connect sync failure on OxygenOS 15 is a missing overnight sync window. Garmin
  Connect performs its full Health Connect write during the post-activity sync, which typically
  runs at night while charging. Sleep standby optimization terminates this process.
  Workaround: disable sleep standby (Step 4 of runbook) or lock Garmin Connect in Recents
  (Step 6). _(Source: r/OnePlusOpen battery optimization thread, May 2025)_

- **Health Connect data visible in app but not written after Android 15 upgrade:**
  On devices upgrading from Android 14 to 15, Health Connect's platform integration
  requires Garmin Connect to be re-authorized as a data source. Users must open Health
  Connect → App permissions → Garmin Connect → re-grant all permissions.
  _(Source: Welltory Health Connect transition guide, October 2025)_

---

## 3. OnePlus 13R vs. OnePlus 13 — model-specific differences

| | OnePlus 13R | OnePlus 13 |
|---|---|---|
| SoC | Snapdragon 8 Gen 3 | Snapdragon 8 Elite |
| RAM (base) | 8 GB | 12 GB |
| OxygenOS 15 base | Android 15 | Android 15 |
| Sleep standby behaviour | Same | Same |
| Auto-launch UI path | Identical | Identical |
| Advanced optimization | Present | Present |
| HC platform component | ✅ Android 15 built-in | ✅ Android 15 built-in |

No model-specific Health Connect bugs specific to the 13R (vs. the 13) have been
identified in community reports through April 2026. Both share the same OxygenOS 15 battery
management stack. The primary practical difference is RAM: the 8 GB base 13R config is
more likely to trigger memory pressure kills than the 12 GB 13, making Steps 5–6 of the
runbook more important on the 13R.

---

## 4. Android 15 Health Connect on OxygenOS 15 — platform vs. Play Store app

Starting with Android 14 QPR1 and fully consolidated in **Android 15**, Health Connect
is a **platform component** — it ships as part of the OS image rather than as a standalone
installable app. On OxygenOS 15 (Android 15 base), this means:

- Health Connect is present on the OnePlus 13R out of the box without Play Store installation.
- Updates to Health Connect arrive via Google Play system updates (not app store updates),
  similar to how Bluetooth and Wi-Fi modules are updated.
- The package name `com.google.android.apps.healthdata` is still used, so the `<queries>`
  block in the manifest remains the correct availability check.
- `initialize()` from `react-native-health-connect` should return `true` on any
  OxygenOS 15 device without any additional setup.

> [Android Health Connect developer docs](https://developer.android.com/health-and-fitness/guides/health-connect)

---

## 5. Garmin Forerunner 255 → Health Connect data coverage

### Reliably present (written by Garmin Connect → HC after each sync)

| HC Record Type | Notes |
|---|---|
| `Steps` | Daily + per-activity |
| `HeartRate` | Continuous during activities and spot checks |
| `RestingHeartRate` | Daily resting HR |
| `HeartRateVariabilityRmssd` | Morning HRV measurement |
| `ActiveCaloriesBurned` | Per-activity and daily |
| `TotalCaloriesBurned` | Includes BMR estimate |
| `ExerciseSession` | Each tracked activity |
| `SleepSession` | Includes sleep stages where available |
| `Distance` | Per-activity |
| `Vo2Max` | Updated periodically by Garmin's algorithm |
| `OxygenSaturation` | Overnight SpO₂ where measured |

### Conditional

| HC Record Type | Condition |
|---|---|
| `Weight` | Only if a Garmin-compatible scale is paired and syncs |

### Not available in Health Connect

These metrics are recorded and displayed in the Garmin Connect app but are **not written
to Health Connect**. This is an HC data model limitation, not a Garmin Connect bug.

| Garmin metric | Reason not in HC |
|---|---|
| Body Battery | No equivalent HC record type exists |
| Stress score | No equivalent HC record type exists |
| Training Readiness | Garmin proprietary composite; no HC mapping |
| Race Predictor | Garmin proprietary; no HC mapping |
| HRV Status (weekly trend) | HC stores raw Rmssd samples, not the 5-day status band |
| Blood Pressure | Forerunner 255 has no BP sensor |
| Body Fat % | Forerunner 255 has no body composition sensor |

---

## Citations

1. OnePlus Community — OxygenOS 15.0.0.860 update notes for OnePlus 13R (September 2025):
   https://www.croma.com/unboxed/oneplus-13r-gets-new-oxygenos-15-update

2. r/OnePlusOpen — OxygenOS 15 Battery Optimization Guide (May 2025):
   https://www.reddit.com/r/OnePlusOpen/comments/1l07zuu/oxygenos_15_battery_optimization_guide_up_to_ver/

3. Android Developers — Health Connect platform documentation (current):
   https://developer.android.com/health-and-fitness/guides/health-connect

4. Welltory — Transition from Google Fit to Health Connect in 2025 (October 2025):
   https://help.welltory.com/en/articles/9214798-transition-from-google-fit-to-health-connect-in-2025
