---
status: current
owner: repo
last_verified: 2026-04-20
---

# Mock Data Migration — app_install_id

## What happened

`WearableSyncScreen` previously used a hardcoded `MOCK_APP_INSTALL_ID = 'dev-install-001'`.
This value was written to `wearable_sources.app_install_id` during initial development.

As of this PR, `app_install_id` is now sourced from the real device via `appInstallId.ts`.

## Migration steps (one-time, manual)

If `wearable_sources` contains rows with `app_install_id = 'dev-install-001'`
(or any value matching the `isLegacyMockInstallId` check),
update them after the real ID is known:

```sql
-- Run in Supabase Dashboard after first real app launch
-- Replace 'android-XXXXXXXXXXXXXXXX' with the real ID from device logs
UPDATE wearable_sources
SET app_install_id = 'android-XXXXXXXXXXXXXXXX'
WHERE app_install_id = 'dev-install-001';
```

The real ID is logged to the console on first launch (`[appInstallId] resolved: ...`).
For private-use V1 with 1–2 users, a manual SQL update is sufficient.

## Detection helper

`isLegacyMockInstallId(id)` in `apps/mobile/appInstallId.ts` can detect
stale mock IDs at runtime and guard sync calls.

## Future

If more users are added: add a `reprovisionIfLegacy()` call in the
provisioning flow that auto-migrates on first launch with the new code.
