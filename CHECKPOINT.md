# CHECKPOINT.md

## Verdict

The One L1fe repo now has a real authenticated Supabase edge-function path plus a shared, tested request-contract parser for that minimum-slice backend seam.

## Current state

- Branch: `main`
- Working tree at session start: clean
- Source of truth repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- Latest completed seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence -> supabaseRepository -> supabase edge function -> shared function contract`
- Verified recently: `npm run typecheck`, `npm run test:domain`

## Current next step

The next backend step should be auth-backed local invocation coverage or a thin app-facing client wrapper that calls the now-shared function contract cleanly.

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
