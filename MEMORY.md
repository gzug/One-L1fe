---
status: current
canonical_for: durable project assumptions
owner: repo
last_verified: 2026-04-14
supersedes: []
superseded_by: null
scope: repo
---

# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

---

## Durable product boundary

- One L1fe is not a diagnostic or treatment system.
- It should be framed as a health data, biomarker, and interpretation product, not as a "wellness" product.
- Recommendations must stay bounded, uncertainty-aware, and within the intended-use boundary defined canonically in `docs/compliance/intended-use.md`.
- Severity, coverage, freshness, and recommendation eligibility must stay distinct.

## Durable architecture posture

- Keep Notion out of hidden runtime logic.
- Keep core health/domain logic in shared domain/backend code.
- Keep ApoB primary and LDL fallback/secondary.
- Keep weak/contextual markers out of the hard core score unless clearly justified.
- Keep the Priority Score framed as a bounded prioritization aid, not a clinical risk score.
- Keep shared domain imports cross-runtime safe when the same files must run under both Node-based tests and Supabase Edge Functions.
- For the first real mobile app seam, use Expo scaffolding first and avoid `expo-router` until there is a concrete navigation need.
- The Expo scaffold under `apps/mobile/` uses a real Supabase auth session through `mobileSupabaseAuth.ts`, with `AsyncStorage` for session persistence and `getFreshAccessToken()` as the canonical token path.
- Keep the mobile auth/session architecture thin and explicit: `useAuthSession.ts` owns auth-state subscription, `LoginScreen.tsx` owns sign-in UI, `MinimumSliceScreen.tsx` owns the signed-in minimum-slice form, and `App.tsx` stays a small auth-gate shell that wires those pieces together.
- For wearables, keep daily summaries explicit about source scope and timezone semantics, and keep context notes minimally structured with tags (GIN-indexed) instead of free text only.
- Profile rows are NOT auto-created on auth signup. No `on auth.user created` trigger exists. Profile insertion must be explicit for new users and smoke-test users.

## Durable repo operations posture

- `README.md` is the project entry point.
- `CHECKPOINT.md` is the current execution state and next-step source of truth.
- `MEMORY.md` stores only durable assumptions and decisions.
- `memory/` stores short-term working notes and daily continuity, not durable truth.
- `main` should stay the stable branch, with short-lived branches for focused changes.
- Keep lightweight GitHub hygiene in place: templates, CODEOWNERS, and CI for typecheck plus domain tests.
- Do not let generated docs or AI-assisted code drift away from the actual implemented path.
- Treat local Supabase replay plus authenticated smoke-test success as the required backend baseline before claiming the edge-function seam works.
- Do not treat a local-only Supabase function as a hosted-ready backend seam.
- The minimum-slice hosted backend seam is green only when all are true: hosted migrations match repo, RLS/policies are live, the function is deployed, and an authenticated hosted smoke call returns 200 with writes succeeding.
- Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
- Use `docs/ops/openclaw.md` as the canonical OpenClaw operating guide.
- **Every migration applied to hosted Supabase MUST be committed to `supabase/migrations/` before the session closes.** Supabase-only migrations create drift that survives until a reset or new developer onboarding.
- `entrypoint_path` in a deployed Edge Function must NOT point to a local machine path. A local path means the deploy was manual and not reproducible from CI.

## Startup rule

This file stores durable project memory only.
Use `CHECKPOINT.md` for fresh-session startup and current execution state.
Store detailed chronological history under `docs/roadmap/checkpoints/`, not here.

## History archive

Older detailed memory was archived to:
- `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
