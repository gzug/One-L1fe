# SESSION-START.md

## Source of truth

- Repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- The nested repo is the product source of truth.
- The workspace `MEMORY.md` is only the routing bridge.

## Fresh-session rule

Start with `CHECKPOINT.md`.
Do not auto-read repo `MEMORY.md`, `GLOSSARY.md`, or `README.md` unless the task actually needs them.

## Read-on-demand

- `docs/compliance/intended-use.md` for health-adjacent copy, recommendation wording, or compliance boundaries
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` for provenance / evidence logic work
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` for planning the next implementation seam
- `MEMORY.md` for deeper history only
- `GLOSSARY.md` when terms are unclear
- `README.md` for broad orientation only

## Current operating direction

- Keep Notion out of hidden runtime logic.
- Keep Priority Score bounded and non-clinical.
- Keep severity separate from coverage.
- Keep ApoB primary and LDL fallback/secondary.
- Keep weak/contextual markers out of the hard core score unless clearly justified.

## Current next focus

- Wire the persistence adapter into a real Supabase repository or edge-function path.
- Then add idempotent re-run coverage.
