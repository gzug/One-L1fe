---
status: current
canonical_for: wearables scope and ingestion posture
owner: repo
last_verified: 2026-04-22
supersedes: []
superseded_by: null
scope: planning
---

# Wearables hard facts and automation

## Verdict

Wearables should be added as a separate raw-data stream, not folded into the lab schema and not treated as equally trustworthy across all metrics.

The realistic near-term posture is:
1. keep labs as the first hard clinical data path,
2. add a bounded wearables layer for high-confidence activity and sleep signals,
3. store provenance and confidence explicitly,
4. avoid pretending consumer-watch outputs are medical-grade when they are not.

## Why this matters

The old Notion-shaped workspace clearly included non-lab context such as:
- exercise baseline,
- sleep baseline,
- weekly check-ins,
- context notes like unusual training load or sleep disruption.

That means wearables are not outside the product shape.
They are part of the intended whole-system picture.
But they are a different data class from labs and should be modeled that way.

## Recommended data classes

### 1. Hard fact, device-measured, high confidence
These are the strongest smartwatch-derived candidates.

Examples:
- steps
- distance walked or run
- active minutes / exercise minutes
- workout sessions with start and end time
- heart rate samples
- resting heart rate
- sleep start and end times
- total sleep duration
- awake episodes during sleep when provided by source platform
- HRV when captured consistently by the source platform
- blood oxygen samples if available, but with device/source caveat
- skin temperature deviation if exposed by platform
- calories burned as recorded output, but usually lower-confidence analytically than the raw movement/time signals

Recommended posture:
- store as observed measurements,
- keep source platform and device provenance,
- do not over-interpret them clinically by default.

### 2. Derived but still fairly factual summaries
These are aggregations over raw device measurements.

Examples:
- daily step total
- daily sleep duration
- sleep efficiency estimate
- weekly training load proxy
- 7-day resting heart rate average
- 7-day HRV average
- activity consistency score
- sleep regularity score

Recommended posture:
- compute from raw data where possible,
- keep aggregation method versioned,
- make clear that these are product summaries, not vendor truth.

### 3. Soft fact or context-supported data
These are still useful, but need careful labeling.

Examples:
- perceived stress
- readiness
- recovery score
- energy level
- mood
- sleep quality self-rating
- illness flags
- jet lag / travel disruption
- soreness
- unusual workload

Recommended posture:
- store separately from raw device measurements,
- label as self-report or product-derived context,
- do not mix them with device observations as if they were the same evidence class.

### 4. Low-confidence or vendor-black-box signals
These can still be useful operationally, but should not become hard engine truth too early.

Examples:
- vendor readiness score
- vendor body battery / recovery score
- stress score from closed algorithms
- sleep stage percentages from consumer devices
- estimated VO2 max from opaque vendor pipelines
- irregular rhythm alerts unless carefully handled

Recommended posture:
- ingest only if there is a strong user value case,
- keep raw vendor label and source intact,
- do not build core recommendation logic on top of them early.

## What likely falls under sleep and activity

### Sleep
Potential measurable fields:
- sleep session start
- sleep session end
- total sleep duration
- time in bed
- awake duration
- sleep interruptions count
- resting heart rate during sleep
- overnight HRV summary
- overnight respiratory rate if available
- overnight SpO2 if available
- skin temperature deviation if available

Good near-term hard facts:
- start/end,
- duration,
- consistency/regularity,
- overnight resting HR and HRV trends.

Use more cautiously:
- sleep stages,
- readiness/recovery outputs,
- generalized sleep quality scores from vendor black boxes.

### Activity and training
Potential measurable fields:
- steps
- distance
- floors climbed
- active energy
- total energy
- active minutes
- workout type
- workout duration
- workout heart-rate trace
- pace / speed where available
- cadence where available
- elevation gain where available
- zone minutes if computed by us or source platform

Good near-term hard facts:
- step totals,
- active minutes,
- workout sessions,
- heart-rate traces,
- weekly volume and consistency.

Use more cautiously:
- calories,
- training readiness,
- proprietary training load or strain scores.

### Recovery / physiology
Potential measurable fields:
- resting heart rate
- HRV
- respiratory rate
- skin temperature deviation
- SpO2
- weight if synced from another device

Good near-term hard facts:
- resting HR trend,
- HRV trend if same source/device,
- temperature deviation trend when source is stable.

Use more cautiously:
- single-point conclusions,
- cross-device comparisons without normalization.

## Realistic automation answer

Yes, automation is realistic.
But the right answer is usually not "watch directly to our database" as the first move.

The practical path is:
1. watch -> Apple Health / HealthKit or Google Health Connect,
2. mobile app reads permitted records,
3. app normalizes them into a stable internal schema,
4. app sends them to Supabase,
5. backend stores raw observations and optional aggregates separately.

Clarifier: in the near-term Android path, Garmin-originated data should be assumed to arrive via Health Connect mediation where available, not via a direct Garmin API integration in V1.

## Recommended ingestion architecture

```text
Smartwatch / wearable
  -> platform health store (Apple Health / Health Connect)
  -> One L1fe mobile sync layer
  -> Supabase raw wearable tables
  -> aggregation / interpretation layer
  -> app review surfaces
```

## Why this is the right first architecture

Because direct vendor integrations are usually messier than they look:
- each vendor has different APIs and limits,
- some do not expose all raw data cleanly,
- platform health stores already unify a lot,
- user permissions are easier to manage on-device,
- and the mobile app is the natural place to request consent and run local sync.

## What is realistic in practice

### Very realistic in a first implementation
- Apple Health import on iPhone for sleep, steps, heart rate, resting heart rate, HRV, workouts
- Android Health Connect import for similar categories where available
- periodic foreground sync when app opens
- manual "sync now" action
- daily rollups and trend views in backend

### Realistic but more work
- background sync
- conflict handling across multiple devices
- deduplication across vendor and platform records
- fine-grained provenance per sample
- raw sample plus aggregate dual-write model

### Possible but should not be first
- direct Garmin, Oura, Whoop, Fitbit vendor integrations
- full historical backfills from multiple ecosystems at once
- recommendation engine logic heavily dependent on opaque vendor scores

## Recommended schema direction

Do not squeeze wearables into `lab_results` or `lab_result_entries`.

Instead add a separate layer such as:
- `wearable_sources`
- `wearable_observations`
- `wearable_daily_summaries`
- `weekly_checkins` or `self_report_entries`
- `context_notes`

Suggested shape:

### `wearable_observations`
Purpose:
- raw or near-raw time-series observations from device/platform feeds.

Likely fields:
- id
- profile_id
- source_platform (`apple_health`, `health_connect`, `garmin`, `oura`, etc.)
- source_device_id or source_device_label
- metric_key (`steps`, `heart_rate`, `hrv_rmssd`, `sleep_duration`, etc.)
- value_numeric
- unit
- observed_at
- observation_end_at nullable
- aggregation_level (`sample`, `session`, `day`)
- source_record_id
- source_payload_ref or raw payload hash if needed
- confidence_class
- created_at

### `wearable_daily_summaries`
Purpose:
- stable app-facing daily rollups.

Likely fields:
- id
- profile_id
- date
- summary_key (`steps_total`, `sleep_duration_total`, `resting_hr_daily`, etc.)
- value_numeric
- unit
- computation_version
- source_mix_summary
- created_at

### `weekly_checkins`
Purpose:
- keep the subjective and intentional layer separate.

Likely fields:
- id
- profile_id
- week_date
- exercise_self_rating
- sleep_self_rating
- nutrition_self_rating
- emotional_health_self_rating
- bottleneck
- biggest_risk
- intended_action
- summary

### `context_notes`
Purpose:
- keep non-measurement explanations queryable.

Likely fields:
- id
- profile_id
- context_type
- started_at nullable
- ended_at nullable
- summary
- details
- relevance_level

## Product recommendation

Near term:
- keep labs as the first hard interpretation engine,
- add wearables as a second raw-data lane,
- use wearables first for dashboards, trends, and context,
- only then selectively promote a few wearable signals into rule logic.

Best first wearable candidates for rule-level use later:
- 7-day resting heart rate trend,
- 7-day HRV trend from same source,
- sleep duration trend,
- activity consistency,
- recent workout load context.

## Main risk

The main mistake would be treating all wearable outputs as equally objective.
They are not.

The model should distinguish:
- lab-measured biomarker facts,
- device-observed behavioral and physiological signals,
- self-reported context,
- vendor-black-box scores.

That separation will matter a lot for trust and future interpretation quality.

## Recommended next step

If wearables become active scope soon, the next concrete design step should be:
1. define canonical wearable metric keys,
2. define confidence classes and provenance rules,
3. add a minimal raw observation schema,
4. support Apple Health / Health Connect first,
5. keep vendor-direct integrations out of V1.
