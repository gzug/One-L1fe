# V1 Checkpoint and Next-Agent Brief

---
status: reference
canonical_for: v1 planning handoff
owner: repo
last_verified: 2026-04-14
note: This file describes the end-state of the V1 planning round and the seam state at time of writing. Current execution state is in CHECKPOINT.md. Do not treat this file as current operational truth.
---

## Purpose of this file

This file is the compact handoff checkpoint for the next work round.
It explains:
- what was achieved in the V1 planning round,
- what changed from the old Notion-centric model,
- what is already stable,
- and what the next agent should do.

**For current execution state, always use `CHECKPOINT.md` instead.**

## Seam state at time of writing (2026-04-14)

The following is confirmed as of 2026-04-14:
- Local Supabase replay from scratch works.
- The minimum-slice hosted Edge Function (`save-minimum-slice-interpretation`) is deployed and returned HTTP 200 with a real authenticated call.
- Shared domain imports are cross-runtime safe for Node and Supabase Edge.
- The Expo mobile seam uses a real Supabase auth session via `mobileSupabaseAuth.ts` with `AsyncStorage` for session persistence.
- `useAuthSession.ts` owns auth-state subscription.
- `LoginScreen.tsx` owns the minimal email/password sign-in UI.
- `MinimumSliceScreen.tsx` owns the signed-in minimum-slice form.
- `App.tsx` is the ~55-line pure auth-gate shell.
- The first live Expo submit (authenticated, real hosted endpoint) has NOT yet been performed.

## Current blockers (as of 2026-04-14)

See `CHECKPOINT.md` for the full, authoritative blocker list.
Key items:
- Wearables migrations not yet applied on hosted Supabase.
- Two Supabase-only RLS-fix migrations were not committed to repo (now fixed in PR `fix/repo-optimizations-2026-04-14`).
- First live authenticated Expo submit pending.

## V1 planning baseline achieved

The project now has a real V1 planning baseline for the first serious data and interpretation layer:
- a cleaner separation between raw measurements, insights, and recommendations,
- a bounded recommendation contract,
- a first rule matrix,
- explicit handling for coverage, freshness, units, and assay requirements,
- an implementation-ready rule inventory,
- decision tables for deterministic V1 control flow,
- and a Priority Score framing (not a medical risk score).

## Most important design decisions already made

1. **Severity is not coverage** — missing data must not behave like disease severity.
2. **ApoB is primary, LDL is fallback or secondary lens** — avoid double-counting.
3. **Weak/contextual markers should not shape the hard core score** — DAO stays contextual.
4. **Units and assay type are part of the truth** — especially for Lp(a), HbA1c, glucose, CRP.
5. **The score is a Priority Score, not a risk score** — it helps focus attention, not simulate medical certainty.
6. **Recommendations need a contract** — verdict, evidence, confidence, scope, and type must be explicit.
7. **Notion is not the final home of core health logic** — domain logic belongs in shared domain files and backend.

## Main architecture files from this round

- `docs/architecture/measurement-interpretation-policy.md`
- `docs/architecture/recommendation-contract-v1.md`
- `docs/architecture/v1-rule-matrix.md`
- `docs/architecture/priority-score-v1.md`
- `docs/architecture/data-freshness-and-coverage-policy-v1.md`
- `docs/architecture/weekly-self-report-anchors-v1.md`
- `docs/architecture/v1-implementation-rule-inventory.md`
- `docs/architecture/v1-decision-tables.md`

## Next agent tasks (ordered)

1. **Apply wearables migrations** — `supabase db push --linked` to apply `20260413214000` + `20260413220000`.
2. **Run first live Expo submit** — sign in, submit minimum-slice form, verify HTTP 200 + DB write.
3. **Merge open PRs** — PR #35, #36, and `fix/repo-optimizations-2026-04-14` (this audit).
4. **Use the mobile seam in a real screen or hook** — start from `MinimumSliceScreen.tsx` and `minimumSliceScreenController.ts`.
5. **Keep app code thin** — do not rebuild request shaping, transport wiring, or result parsing in UI files.
6. **Finish GitHub-side enforcement** — add secrets, confirm branch protection, run the hosted baseline helper.

## Guardrails for the next agent

- Keep all repo documentation in English.
- Do not let weak or commercial sources silently upgrade heuristic rules into hard rules.
- Do not collapse Notion back into a hidden medical logic engine.
- Do not turn the Priority Score into a fake clinical risk score.
- Keep the system preventive, bounded, and honest.
- Do not leave local machine paths (`/Users/...`) in repo documentation files.
- Every migration applied to hosted Supabase must be committed to the repo before the session closes.
