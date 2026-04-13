---
status: current
canonical_for: initial wearable metric taxonomy
owner: repo
last_verified: 2026-04-14
supersedes: []
superseded_by: null
scope: architecture
---

# Wearable metric keys V1

## Verdict

The first wearable metric set should stay small, stable, and biased toward metrics that are:
- commonly exposed by Apple Health and Health Connect,
- understandable without vendor-specific black-box logic,
- useful for dashboards and later context-aware interpretation.

## First V1 subset

These are the recommended first keys to support end to end.

### Sleep
- `sleep_session`
- `sleep_duration`
- `awake_duration`

### Activity
- `steps_total`
- `active_minutes`
- `workout_session`

### Cardiovascular / recovery
- `heart_rate`
- `resting_heart_rate`
- `hrv`

## Second wave, only if platform support is clean
- `respiratory_rate`
- `spo2`
- `temperature_deviation`
- `distance_total`
- `active_energy_burned`

## Explicitly not first-class rule inputs in V1
- `sleep_stage`
- `readiness_score`
- `stress_score`
- `body_battery`
- `recovery_score`
- `vo2max_estimate`

These may still be stored later, but should be flagged as vendor-derived or vendor-black-box.

## Key definitions

| key | display name | domain | value type | default unit | aggregation hint | evidence class | confidence |
|---|---|---|---|---|---|---|---|
| `sleep_session` | Sleep session | sleep | json |  | session | device_observed | medium |
| `sleep_duration` | Sleep duration | sleep | numeric | min | session | device_observed | medium |
| `awake_duration` | Awake duration during sleep | sleep | numeric | min | session | vendor_derived | low |
| `steps_total` | Steps total | activity | numeric | count | day | device_observed | high |
| `active_minutes` | Active minutes | activity | numeric | min | day | product_derived | medium |
| `workout_session` | Workout session | activity | json |  | session | device_observed | medium |
| `heart_rate` | Heart rate | cardiovascular | numeric | bpm | sample | device_observed | medium |
| `resting_heart_rate` | Resting heart rate | cardiovascular | numeric | bpm | day | vendor_derived | medium |
| `hrv` | Heart rate variability | recovery | numeric | ms | sample | device_observed | variable |
| `respiratory_rate` | Respiratory rate | respiration | numeric | breaths/min | sample | vendor_derived | variable |
| `spo2` | Blood oxygen saturation | recovery | numeric | % | sample | vendor_derived | variable |
| `temperature_deviation` | Temperature deviation | recovery | numeric | delta_c | day | vendor_derived | variable |
| `distance_total` | Distance total | activity | numeric | m | day | device_observed | high |
| `active_energy_burned` | Active energy burned | activity | numeric | kcal | day | vendor_derived | low |

> **Taxonomy note:** The canonical `evidence_class` values are defined in the `evidence_class` SQL enum.
> Single source of truth: `supabase/migrations/20260413214000_phase0_wearables_context.sql`.
> Valid values: `device_observed | vendor_derived | vendor_black_box | self_report | product_derived`.
> `product_compatible` is NOT a valid value — use `product_derived`.

## Modeling notes

### `sleep_session`
Use as a session-shaped row with:
- `observed_at` = sleep start
- `observation_end_at` = sleep end
- `value_json` for source-specific details when useful

### `workout_session`
Use as a session-shaped row with:
- `observed_at` = workout start
- `observation_end_at` = workout end
- `value_text` = workout type if available
- `value_json` = source-specific workout metadata

### `steps_total`
Prefer daily totals first.
Do not overfit to intraday sample granularity in V1 unless a concrete product use case appears.

### `active_minutes`
Treat carefully because platform semantics vary.
Use only as a convenient trend signal, not as an exact physiological quantity.
Treat it as product-derived normalization over platform-specific activity concepts, not as a strict raw-equivalent metric.

### `resting_heart_rate`
Usually safe as a product trend input.
Still keep source provenance because vendor calculation methods differ.

### `hrv`
Do not assume one universal HRV method.
Apple Health commonly exposes SDNN, while Health Connect commonly exposes RMSSD.
Store the method explicitly in source metadata and do not compare cross-platform HRV as if it were the same signal.

## Recommended source mapping posture

### Apple Health / HealthKit
Likely first mappings:
- `sleep_session` / `sleep_duration` from `HKCategoryTypeIdentifierSleepAnalysis`
- `steps_total` from `HKQuantityTypeIdentifierStepCount`
- `heart_rate` from `HKQuantityTypeIdentifierHeartRate`
- `resting_heart_rate` from `HKQuantityTypeIdentifierRestingHeartRate`
- `hrv` from `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`
- `workout_session` from `HKWorkoutType`

Prefer platform-store ingestion over direct vendor APIs in V1.

### Android Health Connect
Likely first mappings:
- `sleep_session` / `sleep_duration` from `SleepSessionRecord`
- `steps_total` from `StepsRecord`
- `heart_rate` from `HeartRateRecord`
- `resting_heart_rate` from `RestingHeartRateRecord`
- `hrv` from `HeartRateVariabilityRmssdRecord`
- `workout_session` from `ExerciseSessionRecord`

Accept that some Android device ecosystems will expose less consistent HRV and sleep data.

## Summary-key examples for `wearable_daily_summaries`

Daily summaries should declare whether they are source-specific or merged across sources.
If merged, the precedence and timezone rule must be explicit in the computation contract.

Daily summaries that are good first candidates:
- `steps_total`
- `sleep_duration_total`
- `resting_heart_rate_daily`
- `hrv_overnight_avg`
- `active_minutes_total`
- `workout_minutes_total`

Rolling summaries that are good later candidates:
- `steps_avg_7d`
- `sleep_duration_avg_7d`
- `resting_heart_rate_avg_7d`
- `hrv_overnight_avg_7d`
- `activity_consistency_7d`
- `sleep_regularity_7d`

## Research prompts

If platform-specific research is needed, use prompts like:

### Apple Health prompt
"Map the following canonical health app metrics to Apple Health / HealthKit record or sample types: sleep_session, sleep_duration, awake_duration, steps_total, active_minutes, workout_session, heart_rate, resting_heart_rate, hrv, respiratory_rate, spo2, temperature_deviation. For each, state likely HealthKit type name, whether it is raw vs derived, common caveats, and whether it is practical for a first iPhone import. Call out HRV method differences explicitly."

### Health Connect prompt
"Map the following canonical health app metrics to Android Health Connect record types: sleep_session, sleep_duration, awake_duration, steps_total, active_minutes, workout_session, heart_rate, resting_heart_rate, hrv, respiratory_rate, spo2, temperature_deviation. For each, state likely record type, platform availability caveats, and whether it is practical for a first Android import. Call out HRV method differences explicitly."

### Cross-platform product prompt
"Given a private health app with labs as the primary hard-data lane, which smartwatch-derived metrics are strong enough for dashboard and trend use in V1, which are acceptable as contextual signals only, and which should be excluded because they rely too heavily on opaque vendor algorithms? Focus on Apple Health and Health Connect compatible data."
