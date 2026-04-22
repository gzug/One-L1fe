# Biomarker Domain Audit Log

## Audit: 2026-04-22 — Threshold & Scoring Alignment

**Scope:** `packages/domain/biomarkers.ts`, `packages/domain/thresholds.ts`  
**Rationale:** Align optimal thresholds with Medicine 3.0 / Attia framework; introduce `evidenceConfidenceModifier` to structurally suppress low-certainty markers; add missing `evaluateTriglycerides()` and `evaluateDAO()` evaluators.

---

### 1. New Fields on `BiomarkerDefinition`

| Field | Type | Purpose |
|---|---|---|
| `evidenceConfidenceModifier` | `number` (0.3–1.0) | Multiplied into `priorityWeight` at score time. Suppresses low-certainty markers without removing them. |
| `scoringClass` | `ScoringClass` | Classifies causal/evidential role: `causal-primary`, `supporting-actionable`, `contextual-low-certainty`. |

`calculateWeightedScore()` now computes: `baseSeverity × priorityWeight × evidenceConfidenceModifier`

---

### 2. Threshold Changes

#### `biomarkers.ts` referenceRange (display/ratio engine)

| Marker | Field | Old | New | Rationale |
|---|---|---|---|---|
| ApoB | `optimalMax` | 130 | 80 | Sync to `thresholds.ts`; Attia primordial prevention target |
| LDL | `optimalMax` | 100 | 70 | Sync to `thresholds.ts` |
| Triglycerides | `optimalMax` | 150 | 100 | Medicine 3.0 tightened standard |
| HbA1c | `optimalMax` | 5.7 | 5.3 | Sync to `thresholds.ts`; Attia pre-diabetic early-warning |
| Glucose | `optimalMax` | 100 | 85 | Sync to `thresholds.ts`; Medicine 3.0 fasting optimal |
| CRP | `optimalMax` | 3 | 1 | hsCRP preventive standard; sync to `thresholds.ts` |
| Vitamin D | `optimalMin` | 20 | 30 | Attia targets 40–60; raising floor toward that range |

#### `thresholds.ts` evaluator functions

| Marker | Function | Change |
|---|---|---|
| ApoB | `evaluateApoB()` | `optimalMax` 80 → **60** (primordial prevention per Attia); goodMax stays 80 |
| Vitamin D | `evaluateVitaminD()` | `optimalMin` 30 → **40** ng/mL; goodMin stays 30; nmol/L path updated proportionally |
| Triglycerides | `evaluateTriglycerides()` | **New function** — LIP-003; optimalMax 100 mg/dL; mmol/L path included |
| DAO | `evaluateDAO()` | **New function** — CTX-003 [LOW_CONFIDENCE]; lower-bound thresholds; flagged in notes |

---

### 3. `evidenceConfidenceModifier` Values

| Marker | Modifier | Effective weight (priorityWeight × modifier) | Rationale |
|---|---|---|---|
| ApoB | 1.0 | 3.0 | Causal-primary; Mendelian randomization |
| HbA1c | 1.0 | 2.0 | Causal-primary; large RCT evidence |
| CRP | 0.8 | 1.2 | Acute-context sensitivity reduces certainty |
| LDL | 1.0 | 1.0 | Supporting-actionable; strong evidence |
| Triglycerides | 1.0 | 1.0 | Supporting-actionable |
| Glucose | 1.0 | 1.0 | Supporting-actionable |
| Vitamin D | 0.8 | 0.8 | Observational; serum proxy for functional status |
| Ferritin | 0.8 | 0.8 | Context-gated; elevated values require external signal |
| B12 | 0.8 | 0.8 | Serum B12 is a poor proxy for functional deficiency |
| Lp(a) | 0.7 | 0.7 | No intervention changes Lp(a) meaningfully in V1 |
| Magnesium | 0.7 | 0.7 | Serum Mg is weak proxy for intracellular status |
| DAO | 0.3 | 0.3 | Experimental; poor assay standardisation |

---

### 4. Missing Evaluators Status

| Marker | Evaluator | Status |
|---|---|---|
| Triglycerides | `evaluateTriglycerides()` | ✅ Added in this audit |
| DAO | `evaluateDAO()` | ✅ Added in this audit (LOW_CONFIDENCE flagged) |
| B12 | `evaluateB12()` | ⏳ Pending — no evaluator yet |
| Magnesium | `evaluateMagnesium()` | ⏳ Pending — no evaluator yet |

---

### 5. Sources

- Attia, P. *Outlive: The Science and Art of Longevity* (2023) — ApoB, HbA1c, Glucose, Triglycerides, Vitamin D thresholds
- Ference et al. (2017) *European Heart Journal* — Mendelian randomization evidence for ApoB/LDL causality
- Ridker et al. (2018) *NEJM* — hsCRP and cardiovascular risk; 1 mg/L optimal cutoff
- Holick et al. (2011) *J Clin Endocrinol Metab* — Vitamin D sufficiency thresholds (40 ng/mL target)
- Maintz & Novak (2007) *Am J Clin Nutr* — DAO and histamine intolerance; evidence limitations noted
