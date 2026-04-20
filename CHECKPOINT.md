---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-20
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Minimum-slice mobile seam proven live end to end. Field-state contract complete through `stale` derived-policy layer. Wearable backend seam hosted-proof complete, first app-side wearable sync UI merged on `main`. Evidence registry schema + seeds live (9 sources, 15 rules). Vitamin D + Ferritin evidence seeds added (migration `20260420091500`).

Remaining gaps: native Android Health Connect wiring, replacement of `MOCK_APP_INSTALL_ID`, first real device-backed ingest proof.

## Current state

- Branch: `claude/evidence-registry-vitamind-ferritin` at `9f3818c`
- Active seam: real device-backed wearable ingest proof + native Android completion

## Pending PRs (awaiting merge)

- `claude/real-app-install-id` — replaces `MOCK_APP_INSTALL_ID` with real device identity
- `claude/evidence-registry-vitamind-ferritin` — Vitamin D + Ferritin evidence seeds (migration `20260420091500`)

## Blockers

- No physical Garmin / Health Connect data source proof yet
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo
- `WearableSyncScreen.tsx` uses temporary `MOCK_APP_INSTALL_ID` (`'dev-install-001'`) — PR `claude/real-app-install-id` pending merge
- Branch protection for `main` needs explicit verification/enforcement
- **GitHub MCP disconnected** — PR creation requires manual browser action until reconnected

## Next steps

1. **Merge pending PRs** — `claude/real-app-install-id` + `claude/evidence-registry-vitamind-ferritin` via browser
2. **Native Android Health Connect** — apply `MainActivity.kt` + `AndroidManifest.xml` from `apps/mobile/docs/health-connect-native-setup.md`
3. **First real Health Connect ingest proof** — provision real identity, request permissions, pass real observations
4. **Wire evidence registry to Priority Score** — `rule_evidence_links` not yet read at calculation time; must wire before any external claim
5. **Verify physical Garmin path** — confirm end-to-end once hardware available
6. **Clean follow-ups** — verify branch protection, address `as any` typed cleanup
