# compute-daily-summaries

Edge function that materialises per-day aggregates from `wearable_observations` into `wearable_daily_summaries`.

## When to call

Call this function **after** a successful `wearables-sync` call, passing the same `wearable_source_id` and the date range that was just synced.

The function is idempotent — it is safe to re-run for the same source and date range.

## Request

```json
{
  "wearable_source_id": "<uuid>",
  "date_from": "2026-04-14",
  "date_to": "2026-04-14"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `wearable_source_id` | UUID string | ✅ | Must belong to the authenticated user |
| `date_from` | YYYY-MM-DD | ❌ | Defaults to today (UTC) |
| `date_to` | YYYY-MM-DD | ❌ | Defaults to `date_from`; max 31-day window |

## Response

```json
{
  "wearable_source_id": "<uuid>",
  "date_from": "2026-04-14",
  "date_to": "2026-04-14",
  "summaries_written": 5,
  "computation_version": "v1",
  "error_summary": null
}
```

## Error codes

| `error` field | HTTP | Meaning |
|---|---|---|
| `MISSING_AUTH` | 401 | No `Authorization` header |
| `UNAUTHORIZED` | 401 | Invalid or expired JWT |
| `INVALID_REQUEST` | 400 | Validation failed — see `message` |
| `COMPUTE_ERROR` | 500 | Aggregation or DB error |
| `SERVER_MISCONFIGURED` | 500 | Missing env vars |

## v1 scope

- Only processes `aggregation_level = 'day'` observations.
- `summary_source_scope` is always `single_source` — no cross-source merging.
- One summary row per `(profile_id, wearable_source_id, summary_date, summary_key)`.
- Multiple observations for the same `(date, metric_key)` are averaged; `quality_flag` is set to `partial`.
- `summary_timezone` is hardcoded to `UTC` in v1 — per-source timezone handling is a v2 item.

## Out of scope (v1)

- `merged` scope across multiple sources
- `sample` or `session` aggregation_level inputs
- Derived metrics spanning multiple metric_keys
- pg_cron auto-trigger (manual call after sync for now)
