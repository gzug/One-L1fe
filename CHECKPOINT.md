# CHECKPOINT.md

## Verdict

The One L1fe repo now has a real authenticated Supabase edge-function path, a shared tested request-contract parser, a practical and repeatable local smoke-test helper for the minimum-slice backend seam, a first real GitHub/repo-hygiene foundation around that code, and a thin but now stricter app-integration runway for the minimum-slice flow.

## Current state

- Branch: `main`
- Working tree currently: in progress, with uncommitted repo-hygiene, docs, and app-seam changes
- Source of truth repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- Latest completed product seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence -> supabaseRepository -> supabase edge function -> shared function contract -> local smoke-test helper -> thin app-facing function client wrapper -> HTTP transport adapter -> mobile form-to-panel adapter -> mobile submission-state wrapper -> result summary helper -> stricter timestamp and transport validation -> broader negative-path assertions -> compact submission-state summary helper -> cross-runtime-safe shared imports -> repeatable authenticated local smoke pass`
- Latest completed repo-ops seam: `.github templates -> CODEOWNERS -> CI -> contributing rules -> docs navigation -> Supabase backend operating model -> local Supabase replay workflow scaffold`
- Latest repo fix completed in-session: `supabase/config.toml` seed path now matches `supabase/seed/*.sql`, the obsolete `supabase/migrations/.gitkeep` warning source is gone, local replay seeds from the intended file path cleanly, and the edge-function boot path now works with explicit `.ts` shared-domain imports
- Hard blockers outside the repo: GitHub Action secrets, branch protection, and hosted Supabase credentials for lint and drift checks
- Verified recently: `npm run typecheck`, `npm run test:domain`, `bash -n scripts/smoke-test-save-minimum-slice-function.sh`, `supabase start`, `supabase db reset`, `supabase stop --no-backup`, `npm run smoke:function:minimum-slice`

## Current next step

The next best steps are, in order:
1. finish GitHub-side enforcement for the new workflow, especially secrets and branch protection,
2. activate the next Supabase CI checks once secrets exist,
3. prune or archive clearly superseded docs,
4. then resume product implementation with a real mobile screen or hook that uses the shared mobile form adapter, submission wrapper, and result-summary helper,
5. after hosted credentials exist, run one authenticated lint and drift-baseline pass against the linked Supabase project.

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

- Keep the product boundary explicit.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
