# CHECKPOINT.md

## Verdict

The One L1fe repo now has a real authenticated Supabase edge-function path in-repo and in hosted Supabase, a confirmed clean hosted database baseline, a shared tested request-contract parser, a practical and repeatable local and hosted smoke-test path for the minimum-slice backend seam, a first real GitHub/repo-hygiene foundation around that code, and the start of a real thin app-side submission model for the minimum-slice flow.

## Current state

- Branch: `main`
- Working tree currently: in progress, with the backend seam green and the mobile controller seam underway
- Source of truth repo: `/Users/ufo/.openclaw/workspace/gzug/One-L1fe-repo`
- Latest completed product seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence -> supabaseRepository -> supabase edge function -> shared function contract -> local smoke-test helper -> thin app-facing function client wrapper -> HTTP transport adapter -> mobile form-to-panel adapter -> mobile submission-state wrapper -> result summary helper -> stricter timestamp and transport validation -> broader negative-path assertions -> compact submission-state summary helper -> cross-runtime-safe shared imports -> repeatable authenticated local smoke pass -> hosted hardening confirmation -> thin app-side minimum-slice screen model -> hosted config and auth-session controller seam`
- Latest completed repo-ops seam: `.github templates -> CODEOWNERS -> CI -> contributing rules -> docs navigation -> Supabase backend operating model -> local Supabase replay workflow scaffold`
- Latest repo fix completed in-session: `supabase/config.toml` seed path now matches `supabase/seed/*.sql`, the obsolete `supabase/migrations/.gitkeep` warning source is gone, local replay seeds from the intended file path cleanly, and the edge-function boot path now works with explicit `.ts` shared-domain imports
- Hosted confirmation reported: security advisor clean, 5 migrations applied in order, hardening migration live, no drift detectable from the advisor layer, PR #1 safe to merge
- Hosted confirmation reported after follow-up: all tables have RLS enabled with the expected policies, hosted migration history exactly matches repo, `save-minimum-slice-interpretation` is deployed, and one authenticated hosted smoke call returned 200 with full writes succeeding end to end
- Current repo-side deployment fix completed: shared domain files are vendored into `supabase/functions/save-minimum-slice-interpretation/_lib/domain` at deploy time so the Supabase function bundle stays self-contained without forking the domain source of truth
- Hard blockers outside the repo: GitHub Action secrets and branch protection are still not verified live from this environment because GitHub CLI is not authenticated here
- Verified recently: `npm run typecheck`, `npm run test:domain`, `bash -n scripts/smoke-test-save-minimum-slice-function.sh`, `supabase start`, `supabase db reset`, `supabase stop --no-backup`, `npm run smoke:function:minimum-slice`

## Current next step

The next best steps are, in order:
1. complete the first real mobile screen or hook around `apps/mobile/minimumSliceScreenModel.ts` and point it at the hosted endpoint,
2. wire a real app auth session source into `apps/mobile/minimumSliceScreenController.ts`,
3. finish GitHub-side enforcement for the new workflow, especially secrets and branch protection,
4. activate the next Supabase CI checks once secrets exist,
5. if a direct hosted CLI path becomes available here, run one authenticated lint and drift-baseline pass to independently verify the hosted result,
6. then keep product work moving on the next app seam rather than more backend invention.

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
