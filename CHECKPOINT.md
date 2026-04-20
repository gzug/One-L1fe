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

Minimum-slice mobile seam proven live end to end. Field-state contract complete through `stale` derived-policy layer. Wearable backend seam hosted-proof complete, first app-side wearable sync UI merged on `main`. Evidence registry schema + seeds live (9 sources, 15 rules including Vitamin D + Ferritin). In-app developer insight interface merged (PR #91). Sideload distribution path documented (PR #86).

Remaining gaps: native Android Health Connect wiring, replacement of `MOCK_APP_INSTALL_ID`, first real device-backed ingest proof, evidence-registry runtime wiring into Priority Score.

## Current state

- Branch: `main` at `10be67f`
- Active seam: real device-backed wearable ingest proof + native Android completion

## Pending PRs (awaiting merge)

- `claude/real-app-install-id` — replaces `MOCK_APP_INSTALL_ID` with persistent AsyncStorage-backed UUID (`apps/mobile/appInstallIdentity.ts`)

## Blockers

- No physical Garmin / Health Connect data source proof yet
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo (Expo managed project — config plugin preferred)
- `WearableSyncScreen.tsx` uses `MOCK_APP_INSTALL_ID` (`'dev-install-001'`) — PR `claude/real-app-install-id` pending merge
- Branch protection for `main` needs explicit verification/enforcement

## Next steps

1. **Merge pending PR** — `claude/real-app-install-id` via browser
2. **Expo config plugin for Health Connect** — design `apps/mobile/plugins/health-connect-config-plugin.js` injecting MainActivity.kt + AndroidManifest.xml lines during prebuild (survives `expo prebuild --clean`)
3. **First real Health Connect ingest proof** — apply config plugin, install APK on Android device, request permissions, pass real observations through to `wearables-sync`
4. **Wire evidence registry into Priority Score** — `rule_evidence_links` not read at calculation time; must wire before any external claim or distribution scope change
5. **Ferritin evaluation slice** — design `evaluateFerritin()` cutoffs + context gates, promote CTX-002 from draft to active
6. **Clean follow-ups** — verify branch protection, address `as any` cleanup in test fixtures if warranted
