# C2 — Evidence Runtime Wire (Issue #88)

**Target agent:** ChatGPT Codex
**Workstream:** C (Evidence Runtime)
**Depends on:** A3 (new `PriorityScoreResult` contract)
**Blocks:** v1 release — this is the open blocker

---

## Context

Issue #88 tracks: "Priority Score must read from `rule_evidence_links`
at runtime." Evidence registry schema + seeds are live (9 sources, 15
rule_evidence_links; migrations `20260413021500`, `20260420091500`,
`20260420190000`). The runtime consumer is **not wired**.

Issue #88's description references a function `calculatePriority` that
does **not exist** in the codebase (human operator posted a correction
comment). The real entry point is `evaluateMinimumSlice` in
`packages/domain/minimumSlice.ts`, calling
`aggregateTotalPriorityScoreWithEvidence` in `packages/domain/biomarkers.ts`.
`loadEvidenceForRules` exists in `packages/domain/evidenceRegistry.ts`
but is never called from `apps/` or `supabase/`.

A3 changes `aggregateTotalPriorityScoreWithEvidence` to return
`PriorityScoreResult` with an `evidenceClass` and `anchors` array,
and enforces the "unanchored → bucket 0" rule. C2 makes the data
actually flow.

## Goal

Wire `loadEvidenceForRules` to real Supabase data, consume the result
in `evaluateMinimumSlice` call sites (mobile + Edge Function), and
prove the data path end to end.

## Deliverables

### 1. Mobile wiring

- `apps/mobile/src/data/evidenceAnchors.ts` — fetch helper that
  calls `loadEvidenceForRules(ruleIds)` with a Supabase client.
- `apps/mobile/src/screens/MinimumSliceScreen.tsx` — before rendering
  the panel, resolve rule IDs from the domain layer (via a new
  `collectRuleIdsForPanel` export from `minimumSlice.ts` if not already
  exposed), fetch anchors, pass into `evaluateMinimumSlice`.
- Loading state surfaced: while anchors load, show a skeleton; never
  show a score that was computed without anchors.

### 2. Edge Function wiring

- `supabase/functions/<score-endpoint>/index.ts` — if a score-surface
  Edge Function exists, wire it to `loadEvidenceForRules` against the
  service-role client. If none exists, document that in the PR
  description — no new function in this prompt.

### 3. Hard gate

- `aggregateTotalPriorityScoreWithEvidence` already throws when
  `anchors.length === 0`. Verify this still holds and add an
  end-to-end test that exercises the empty-anchor path from the
  mobile side (expect the loading state, then a "no evidence
  anchors" UI state via A6's warning banner).

### 4. Issue #88 update

- Post a comment on #88 with the commit SHA of the merged wire,
  the test names proving the path, and close #88.

## Constraints

- Do not change A3's contract.
- Do not re-implement `loadEvidenceForRules`. Only wire it.
- No service-role key in mobile code. Mobile reads via the
  authenticated client against RLS-protected tables.
- If RLS on `rule_evidence_links` or `evidence_sources` blocks the
  mobile client, flag it — do not disable RLS. A separate migration
  may be needed; stop and report.
- Keep the evidence fetch out of the hot path: cache the anchors per
  panel load, not per score recompute.

## Acceptance criteria

- Clean app start → open panel → anchors load → `rawScore` +
  `bucket` + `anchors` all present in `PriorityScoreResult`.
- Corrupt the data (remove all `rule_evidence_links` rows for one
  rule in a test branch) → panel shows the "no evidence anchors"
  warning banner instead of a fake zero.
- Test: `evaluateMinimumSlice` throws or returns an unanchored
  result when anchors are empty, never a silently-zero score.
- Issue #88 closed with commit SHA in closing comment.

## Hand-back checklist for Opus review

- [ ] `loadEvidenceForRules` called from mobile.
- [ ] RLS respected; no service-role in client.
- [ ] Anchors cached per panel load.
- [ ] UI shows loading, success, or empty-anchors state —
      never a phantom score.
- [ ] #88 closed with SHA.
- [ ] No reference to the ghost `calculatePriority` symbol
      anywhere in new code.
