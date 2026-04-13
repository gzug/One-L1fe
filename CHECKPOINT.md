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

Mobile auth blocker resolved. The Expo app now uses a real Supabase session (email/password sign-in via `mobileSupabaseAuth.ts`). The seam is: LoginScreen -> Supabase Auth -> `createMobileSupabaseAuthSessionProvider` -> `minimumSliceScreenController` -> hosted edge function.

## Current state

- Branch: `main`
- Active seam: hosted minimum-slice backend live, Expo mobile seam with real Supabase auth wired
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - first real authenticated Expo submit against hosted endpoint not yet verified live
- Key confirmed facts:
  - hosted migrations match repo
  - RLS and policies are live
  - `save-minimum-slice-interpretation` is deployed with JWT enforcement
  - one authenticated hosted smoke call returned HTTP 200 with writes succeeding end to end
  - the repo now includes `memory/`, `docs/ops/`, a data-handling policy, and lightweight metadata files
  - `mobileSupabaseAuth.ts` added: thin Supabase client adapter using `auth.getSession()`
  - `LoginScreen.tsx` added: minimal email/password UI, delegates to Supabase client
  - `App.tsx`: auth state machine (`loading -> signed-out -> signed-in`), listens to `onAuthStateChange`
  - placeholder env vars (`EXPO_PUBLIC_ONE_L1FE_ACCESS_TOKEN`, `EXPO_PUBLIC_ONE_L1FE_PROFILE_ID`) removed
- Deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`, while source of truth stays in `packages/domain/`

## Current next step

The next best steps are, in order:
1. **Run first live authenticated Expo submit**: set `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY` in `.env`, start the app, sign in with a real user, submit the minimum-slice form, verify HTTP 200 + DB write under the correct `profileId`,
2. decide whether the next thin app seam is a dedicated hook extraction (`useAuthSession`) or a second screen around the same controller,
3. activate `supabase db lint` as the next CI check,
4. add boot/reset CI validation (`supabase start` + `supabase db reset`) after lint is stable,
5. add drift detection CI only after boot/reset is stable,
6. merge or close PR #1 cleanly.

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

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
