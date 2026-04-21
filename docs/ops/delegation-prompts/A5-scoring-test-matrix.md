# A5 — Scoring Test Matrix

**Target agent:** Claude Haiku 4.5
**Workstream:** A (Metrics & Logic)
**Depends on:** A3 (new `PriorityScoreResult` type), A4 (audited thresholds)
**Blocks:** none — safety net only

---

## Context

A3 rewrites the Priority Score entry point to return
`PriorityScoreResult` (bucket + pillars + rawScore + evidenceClass +
trendSkeleton). A4 audits the thresholds. A5 adds the test coverage
that locks Design 2.5 behavior so C2 (evidence runtime wire) and later
refactors cannot silently regress it.

## Goal

Produce a comprehensive fixture-based test suite for
`packages/domain/scoring.ts` and `packages/domain/minimumSlice.ts`
covering the scoring contract, evidence gating, and
missing-mandatory handling.

## Fixture matrix

Generate fixtures for every cell:

| Scenario                                      | Expected bucket | Evidence class | Primary pillar |
|-----------------------------------------------|-----------------|----------------|----------------|
| All-optimal                                   | 0               | moderate+      | none           |
| ApoB 165 alone (rest missing-mandatory)       | 4               | strong/moderate| cardiovascular |
| ApoB optimal, LDL 160 (apob_primary active)   | 0 or 1          | moderate+      | cardiovascular |
| HbA1c 6.8 + glucose 110                       | 3–4             | moderate+      | metabolic      |
| CRP 8 + everything else optimal               | 2               | moderate+      | inflammation   |
| Vitamin D 15 (low) + ferritin 20 (low)        | 1               | moderate+      | nutrient       |
| Full panel high across pillars                | 4               | strong         | cardiovascular (max) |
| No evidence anchors                           | 0               | unanchored     | none (clamped) |
| Only mandatory ApoB present, LDL missing      | from ApoB alone | moderate+      | cardiovascular |
| Zero markers (empty panel)                    | 0 + MISSING     | unanchored     | none           |
| DAO included but contextual only              | ignored in bucket | moderate+    | pillar of others |
| Stale marker (>180 days)                      | reduced per FreshnessState | moderate+ | n/a |

For each scenario:

1. Fixture input: `Record<string, number | null>` for marker values,
   plus evidence anchors array, plus marker freshness metadata.
2. Expected `PriorityScoreResult` (full object, not just bucket).
3. A one-line rationale comment above the fixture.

## Deliverables

- `packages/domain/__tests__/scoring.test.ts` — one `describe` block
  per scenario, one `it` per assertion.
- `packages/domain/__tests__/fixtures/scoring/*.json` — one file per
  fixture; tests import via `JSON.parse(fs.readFileSync(...))`.
- Snapshot test for `rawScore` backward-compat: every fixture must
  yield the same `rawScore` as the current
  `aggregateTotalPriorityScore` does for the same input.
- README in `__tests__/fixtures/scoring/` explaining how to add a
  new fixture.

## Constraints

- Use the test runner already configured in `packages/domain`.
  Do not introduce jest/vitest if the other is already in use.
- No live Supabase calls. Anchors are hand-constructed in the fixture.
- No network calls.
- Use thresholds from A4's audit output; if A4 is not yet merged,
  mark the relevant fixtures with `TODO(A4)` and use current values.

## Acceptance criteria

- 100% of `scoring.ts` branches covered (check with coverage tool
  already configured, or document a gap).
- Snapshot of `rawScore` passes against the current
  `aggregateTotalPriorityScore` output for every fixture.
- No fixture relies on randomness, date-now, or network.
- `pnpm -C packages/domain test` green.

## Hand-back checklist for Opus review

- [ ] Matrix complete — 12 scenarios minimum.
- [ ] Every fixture includes evidence anchors (or explicitly tests
      the unanchored case).
- [ ] Coverage report attached to PR description.
- [ ] No fixture values contradict A4 audit (or are TODO-tagged).
