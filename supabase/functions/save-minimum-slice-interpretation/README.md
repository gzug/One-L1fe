# save-minimum-slice-interpretation

Authenticated Supabase edge function that:
- accepts a minimum-slice panel payload,
- injects `profileId` from the caller's auth session,
- runs the shared domain evaluator,
- and persists `interpretation_runs`, `interpreted_entries`, and `recommendations` through the shared repository seam.

## Request

`POST`

```json
{
  "panel": {
    "panelId": "panel_demo_1",
    "collectedAt": "2026-04-10T08:00:00.000Z",
    "source": "manual",
    "entries": [
      { "marker": "apob", "value": 118, "unit": "mg/dL" },
      { "marker": "ldl", "value": 152, "unit": "mg/dL" },
      { "marker": "hba1c", "value": 5.8, "unit": "%" }
    ]
  },
  "persistence": {
    "labResultId": "11111111-1111-1111-1111-111111111111",
    "interpretedEntryLabResultEntryIds": {
      "apob": "22222222-2222-2222-2222-222222222222",
      "ldl": "33333333-3333-3333-3333-333333333333"
    },
    "derivedInsightId": "44444444-4444-4444-4444-444444444444",
    "auditTraceId": "trace_demo_1"
  },
  "execution": {
    "now": "2026-04-13T02:50:00.000Z",
    "createdAt": "2026-04-13T02:50:00.000Z"
  }
}
```

## Local exercise

Example payload:
- `supabase/functions/save-minimum-slice-interpretation/example-request.json`

Typical local flow:
1. start Supabase locally,
2. invoke the function with an authenticated bearer token so RLS and `auth.uid()` resolve normally.

Auth-backed smoke test helper:

```bash
SUPABASE_ANON_KEY=... npm run smoke:function:minimum-slice
```

## Hosted deploy

This function cannot import shared files from `../../../packages/domain/` at deploy time because Supabase bundles each function inside its own boundary.

Before deployment, vendor the required shared domain files into this function's local `_lib/domain/` directory:

```bash
npm run prepare:function:minimum-slice
```

Then deploy with:

```bash
SUPABASE_PROJECT_REF=your-project-ref npm run deploy:function:minimum-slice
```

The deploy script keeps `packages/domain/` as the source of truth and stages a deploy-local copy for the function bundle.

The smoke-test script:
- signs up a local test user,
- falls back to password sign-in on repeat runs when the user already exists,
- creates the matching `profiles` row through the REST API under that user token,
- calls the function with the example payload,
- and fails if the function does not return persistence ids.

## Notes

- The function ignores any caller-supplied profile id and uses the authenticated user id.
- Writes run through normal RLS using the caller's auth token.
- Repeated calls with the same panel and rule version reuse the same external ids, so the shared persistence path upserts in place rather than duplicating rows.
