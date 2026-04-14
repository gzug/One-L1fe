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

The repo has a credible domain seam, a real Supabase backend, and a strong truth/ops layer. The mobile/auth seam hardening is **in progress** (PR #36 open). Supabase RLS performance has been patched. Immediate need is merging PR #36 → #35 → #25 → #26 in sequence, then building the HealthKit reader (PR #29).

---

## What is genuinely solid today

- **Domain sharpness** [Fact]: Clear product boundary — ApoB primary, LDL fallback. Priority Score is a bounded prioritisation aid, not a clinical risk score.
- **Truth/ops layer** [Fact]: `README → CHECKPOINT → MEMORY → memory/ → deep docs` follows a single consistent logic.
- **Backend seam** [Fact]: `save-minimum-slice-interpretation` is deployed with real JWT enforcement. One authenticated hosted smoke call returned HTTP 200 with confirmed DB write.
- **Wearables foundation** [Fact]: `metricRegistry.ts` and `syncContract.ts` on `main`. `syncClient.ts` on PR #26.
- **RLS performance** [Fact]: Migration `20260414024917_fix_rls_auth_initplan_lab_result_entries_interpreted_entries` applied. All 8 policies on `lab_result_entries` and `interpreted_entries` now use `(select auth.uid())` — Supabase WARN resolved.

---

## File-by-file status (as of main @ 95e1fb6d + PR #36 open)

### `apps/mobile/package.json` — ⚠️ Fixed in PR #36 (open)
Added: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `typecheck` script.

### `apps/mobile/mobileSupabaseAuth.ts` — ⚠️ Fixed in PR #36 (open)
Added: `AsyncStorage` config, `getFreshAccessToken()`, `createMobileSupabaseAuthSessionProvider()` routes through `getFreshAccessToken()`.

### `.github/workflows/ci.yml` — ⚠️ Fixed in PR #36 (open)
Added: `Mobile install` + `Mobile typecheck` steps after domain tests.

### `apps/mobile/useAuthSession.ts` — ✅ Good. No changes needed.
### `apps/mobile/App.tsx` — ✅ Good. Clean auth-gate shell.
### `apps/mobile/LoginScreen.tsx` — ⚠️ UI-direct login. Not a blocker. Decide post-seam-hardening.

### `src/lib/wearables/` — ❌ syncClient not on main yet (PR #26 open, waits for PR #36)

### `docs/architecture/repo-structure.md` — ⚠️ Shows Target Structure only. Real paths missing: `memory/`, `scripts/`, `docs/planning/`, `src/`, `CHECKPOINT.md`. Not a product blocker.

### `package.json` (root) — ⚠️ No `typecheck:mobile` script. Optional.

### `supabase/` — ✅ 7 migrations applied. RLS live. `save-minimum-slice-interpretation` deployed.

---

## PR sequence — current

| PR | Title | Status | Depends on |
|----|-------|--------|------------|
| #36 | Mobile seam hardening | ✅ Open — CI pending | — |
| #35 | CHECKPOINT master audit | ✅ Open — docs only | Can merge now |
| #24 | CHECKPOINT (older) | ❌ Close — superseded by #35 | — |
| #25 | compute-daily-summaries | ✅ Open | replay-migrations as Required Check |
| #26 | wearablesSyncClient | ✅ Open | PR #36 on main |
| #29 | HealthKit reader | ❌ Not started | PR #26 on main |

---

## Remaining task list (chronological)

1. **GitHub Settings** — add `replay-migrations` as Required Check on `main` [Manual]
2. **PR #36 merge** — after CI green
3. **PR #35 merge** — docs only, no risk
4. **PR #24 close** — superseded
5. **PR #25 merge** — after point 1
6. **PR #26 merge** — after PR #36 on main
7. **Supabase Auth** — enable Leaked Password Protection in Dashboard [Manual]
8. **PR #29 build** — HealthKit reader, after PR #26 on main
9. **`repo-structure.md`** — extend with real paths or mark clearly as target-only [Minor]
10. **`package.json` root** — add `typecheck:mobile` [Optional]

---

## Supabase live status

- Project: `lbqgjourpsodqglputkj` · `https://lbqgjourpsodqglputkj.supabase.co` · ACTIVE_HEALTHY
- 7 migrations applied (last: `20260414024917_fix_rls_auth_initplan_...`)
- Security advisors: 1 WARN remaining — Leaked Password Protection disabled [Manual fix]
- Performance advisors: 8× RLS initplan WARN → **resolved by migration above**
- 11× unused index INFO — retain until real traffic, re-evaluate then

---

## Systemic risks — not blockers today

| Risk | Severity |
|------|----------|
| `labResultId` / `derivedInsightId` forwarded without server-side ownership check | ⚠️ Medium-term |
| Edge Function catch-all 400 too coarse for real private use | ⚠️ Medium-term |
| `repo-structure.md` stale | ⚠️ Minor |

---

## Confirmed facts (carry-forward)

- Hosted migrations match repo
- RLS and policies live
- `save-minimum-slice-interpretation` deployed with JWT enforcement
- One authenticated hosted smoke call returned HTTP 200 with DB write confirmed
- Supabase CI runs linked-project lint + local `supabase start` + `supabase db reset`
- Supabase test user: `test@one-l1fe.dev` (UID `3aa48a6f-0f7b-47d3-9875-7353064dd359`)
- `apps/mobile/.env.example` complete
- Domain files vendored into `_lib/domain` via `scripts/prepare-supabase-function-domain.sh`

---

## Startup rule

Start with `CHECKPOINT.md`. Read `README.md` only for broad orientation. Read deep docs only when the task touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` — health-adjacent copy, compliance boundaries
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` — provenance/evidence logic
- `GLOSSARY.md` — term meanings
- `README.md` — broad repo orientation
- `supabase/README.md` — Supabase workflow, CI, secrets, deploy

## Guardrails

- Keep ApoB primary, LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat Priority Score as a clinical risk score.
- Keep raw personal health data and direct identifiers out of the repo.
