# A3 — Scoring Design 2.5: Evidence-First Composition with Trend Skeleton

**Target agent:** ChatGPT Codex
**Workstream:** A (Metrics & Logic)
**Depends on:** none (first A-stream implementation task)
**Blocks:** A5, A6, A7, C2

---

## Context

This repo implements a personal health intelligence system. The shared
domain layer lives in `packages/domain/` (TypeScript, no framework).
A Priority Score is computed per biomarker panel from weighted severity.
The current scoring is documented in:

- `packages/domain/biomarkers.ts` — `calculateWeightedScore`,
  `aggregateTotalPriorityScore`, `aggregateTotalPriorityScoreWithEvidence`,
  `mapPriorityScore`, `determinePrimaryFocus`.
- `packages/domain/v1.ts` — `MarkerRuntimeConfig`, `ScoreRole`,
  `statusSeverityMap`, `assessInterpretability`,
  `determineLipidHierarchyDecision`, `canContributeToPriorityScore`.
- `packages/domain/minimumSlice.ts` — `evaluateMinimumSlice()` is the
  runtime entry point. Required: `apob`, `hba1c`, `glucose`, `ldl`.
  Optional: `lpa`, `crp`, `ferritin`.

Three scoring designs were evaluated. Design 2.5 ("Evidence-First
Composition with Trend Skeleton") was chosen. A4 covers threshold
audit separately.

## Goal

Implement Design 2.5 in `packages/domain/` without breaking existing
consumers. Output two values per panel: (a) a bounded composite bucket
0–4 derived from the lipid hierarchy and metabolic pillar, (b) the raw
weighted sum (current value). Both must be returned; UI (A6) decides
how to surface them.

## Design 2.5 specification

### Scoring contract

```
PriorityScoreResult {
  rawScore: number              // existing weighted sum, unchanged math
  bucket: 0 | 1 | 2 | 3 | 4     // composite bucket, see below
  pillarScores: {
    cardiovascular: BucketAndReason
    metabolic:      BucketAndReason
    inflammation:   BucketAndReason
    nutrientContext: BucketAndReason
  }
  evidenceClass: 'strong' | 'moderate' | 'limited' | 'unanchored'
  anchors: EvidenceAnchor[]      // from loadEvidenceForRules, required
  trendSkeleton: TrendSkeleton | null   // A7 hook, null for v1 emit
}
```

### Bucket derivation

1. Per pillar, pick the marker with the highest `calculateWeightedScore`.
2. Map that score via `mapPriorityScore` → per-pillar 0–4.
3. Composite bucket = max across pillars, **except**: if lipid hierarchy
   decision is `apob_primary` and ApoB is Optimal/Good, cardiovascular
   pillar is clamped to max(0, LDL bucket − 1).
4. If evidenceClass is `unanchored`, bucket must be `0` and a
   `NOT_EVIDENCE_ANCHORED` reason attached. This is the new hard rule:
   no anchor, no score.

### Pillar assignment

Reuse `MarkerRuntimeConfig.pillar` already declared in `v1.ts`. Verify
all 13 biomarkers in `biomarkers.ts` have a pillar assignment; if any
missing, add them in this change.

### Trend skeleton (read-only)

Emit `trendSkeleton = null` in v1 but the type must exist:

```
TrendSkeleton {
  markerKey: string
  samples: Array<{ timestamp: string, value: number }>
  windowDays: number
  sparse: boolean     // true when samples.length < 3 OR span < windowDays
  note: 'READ_ONLY_V1_NOT_COUPLED_TO_SCORE'
}
```

This type ships but is never populated in v1 output. A7 will wire
the populator against Supabase. Priority Score **must not** read
from trendSkeleton.

## Constraints

- Existing `aggregateTotalPriorityScore` must keep its signature and
  return the same numeric result for all existing fixtures. It is the
  `rawScore` field.
- `aggregateTotalPriorityScoreWithEvidence` stays the evidence-aware
  entry point but now returns `PriorityScoreResult`.
- `evaluateMinimumSlice` must call the new entry point and expose
  the bucket + pillar breakdown in its output. Missing-mandatory
  handling unchanged (recommendation, no crash).
- No database changes in this prompt. Migrations live in C2.
- No UI changes in this prompt. UI lives in A6.

## Deliverables

1. New types in `packages/domain/scoring.ts` (new file) — pillar,
   pillar score, result, trend skeleton.
2. Updated `packages/domain/biomarkers.ts` — `aggregateTotalPriorityScoreWithEvidence`
   returns `PriorityScoreResult`; preserve legacy numeric return via
   separate named export if any callsite relied on it.
3. Updated `packages/domain/v1.ts` — pillar assignments verified, any
   missing added.
4. Updated `packages/domain/minimumSlice.ts` — expose bucket + pillars.
5. Updated `packages/domain/index.ts` exports.
6. One migration of callers inside `packages/domain/` only. Do not
   touch `apps/` in this prompt.

## Acceptance criteria

- `pnpm -C packages/domain test` green.
- New fixtures: (a) all-optimal panel → bucket 0, (b) ApoB 165 +
  HbA1c 6.8 + CRP 6 → bucket 4 with cardiovascular dominant,
  (c) ApoB optimal but LDL 160 under apob_primary hierarchy →
  cardiovascular bucket clamped to LDL − 1 = max(0, 1−1) = 0 when
  LDL is Good, or 2 when LDL is Borderline, (d) panel with no
  anchors → bucket 0 + `NOT_EVIDENCE_ANCHORED`.
- `rawScore` matches current `aggregateTotalPriorityScore` for every
  existing fixture (snapshot check).

## Hand-back checklist for Opus review

- [ ] Types compile with no `any` or `@ts-expect-error`.
- [ ] `rawScore` backward-compatibility proven by snapshot diff.
- [ ] No changes in `apps/` or `supabase/`.
- [ ] Trend skeleton type present but never populated.
- [ ] Evidence-required rule enforced (unanchored → bucket 0).
- [ ] PR description lists every fixture added and the reasoning
      behind each bucket.
