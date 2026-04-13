# wearables-sync

Edge Function — Wearables Import Seam V1

## Purpose

Accepts a batch of raw wearable observations from the mobile app (Apple Health or Android Health Connect) and writes them to `wearable_observations` with full deduplication.

This is the only authorized write path for wearable data.

## Auth

Requires a valid Supabase JWT in the `Authorization` header.
The function verifies that the `wearable_source_id` in the request belongs to the authenticated user.

## Endpoint

```
POST /functions/v1/wearables-sync
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

## Request shape

See `example-request.json` and `src/lib/wearables/syncContract.ts` (`WearableSyncRequest`).

### Dedup key

`(wearable_source_id, metric_key, source_record_id)` — unique constraint on `wearable_observations`.

Mobile must always pass the platform-native record ID as `source_record_id`. Never generate a synthetic ID.

### HRV rule

`measurement_method` is **required** for `hrv` observations and must be `'sdnn'` or `'rmssd'`.
`'unknown'` is rejected for new observations.

### Session metrics

`sleep_session` and `workout_session` require `observation_end_at`.

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
