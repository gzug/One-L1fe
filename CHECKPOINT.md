---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

The app is in a testable prototype state with login, minimum-slice submit, weekly check-in, wearable sync UI, and a developer-insight surface. The wearable path is not yet fully production-safe: `WearableSyncScreen` still submits a placeholder payload and must be migrated to the canonical `WearableSyncRequest` contract before real-device rollout.

Remaining gaps: physical Garmin/Health Connect testing, end-to-end Supabase ingest proof on Android, and contract hardening on the wearable sync request path.

## Current state

- Branch: `main`, aligned with `origin/main`
- HEAD: `3e4406e47f95bdbd6e06ff69d1779e85239f3367`
- Active seam: physical-device Health Connect ingest proof + wearable sync contract hardening

## Pending PRs

- `claude/real-app-install-id` — AsyncStorage-backed persistent UUID replacing `MOCK_APP_INSTALL_ID`; intentionally held
- `#99 feat: user-configurable panel preferences` — open, draft
- `#101 feat: mobile scoring and build tooling` — open, draft

## Blockers

- No physical Garmin / Health Connect data source proof yet (WEARABLE-TD-001)
- End-to-end Supabase ingest still needs an Android device run
- Wearable sync request in app still uses placeholder payload (`as any`), not yet contract-complete

## Next steps

1. Run the new wearable collector on a physical Android device and verify one end-to-end sync into Supabase.
2. Remove placeholder wearable sync payload in `apps/mobile/WearableSyncScreen.tsx` and wire canonical `WearableSyncRequest`.
3. Merge `claude/real-app-install-id` when ready.
4. Triage draft PRs `#99` and `#101` for merge, split, or closure.

## Deferred to post-v1

- **Garmin Terra webhook** — Terra OAuth pairing + `wearable_observations` smoke-test (WEARABLE-TD-002); blocked on physical Garmin device and Terra OAuth credentials; not on critical path for sideload-to-brother milestone
