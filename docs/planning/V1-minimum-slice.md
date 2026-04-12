# V1 Minimum Slice

This document defines the smallest testable end-to-end V1 slice for the Zwischenziel.
The slice is intentionally narrow: one lab panel goes in, the system interprets only the allowed V1 markers, computes a bounded Priority Score, and emits structured recommendation output.

## Goal

Prove that the V1 architecture works in one honest end-to-end flow:

1. labs in
2. interpretation
3. bounded Priority Score
4. recommendation output

If this slice works, the project has validated the core separation between raw data, interpretation, priority, and recommendation.

## End-to-end flow

### 1. Labs in
A lab panel is recorded for one profile with a collection date and a small set of biomarker entries.

### 2. Interpretation
Each entry is checked for:
- marker identity,
- value presence,
- unit presence,
- assay presence where required,
- freshness,
- and score eligibility.

The system then assigns:
- interpretability state,
- canonical status,
- severity,
- and coverage notes.

### 3. Bounded Priority Score
Only the allowed score-eligible V1 markers contribute to the score.
Coverage gaps, stale data, and interpretation-limited values do not behave like severity.

### 4. Recommendation output
The system emits one or more structured recommendations using the V1 recommendation contract.
Outputs remain preventive, bounded, and explicit about scope.

## Exact inputs required

The minimum slice should accept exactly these inputs.

### Profile-level inputs
- `profile_id`
- optional display name or profile label

### Lab panel inputs
- `panel_id`
- `profile_id`
- `collected_at`
- `source` or `source_unknown`

### Required biomarker entries for the slice
These entries are enough to prove the V1 flow.

1. `ApoB`
   - numeric value
   - unit required
2. `HbA1c`
   - numeric value
   - unit required
3. `Glucose`
   - numeric value
   - unit required
4. `LDL`
   - numeric value
   - unit required
   - included to prove ApoB-primary / LDL-fallback behavior

### Optional but recommended slice inputs
These help test bounded logic without expanding scope too far.

5. `Lp(a)`
   - numeric value
   - unit required
6. `hs-CRP`
   - numeric value
   - unit required
   - assay type required

## Rules that must be implemented for this slice

The slice should implement only the minimum rule set needed to prove the architecture.

### A. Interpretability and coverage rules
1. A value without a usable unit is stored but not interpreted.
2. A marker that requires assay context, such as hs-CRP, is interpretation-limited when assay is missing.
3. Freshness is computed from `collected_at` and exposed separately from severity.
4. Missing data creates coverage output, not severity.

### B. Core interpretation rules
1. ApoB can be interpreted when unit is known.
2. HbA1c can be interpreted when unit is known and format is explicit.
3. Glucose can be interpreted when unit is known.
4. LDL can be interpreted when unit is known.

### C. Lipid hierarchy rule
1. ApoB is the primary lipid signal.
2. LDL acts as fallback or secondary lens only.
3. ApoB and LDL must not be co-scored as two equal primary drivers of the same lipid story.

### D. Priority Score rules
1. The score is a Priority Score, not a risk score.
2. Only score-eligible interpretable markers can contribute.
3. Minimum score-eligible markers for the slice are:
   - ApoB
   - HbA1c
   - Glucose
   - LDL only under fallback or separate-lens logic
4. Lp(a), if included, may act only as a bounded modifier or flag.
5. hs-CRP, if included, may contribute only when assay context is valid and the value is suitable for preventive interpretation.
6. Missing, stale, or interpretation-limited rows do not raise severity.

### E. Recommendation rules
1. Every recommendation must include:
   - type
   - verdict
   - recommendation text
   - evidence summary
   - confidence
   - scope
   - handoff_required
2. Allowed recommendation types for this slice are:
   - `inform`
   - `collect_more_data`
   - `behavior_adjustment`
   - `clinician_clarification`
3. Recommendations must stay preventive and non-diagnostic.
4. Collect-more-data recommendations must be used for missing ApoB, missing unit, missing assay, or stale panel situations.

## Minimum output shape

The exact field names can evolve, but the output must preserve this shape.

```json
{
  "profile_id": "string",
  "panel_id": "string",
  "rule_version": "string",
  "coverage": {
    "state": "complete | partial | missing | interpretation_limited | stale",
    "notes": ["string"]
  },
  "entries": [
    {
      "marker": "ApoB",
      "value": 0,
      "unit": "mg/dL",
      "interpretable": true,
      "freshness": "current | recent | aging | stale | unknown",
      "canonical_status": "optimal | good | borderline | high | critical | unknown",
      "severity": 0,
      "score_eligible": true,
      "score_contribution": 0,
      "rule_ids": ["string"]
    }
  ],
  "priority_score": {
    "name": "Priority Score",
    "value": 0,
    "included_marker_count": 0,
    "top_drivers": ["string"],
    "bounded_modifier_note": "string",
    "excluded_marker_note": "string",
    "coverage_summary": "string",
    "freshness_note": "string"
  },
  "recommendations": [
    {
      "type": "inform | collect_more_data | behavior_adjustment | clinician_clarification",
      "verdict": "string",
      "text": "string",
      "evidence_summary": "string",
      "confidence": "high | medium | low",
      "scope": "string",
      "handoff_required": false,
      "rule_id": "string"
    }
  ]
}
```

## Suggested test fixture for the slice

Use one realistic panel to prove the path.

### Example input
- ApoB: elevated, interpretable
- HbA1c: borderline-high, interpretable
- Glucose: mildly elevated, interpretable
- LDL: elevated, present but not independently co-scored because ApoB is present
- Lp(a): elevated in explicit unit, treated as bounded modifier only
- hs-CRP: missing assay, therefore interpretation-limited

### Expected behavior
- ApoB, HbA1c, and glucose contribute to the Priority Score.
- LDL is visible, but does not add a duplicate primary lipid contribution.
- Lp(a) adds only a bounded note or modifier, if included.
- hs-CRP triggers an interpretation-limited or collect-more-data path, not a hard score contribution.
- At least one structured recommendation is emitted.

## Out of scope for this minimum slice

The slice should explicitly exclude the following:

- weekly self-report ingestion and trend logic
- four-pillar weekly coaching outputs
- hidden Notion formulas as canonical logic
- full Notion workspace automation
- full evidence registry UI
- broad contextual marker interpretation beyond the narrow test set
- ferritin context-gate implementation beyond a placeholder exclusion path
- vitamin D optimization policy logic
- magnesium, B12, DAO, HDL, fasting insulin, OGTT insulin, genotype, and other deferred markers
- full historical rescoring
- diagnosis-like explanations
- treatment advice or medication suggestions
- clinician-sharing workflows

## Plain-English acceptance criteria

The minimum slice is done when all of the following are true:

1. A single lab panel can be submitted with a small fixed set of biomarkers.
2. The system can tell which rows are interpretable and which are blocked by missing metadata.
3. The system computes a Priority Score from only the allowed V1 inputs.
4. Missing or stale data appears as coverage information, not as fake severity.
5. ApoB and LDL do not get double-counted as equal primary lipid drivers.
6. Lp(a) stays bounded if included.
7. hs-CRP without assay clarity cannot silently behave like a valid preventive score input.
8. At least one recommendation is emitted in the structured V1 contract format.
9. The recommendation stays preventive, bounded, and explicit about scope.
10. The slice can be tested repeatably with the same input fixture and the same expected output class.

## Why this slice matters

This is the smallest slice that proves the V1 architecture is real.
It validates that One L1fe can move from raw lab data to explicit interpretation and bounded action without pretending to be a hidden clinical expert system.
