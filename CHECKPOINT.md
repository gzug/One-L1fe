---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-14
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Backend security hardening is now meaningfully deeper: wearables-sync is live end-to-end, and cross-profile FK ownership gaps have been closed with CHECK constraints and RLS policies across all security-critical tables. The outstanding product blocker is still the first real authenticated Expo submit against the hosted edge function — but the backend is now structurally safer than before.

## Current state

- Branch: `main`
- Active seam: hosted minimum-slice backend live, Expo mobile seam with real Supabase auth wired, wearables-sync import path verified
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - first real authenticated Expo submit against hosted endpoint not yet verified live
- Key confirmed facts:
  - hosted migrations match repo
  - RLS and policies are live
  - `save-minimum-slice-interpretation` is deployed with JWT enforcement
  - one authenticated hosted smoke call returned HTTP 200 with writes succeeding end to end
  - backend hardening migration `20260413093000_phase0_backend_hardening.sql` is now on `main`
  - PR #1 (phase0 backend hardening) merged to `main` on 2026-04-13
  - Supabase CI now runs linked-project lint plus local `supabase start` and `supabase db reset`
  - the repo now includes `memory/`, `docs/ops/`, a data-handling policy, and lightweight metadata files
  - `mobileSupabaseAuth.ts` is the thin Supabase client adapter using `auth.getSession()`
  - `LoginScreen.tsx` is the minimal email/password UI and delegates to the Supabase client
  - placeholder env vars (`EXPO_PUBLIC_ONE_L1FE_ACCESS_TOKEN`, `EXPO_PUBLIC_ONE_L1FE_PROFILE_ID`) were removed
  - `apps/mobile/.env.example` now matches the real auth seam (`EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` + `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY`)
  - Expo env access was normalized to direct `process.env.VAR_NAME` dot notation, removing the earlier `readEnv` helper (PR #14, #15)
  - Supabase test user exists for smoke testing: `test@one-l1fe.dev` (UID `3aa48a6f-0f7b-47d3-9875-7353064dd359`)
  - `useAuthSession.ts` now owns the thin React auth-state wrapper (`loading -> signed-out -> signed-in`) and was merged in PR #17 on 2026-04-13
  - `MinimumSliceScreen.tsx` is now the standalone minimum-slice form component and was merged in PR #19 on 2026-04-13
  - `App.tsx` is now a ~55-line pure auth-gate shell consuming `useAuthSession`, `LoginScreen.tsx`, and `MinimumSliceScreen.tsx`, merged in PR #20 on 2026-04-13
  - missing mobile Supabase env no longer hard-crashes the auth seam; the login surface stays visible with a clear config error
  - the signed-in mobile shell now includes a thin session bar with user identity and explicit sign-out, making signed-out transition testing a first-class path
  - **wearables-sync** (PR #23, merge commit `95e1fb6`, 2026-04-14): `wearables-sync` edge function is deployed with JWT enforcement; local smoke test with real JWT, profile, `wearable_source`, and `example-request.json` returned HTTP 200 with `status: success`; `COMMENT ON TYPE evidence_class` blocker was found and fixed (commit `0bf9be3`) before merge — `evidence_class` is a column-check taxonomy, not a TYPE
  - **FK-Ownership migration** (2026-04-14): CHECK constraints and RLS policies added to prevent cross-profile FK references on `interpretation_runs`, `lab_result_entries`, `derived_insights`, `recommendations`, `interpreted_entries`; all exposed FKs were listed and verified against the domain model; Supabase Security Advisories re-checked after migration — no known unresolved ownership gaps on the above tables
  - **Global / non-profile-scoped tables by design**: pure taxonomy and lookup tables (e.g. reference ranges, evidence class definitions) are intentionally not profile-scoped and carry no RLS ownership policies; this is an explicit architectural choice, not a gap
- Deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`, while source of truth stays in `packages/domain/`

## Current next step

The next best steps are, in order:
1. **Wire Daily-Summary job to the new wearables-sync import seam**: the Daily-Summary job must consume the verified wearables import path, not a synthetic or legacy path — update job trigger/config, confirm it reads from normalized wearable events, update docs
2. **Run first live authenticated Expo submit**: set `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY` in `.env`, start the app, sign in with a real user, submit the minimum-slice form, verify HTTP 200 plus DB write under the correct `profileId`
3. smoke-test the remaining main auth failure modes once in Expo: wrong credentials and hosted function error
4. verify the explicit sign-out path once in Expo and confirm the app returns cleanly to Login without stale signed-in access
5. add schema drift detection CI only after the current lint plus replay path has stayed stable across a couple of clean cycles

## Startup rule

For meaningful repo work, start with `CHECKPOINT.md`.
Read `README.md` first only when a person or agent needs broad repo orientation.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance / evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` for broad repo orientation.
- `supabase/README.md` for Supabase workflow, CI commands, secrets, and deploy procedure.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
