# wearable-source-resolve

Edge Function, chosen provisioning seam for owned wearable sources (V1)

## Purpose

Resolves a stable `wearable_source_id` for the authenticated profile.
If an active source already exists for the same owned source instance, the function returns it.
Otherwise it provisions a new row in `wearable_sources`.

This is the only provisioning step that should run before `wearables-sync`.

## Auth

Requires a valid Supabase JWT in the `Authorization` header.
Ownership is always anchored to the authenticated user returned by `supabase.auth.getUser()`.

## Endpoint

```
POST /functions/v1/wearable-source-resolve
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

## Request

Required:
- `source_kind` (`apple_health` | `health_connect` | `vendor_api` | `manual_import`)
- `vendor_name`
- at least one instance-level identifier: `app_install_id` or `device_hardware_id`

Optional metadata:
- `source_app_id`
- `source_app_name`
- `device_label`

### Garmin-first contract

Until a real Garmin device/app path exists, the device-free request contract should be:
- `source_kind = "vendor_api"`
- `vendor_name = "garmin"`
- `app_install_id = <stable mobile install id>`
- `source_app_id = "com.garmin.android.apps.connectmobile"` (metadata, not identity)
- `source_app_name = "Garmin Connect"`

See:
- `example-request.json` for the initial Garmin-first mock
- `example-request.hardware-backfill.json` for a later enrich call when a real hardware id exists
- `example-request.invalid-missing-instance-identity.json` for a negative-path validation case

## Response

```json
{
  "wearable_source_id": "<uuid>",
  "profile_id": "<auth.uid()>",
  "source_kind": "vendor_api",
  "vendor_name": "garmin",
  "created": true
}
```

- `created = false`: existing source resolved
- `created = true`: new source provisioned

## Ownership + matching rules

- Never returns or creates a source for a different profile.
- Does not require the client to send `profile_id`.
- Matching is done only on owned instance identifiers: `app_install_id` and `device_hardware_id`.
- `source_app_id` is connector metadata only and must not be treated as the sole identity key.
- When an existing row is matched, missing metadata fields are backfilled from the new request.

## Negative paths expected

- Missing or invalid auth returns `401`.
- Missing `app_install_id` and `device_hardware_id` returns `400`.
- Invalid `source_kind` returns `400`.
