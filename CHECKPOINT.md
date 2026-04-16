---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-17
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Minimum-slice proof cycle is complete. All live smoke tests passed. The mobile auth seam is verified end-to-end against the hosted backend. Next seam: wearable ingestion proof as the first thin wearables slice.

## Current state

- Branch: `main`
- Active seam: minimum-slice proof complete — wearable ingestion proof next
- Source of truth repo: `gzug/One-L1fe`
- Current blockers: none
- Key confirmed facts:
  - hosted migrations match repo
  - RLS and policies are live
  - `save-minimum-slice-interpretation` is deployed with JWT enforcement
  - first real authenticated Expo submit verified live: HTTP 200 + DB write under correct `profileId` ✓
  - smoke test: wrong credentials → error shown on LoginScreen ✓
  - smoke test: hosted function error → error shown in submission summary ✓
  - sign-out path verified live: app returns cleanly to LoginScreen without stale signed-in state ✓
  - backend hardening migration `20260413093000_phase0_backend_hardening.sql` on `main`
  - PR #1 (phase0 backend hardening) merged to `main` on 2026-04-13
  - wearables backend ready: `wearables-sync` Edge Function deployed, JWT-enforced, migrations live
  - wearables mobile seam: unwired — no mobile code calling `wearables-sync` yet
  - `wearable_source_id` provisioning: undocumented — must be resolved before first wearables submit
  - `mobileSupabaseAuth.ts` thin Supabase client adapter, `getFreshAccessToken()` reusable for wearables call
  - `syncContract.ts` defines full `WearableSyncRequest` / `WearableSyncResponse` shapes
  - Worker 3 prompt (bolt.new Precision Pilot) drafted, not yet pushed to repo
  - `docs/ops/hosted-expo-submit-checklist.md` still missing — low priority now that proof is done
- Deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`, while source of truth stays in `packages/domain/`

## Current next step

Wearable ingestion proof — first thin slice:

1. **Resolve `wearable_source_id` provisioning**: determine how a `wearable_sources` row gets created for a user (manual insert via Dashboard for proof run is acceptable)
2. **Write mobile API call wrapper**: `callWearablesSync(session, request: WearableSyncRequest)` in `apps/mobile/` following the `minimumSliceScreenModel.ts` pattern — uses `getFreshAccessToken()`, no new Supabase client
3. **Wire a minimal proof screen**: single hardcoded observation (e.g. one `steps_total` sample) → call wrapper → show `sync_run_id` + `records_inserted` on screen
4. **Verify live**: one authenticated wearables sync call returns HTTP 200 + row in `wearable_observations`
5. Only after proof: add cursor handling, real HealthKit/Health Connect integration, backfill mode

## Startup rule

For meaningful repo work, start with `CHECKPOINT.md`.
Read `README.md` first only when a person or agent needs broad repo orientation.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance / evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` only for broad repo orientation.
- `supabase/README.md` for Supabase workflow, CI commands, secrets, and deploy procedure.
- `src/lib/wearables/syncContract.ts` for wearables payload shapes.
- `supabase/functions/wearables-sync/README.md` for wearables endpoint contract.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
- Do not wire wearables mobile seam through a new Supabase client — always use `mobileSupabaseAuth.ts`.
