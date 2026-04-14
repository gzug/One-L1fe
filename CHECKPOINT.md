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

Mobile auth seam is wired and functional. Backend core lane is live. Two schema layers are drifted: 2 migrations applied on Supabase are not committed to repo, and 2 repo migrations (wearables) are not applied to hosted Supabase. The first live Expo submit is still the primary unverified path.

## Current state

- Branch: `main`
- Active seam: hosted minimum-slice backend live, Expo mobile seam with real Supabase auth wired
- Source of truth repo: `gzug/One-L1fe`

## Current blockers

1. **Schema drift — Supabase-only migrations not committed to repo:**
   - `20260413225404` `fix_fk_ownership_cross_ownership_rls_guards` — applied on hosted, NOT in repo
   - `20260414024917` `fix_rls_auth_initplan_lab_result_entries_interpreted_entries` — applied on hosted, NOT in repo
   - Risk: `supabase db reset` will NOT reproduce the full hosted schema until these are committed
2. **Wearables migrations not applied on hosted Supabase:**
   - `20260413214000` `phase0_wearables_context` — committed to repo, NOT applied
   - `20260413220000` `phase0_wearables_hardening` — committed to repo, NOT applied
   - 8 wearables tables are missing on hosted project
   - Fix: `supabase db push --linked` from repo root
3. **PR #36** (mobile seam hardening) — open, not merged
4. **PR #35** (CHECKPOINT master audit) — open, not merged
5. **PR #41** (repo optimizations) — open, contains duplicate RLS migration that must be removed before merge
6. **First live Expo submit** — never performed

## Key confirmed facts

- `profiles` row for `test@one-l1fe.dev` (UID `3aa48a6f-0f7b-47d3-9875-7353064dd359`) inserted 2026-04-14
- `save-minimum-slice-interpretation` is deployed with JWT enforcement and returned HTTP 200 with writes succeeding
- RLS and policies are live for core lab lane
- `mobileSupabaseAuth.ts` is the thin Supabase client adapter using `auth.getSession()`
- `LoginScreen.tsx` is the minimal email/password UI
- `useAuthSession.ts` owns the thin React auth-state wrapper
- `MinimumSliceScreen.tsx` is the standalone minimum-slice form
- `App.tsx` is the ~55-line pure auth-gate shell
- Env keys are `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL` and `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY`
- Supabase test user: `test@one-l1fe.dev` (UID `3aa48a6f-0f7b-47d3-9875-7353064dd359`)
- PR #1 (phase0 backend hardening) merged to `main` on 2026-04-13
- Supabase CI runs linked-project lint plus local `supabase start` and `supabase db reset`
- `memory/agent-failure-patterns.md` created 2026-04-14 with 5 documented failure modes
- `AGENTS.md` updated 2026-04-14 with Verification Rules section

## Current next steps (ordered)

1. **Commit the 2 Supabase-only migrations to repo** — close schema drift before any reset or new dev onboarding
2. **Run `supabase db push --linked`** — apply wearables migrations to hosted project
3. **Remove duplicate RLS migration from PR #41** — `20260414050000` duplicates `20260414024917` already on hosted
4. **Merge PR #36** (mobile seam hardening) — adds AsyncStorage, URL-polyfill, getFreshAccessToken, mobile CI steps
5. **Merge PR #35** (CHECKPOINT) — after verifying no conflict with this file
6. **Merge PR #41** (repo optimizations) — after removing duplicate migration
7. **Merge PR #26** (wearables sync client) — depends on PR #36
8. **Run first live authenticated Expo submit** — sign in, submit form, verify HTTP 200 + DB write

## Startup rule

For meaningful repo work, start with `CHECKPOINT.md`.
Read `README.md` first only when a person or agent needs broad repo orientation.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance or evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `memory/agent-failure-patterns.md` for session startup when touching schema, migrations, or end-to-end testing.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` only for broad repo orientation.
- `supabase/README.md` for Supabase workflow, CI commands, secrets, and deploy procedure.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo.
- Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
- Every migration applied to hosted Supabase MUST be committed to `supabase/migrations/`.
