# CHECKPOINT.md

## Verdict

The One L1fe repo now has a working minimum-slice domain-to-repository persistence seam, with idempotent re-run coverage around the Supabase write path.

## Current state

- Branch: `main`
- Working tree at session start: clean
- Source of truth repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- Latest completed seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence -> supabaseRepository`
- Verified recently: `npm run typecheck`, `npm run test:domain`

## Current next step

Choose the next backend execution seam: either expose the repository path through a real Supabase edge function or add a live server-side Supabase client integration that calls the repository directly.

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
