# Agent Failure Patterns

Documented failure modes observed in sessions. Use this to avoid repeating the same mistakes.

## 1. Treating unverified state as fact

**Pattern:** Agent describes repo or Supabase state from memory/context without verifying against live data.

**Example:** CHECKPOINT claimed migrations matched repo. In reality, 2 migrations (`phase0_wearables_context`, `phase0_wearables_hardening`) were not applied to the hosted project and 8 tables were missing entirely.

**Fix:** Always query Supabase directly (`list_migrations`, `execute_sql`) and compare against `supabase/migrations/` before stating a fact about schema state.

---

## 2. Full-overwrite instead of delta

**Pattern:** Agent rewrites an entire file when only a specific section needs updating, losing context written by previous sessions.

**Example:** CHECKPOINT.md rewritten without preserving confirmed facts from earlier sessions, losing PR merge history and smoke-test results.

**Fix:** Read the current file first. Append or patch only the delta. Preserve all confirmed facts unless explicitly superseded.

---

## 3. Missing dependency order

**Pattern:** Agent proposes or executes tasks without checking whether prerequisites are met.

**Example:** Suggesting Expo submit while `profiles` table had no row for the test user, and while 2 schema migrations were missing — both silent blockers.

**Fix:** Before any end-to-end test, always verify: (1) schema migrations applied, (2) test user has a `profiles` row, (3) required Edge Functions deployed.

---

## 4. CHECKPOINT drift from actual state

**Pattern:** `CHECKPOINT.md` describes a state that diverges from what is actually on `main` or on the hosted Supabase project.

**Example:** CHECKPOINT named `20260413093000` as latest migration. Dashboard had a different version number (`20260413072607`) as a separate entry, and two later migrations were not present at all.

**Fix:** After any migration push or schema change, update `CHECKPOINT.md` with the actual applied migration list from `list_migrations`, not from the filename.

---

## 5. Assuming CI deploy = valid deploy

**Pattern:** Agent assumes an Edge Function is correctly deployed because it shows `ACTIVE` status.

**Example:** `save-minimum-slice-interpretation` showed `ACTIVE` but `entrypoint_path` pointed to a local developer machine path (`/Users/ufo/.openclaw/...`), not a reproducible CI artifact.

**Fix:** After any Edge Function deploy, check `entrypoint_path` in `list_edge_functions`. A local path means the deploy was manual and not reproducible from CI.
