# CHECKPOINT.md

## Verdict

The One L1fe repo is past pure planning and now has a working domain-to-persistence bridge for the V1 minimum slice.

## Current state

- Branch: `main`
- Working tree at session start: clean
- Source of truth repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- Latest completed seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence`
- Verified recently: `npm run typecheck`, `npm run test:domain`

## Current next step

Wire the new persistence adapter into a real Supabase repository or edge-function path, then add idempotent re-run coverage.

## Startup rule

For fresh sessions, start here.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance / evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` only for broad repo orientation.

## Guardrails

- Keep wellness boundary explicit.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
