# wearables-sync

Edge Function — Wearables Import Seam V1

## Purpose

Accepts a batch of raw wearable observations from the mobile app (Apple Health or Android Health Connect) and writes them to `wearable_observations` with full deduplication.

This is the only authorized write path for wearable data.

## Auth

Requires a valid Supabase JWT in the `Authorization` header.
The function verifies that the `wearable_source_id` in the request belongs to the authenticated user.
Inactive `wearable_sources` are rejected and must be reactivated before syncing.

## Endpoint

```
POST /functions/v1/wearables-sync
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

## Request shape

See:
- `example-request.json` for the current Apple Health example
- `examples/garmin-health-connect-day1.json`
- `examples/garmin-health-connect-day2.json`
- `examples/garmin-health-connect-day3.json`
- `src/lib/wearables/syncContract.ts` (`WearableSyncRequest`)

### Dedup key

`(wearable_source_id, metric_key, source_record_id)` — unique constraint on `wearable_observations`.

Mobile must always pass the platform-native record ID as `source_record_id`. Never generate a synthetic ID.

### HRV rule

`measurement_method` is **required** for `hrv` observations and must be `'sdnn'` or `'rmssd'`.
`'unknown'` is rejected for new observations.
Do not merge or trend SDNN and RMSSD together.

### Session metrics

`sleep_session` and `workout_session` require `observation_end_at`.

### Garmin-first device-free prep note

Current contract caveats:
- `platform` currently accepts `apple_health` or `health_connect` only.
- Garmin-first mocks in `examples/` therefore model the near-term path as Garmin-originated data arriving through a `health_connect`-compatible ingest shape, not as a separate `platform = garmin` contract yet.
- request payloads do **not** currently accept client-written `source_confidence` or `vendor_signal_class`; preserve extra source hints inside `source_payload` until the server-side mapping becomes explicit.
- `steps_total` may safely leave `measurement_method = null`; HRV may not.

## Response shape

See `src/lib/wearables/syncContract.ts` (`WearableSyncResponse`).

```json
{
  "sync_run_id": "<uuid>",
  "status": "success",
  "records_seen": 3,
  "records_inserted": 3,
  "records_updated": 0,
  "next_cursor": "2026-04-14T00:25:00.000Z",
  "error_summary": null
}
```

## Batch limits

Max 5000 observations per request. Observations are upserted in chunks of 500.

## What this function does NOT do

- Does not compute `wearable_daily_summaries` — that is a separate async job.
- Does not validate metric values beyond structural shape.
- Does not normalize SDNN vs RMSSD — that is a query-time or summary-time concern.

## Local test

```bash
supabase functions serve wearables-sync --env-file .env.local

curl -i -X POST http://localhost:54321/functions/v1/wearables-sync \
  -H 'Authorization: Bearer <your-local-jwt>' \
  -H 'Content-Type: application/json' \
  -d @supabase/functions/wearables-sync/example-request.json
```

Garmin-first mock example:

```bash
curl -i -X POST http://localhost:54321/functions/v1/wearables-sync \
  -H 'Authorization: Bearer <your-local-jwt>' \
  -H 'Content-Type: application/json' \
  -d @supabase/functions/wearables-sync/examples/garmin-health-connect-day1.json
```
