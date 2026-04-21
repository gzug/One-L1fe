# Biomarker Threshold & Scoring Audit Log

---
status: current
canonical_for: biomarker threshold definitions and scoring weights
owner: repo
last_verified: 2026-04-21
scope: packages/domain/thresholds.ts · packages/domain/biomarkers.ts
---

## Summary

Full audit of all 12 tracked biomarkers against Peter Attia's Medicine 3.0 framework
and supporting peer-reviewed literature. Conducted 2026-04-21.

**Key finding:** `thresholds.ts` is largely correct and more conservative than `biomarkers.ts`.
The primary issue is a sync gap between the two files. Three threshold values also need
tightening to match Attia's explicit longevity targets.

---

## Scoring Architecture Proposal

Introduce `evidenceConfidenceModifier` (0.3–1.0) and `scoringClass` to `BiomarkerDefinition`
so low-certainty markers (e.g. DAO) are structurally suppressed in aggregate scoring
rather than relying on caller-side logic.

```ts
export interface BiomarkerDefinition {
  // existing fields ...
  evidenceConfidenceModifier: number; // 0.3–1.0
  scoringClass: 'causal-primary' | 'supporting-actionable' | 'contextual-low-certainty';
}
```

`effectiveScore = nominalWeight × evidenceConfidenceModifier`

Related blocker: evidence registry not yet wired to Priority Score runtime (WEARABLE-TD-004).

---

## Weighting Hierarchy (validated)

| Marker      | Nominal Weight | Conf. Modifier | Effective Score | Scoring Class            |
|-------------|---------------|----------------|-----------------|--------------------------|
| ApoB        | 3             | 1.0            | **3.00**        | causal-primary           |
| HbA1c       | 2             | 1.0            | **2.00**        | causal-primary           |
| hsCRP       | 1.5           | 0.9            | 1.35            | supporting-actionable    |
| LDL-C       | 1             | 0.9            | 0.90            | supporting-actionable    |
| Triglycerides | 1           | 0.85           | 0.85            | supporting-actionable    |
| Glucose     | 1             | 0.85           | 0.85            | supporting-actionable    |
| Lp(a)       | 1             | 0.80           | 0.80            | supporting-actionable    |
| Vitamin D   | 1             | 0.80           | 0.80            | supporting-actionable    |
| Ferritin    | 1             | 0.75           | 0.75            | supporting-actionable    |
| B12         | 1             | 0.70           | 0.70            | contextual-low-certainty |
| Magnesium   | 1             | 0.65           | 0.65            | contextual-low-certainty |
| DAO         | 1             | **0.30**       | **0.30**        | contextual-low-certainty |

**Verdict:** Hierarchy is correct. ApoB and HbA1c are the only causal-primary markers.
hsCRP at 1.5 is defensible but could be lowered to 1 if CV markers remain primary drivers.

---

## Threshold Delta Table

### Fix 1 — Threshold Tightening Required (both files)

| Marker        | File            | Current          | Recommended      | Reason                                              |
|---------------|-----------------|------------------|------------------|-----------------------------------------------------|
| ApoB          | both            | optimalMax: 80   | optimalMax: **60** | Attia: "no reason north of 60 mg/dL for primordial prevention" |
| Triglycerides | thresholds.ts   | **MISSING**      | Add `evaluateTriglycerides()` | optimalMax: 100, goodMax: 130, borderlineMax: 150, highMax: 200 |
| Vitamin D     | both            | optimalMin: 30   | optimalMin: **40** ng/mL | Attia targets 40–60 ng/mL; IOM floor (20) is deficiency prevention, not optimal |
| Ferritin (M)  | thresholds.ts   | lowThreshold: 30 | lowThreshold: **50** | Functional iron sufficiency for energy metabolism starts ~50 ng/mL |

### Fix 2 — Sync biomarkers.ts to thresholds.ts (thresholds.ts already correct)

| Marker  | biomarkers.ts (stale) | thresholds.ts (correct) |
|---------|-----------------------|--------------------------|
| HbA1c   | referenceRange max: 5.7% | optimalMax: **5.3%** ✓ |
| Glucose | referenceRange max: 100 mg/dL | optimalMax: **85 mg/dL** ✓ |
| hsCRP   | referenceRange max: 3 mg/L | optimalMax: **1 mg/L** ✓ |
| LDL-C   | referenceRange max: 100 mg/dL | optimalMax: **70 mg/dL** ✓ |

### Fix 3 — Add missing evaluate*() functions to thresholds.ts

| Marker      | Priority | Recommended Thresholds                                              |
|-------------|----------|----------------------------------------------------------------------|
| Triglycerides | **P1** | optimalMax: 100, goodMax: 130, borderlineMax: 150, highMax: 200 (mg/dL) |
| B12         | P2       | optimalMin: 500, goodMin: 400, borderlineMin: 300, highMin: 200 (pg/mL) |
| Magnesium   | P3       | optimalMin: 2.0, goodMin: 1.9, borderlineMin: 1.7, highMin: 1.5 (mg/dL) |
| DAO         | P4       | optimalMin: 10, goodMin: 7, borderlineMin: 4, highMin: 2 (U/mL) — **FLAG: LOW CONFIDENCE, lab-manufacturer reference only** |

---

## Marker-level Audit Notes

### ApoB `[causal-primary]`
- **Action:** Tighten `optimalMax: 80 → 60 mg/dL` in both files
- **Evidence:** Mendelian randomization (Ference 2018, PMC6474943); Attia peterattiamd.com/early-and-aggressive-lowering-of-apob; PMC11335015 (2024)
- **Confidence:** HIGH

### HbA1c `[causal-primary]`
- **Action:** Sync `biomarkers.ts` referenceRange to match `thresholds.ts` optimalMax 5.3%
- **Evidence:** Attia optimal ~5.1–5.3%; ADA Standards of Care 2024
- **Confidence:** HIGH

### LDL-C `[supporting-actionable]`
- **Action:** Sync `biomarkers.ts` referenceRange max 100 → 70 mg/dL (thresholds.ts already correct)
- **Note:** ApoB is preferred primary; LDL kept for cross-reference; hierarchy logic manages preference
- **Confidence:** HIGH

### Triglycerides `[supporting-actionable]`
- **Action:** Add `evaluateTriglycerides()` to thresholds.ts; tighten optimal 150 → 100 mg/dL
- **Evidence:** Attia: optimal TG < 100 mg/dL; TG:HDL ratio < 2:1 as insulin resistance proxy; PMC11242442 (2024)
- **Confidence:** HIGH

### Lp(a) `[supporting-actionable]`
- **Action:** None — thresholds.ts correct at optimalMax 30 mg/dL
- **Note:** Genetic/non-modifiable; informational weight only; EAS < 75 nmol/L normal zone consistent
- **Evidence:** PMC11031736 (2024)
- **Confidence:** MEDIUM

### hsCRP `[supporting-actionable]`
- **Action:** Sync `biomarkers.ts` referenceRange max 3 → 1 mg/L (thresholds.ts already correct)
- **Evidence:** ACC 2025: hsCRP ≥ 2 mg/L = CV risk enhancer; Eur Heart J 2026 doi:10.1093/eurheartj/ehaf163
- **Confidence:** HIGH

### Glucose `[supporting-actionable]`
- **Action:** Sync `biomarkers.ts` referenceRange max 100 → 85 mg/dL (thresholds.ts already correct)
- **Confidence:** MEDIUM

### Vitamin D `[supporting-actionable]`
- **Action:** Tighten `optimalMin: 30 → 40 ng/mL` in both files
- **Evidence:** Attia targets 40–60 ng/mL; honehealth.com/edge/peter-attia-supplements
- **Confidence:** HIGH

### Ferritin `[supporting-actionable]`
- **Action:** Update `lowThreshold` male: 30 → 50 ng/mL in thresholds.ts
- **Note:** Context-gating logic (CTX-001/002) is excellent — keep as-is. Only floor needs update.
- **Evidence:** Camaschella NEJM 2015 doi:10.1056/NEJMra1401038
- **Confidence:** MEDIUM

### B12 `[contextual-low-certainty]`
- **Action:** Add `evaluateB12()`; tighten optimal 400 → 500 pg/mL
- **Note:** Functional B12 deficiency risk extends to ~500 pg/mL; homocysteine pathway has CV relevance
- **Evidence:** Herrmann & Obeid 2011 doi:10.1007/s10068-011-0022-x
- **Confidence:** MEDIUM

### Magnesium `[contextual-low-certainty]`
- **Action:** Add `evaluateMagnesium()`; tighten optimal 1.8 → 2.0 mg/dL
- **Evidence:** DiNicolantonio et al. Open Heart 2018 doi:10.1136/openhrt-2018-000775
- **Confidence:** MEDIUM

### DAO `[contextual-low-certainty]`
- **Action:** Add `evaluateDAO()` with explicit LOW_CONFIDENCE annotation; apply confidenceModifier: 0.3
- **Warning:** No Medicine 3.0 / Attia parallel. Lab manufacturer reference only. Must not inflate aggregate score.
- **Confidence:** LOW — re-audit required before scoring use

---

## Relation to Active Blockers

- **WEARABLE-TD-004** (evidence registry → Priority Score wire): implementing `evidenceConfidenceModifier`
  in `BiomarkerDefinition` is a prerequisite for this wire to produce meaningful weighted scores.
- Thresholds in `thresholds.ts` are the evaluation ground truth — `biomarkers.ts` referenceRanges
  are display/reference only and must be kept in sync to avoid UX inconsistency.

---

*Audit conducted by: Perplexity AI assistant in One L1fe Space*
*Based on: repo commit SHA 32d31cb (thresholds.ts), a354c1b (CHECKPOINT.md), Attia Medicine 3.0 framework*
