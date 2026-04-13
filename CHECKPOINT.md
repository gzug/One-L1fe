---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

The One L1fe hosted backend path is fully operational and enforced. The minimum-slice edge function is deployed, authenticated, and confirmed end-to-end with a 200 smoke call that wrote all rows. The database is clean, hardened, and drift-free. GitHub CI enforcement is active, nothing merges to `main` without passing `validate`. On top of that, the repo now has a thin Expo mobile scaffold for the minimum-slice seam and a first explicit memory and OpenClaw operations layer for safer session continuity.

## Current state

- Branch: `main`
- Working tree: in progress, with the hosted backend seam green, GitHub enforcement live, the thin Expo mobile seam scaffolded, and real app auth wiring still using environment placeholders rather than a real app session source
- Source of truth repo: `gzug/One-L1fe-repo`
- Latest completed product seam: `minimumSlice -> contracts -> supabasePayload -> supabasePersistence -> supabaseRepository -> supabase edge function -> shared function contract -> local smoke-test helper -> thin app-facing function client wrapper -> HTTP transport adapter -> mobile form-to-panel adapter -> mobile submission-state wrapper -> result summary helper -> stricter timestamp and transport validation -> broader negative-path assertions -> compact submission-state summary helper -> cross-runtime-safe shared imports -> repeatable authenticated local smoke pass -> hosted hardening confirmation -> thin app-side minimum-slice screen model -> hosted config and auth-session controller seam -> hosted function deployed and smoke-verified end-to-end -> Expo app scaffold with one narrow minimum-slice screen`
- Latest completed repo-ops seam: `.github templates -> CODEOWNERS -> CI -> contributing rules -> docs navigation -> Supabase backend operating model -> local Supabase replay workflow scaffold -> deploy script + vendoring strategy confirmed -> GitHub secrets live -> branch protection enforced -> OpenClaw ops guide -> short-term memory layer -> data-handling policy -> lightweight metadata groundwork`
- Hosted confirmations as of 2026-04-13:
  - Security advisor: clean (0 findings) ✅
  - Migration history: 5 migrations applied in order, matches repo exactly ✅
  - RLS: all user-owned tables hardened, overlapping policies consolidated, `(select auth.uid())` in use ✅
  - Backend hardening migration: live ✅
  - Drift: none detectable ✅
  - Edge function `save-minimum-slice-interpretation`: deployed (version 2, ACTIVE), JWT enforcement on ✅
  - Hosted smoke call: HTTP 200, 6 interpreted entries, 6 recommendations, coverageState complete ✅
- GitHub enforcement as of 2026-04-13:
  - `SUPABASE_ACCESS_TOKEN`: live ✅
  - `SUPABASE_PROJECT_REF`: live (`lbqgjourpsodqglputkj`) ✅
  - Branch protection on `main`: active ✅
  - Required check `validate` (typecheck + domain tests): enforced before every merge ✅
  - Force pushes to `main`: blocked ✅
- Deploy strategy confirmed: domain files vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`; `_lib/` is gitignored; source of truth stays in `packages/domain/`
- Open: PR #1 (backend hardening), migration is already live in production; merge or close cleanly, do not re-apply

## Current next step

The next best steps are, in order:
1. wire a real app auth session into `apps/mobile/minimumSliceScreenController.ts` and validate one authenticated Expo submission against the hosted endpoint,
2. decide whether the next thin app seam is a dedicated hook extraction or a second screen around the same controller,
3. activate `supabase db lint` as the next CI check, since secrets and branch protection are now confirmed live,
4. add boot/reset CI validation (`supabase start` + `supabase db reset`) after lint is stable,
5. add drift detection CI only after boot/reset is stable,
6. merge or close PR #1 cleanly,
7. then keep product work moving on the next app seam rather than more backend invention.

## Startup rule

For fresh sessions, start here.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance / evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` only for broad repo orientation.
- `supabase/README.md` for Supabase workflow, CI commands, secrets, and deploy procedure.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
