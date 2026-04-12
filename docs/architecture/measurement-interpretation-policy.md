# Measurement and Interpretation Policy

## Verdict

One L1fe needs a strict boundary between:
- what was measured,
- what can be interpreted,
- what may influence a priority score,
- what can become a recommendation.

This policy is the bridge between research, domain rules, Notion structure, and later automation.

## Marker Classes

### Core
Markers with stronger preventive relevance and clearer early V1 use.

Initial core set:
- ApoB
- LDL (fallback or secondary lens, not co-equal with ApoB in primary lipid scoring)
- Triglycerides
- Lp(a)
- HbA1c
- Glucose
- hs-CRP / CRP only with assay clarity

### Supporting
Useful markers with value, but more context-sensitive interpretation.

Initial supporting set:
- Vitamin D
- Ferritin
- B12
- Magnesium

### Contextual
Useful for context or personalization, but not suitable for hard core scoring.

Initial contextual set:
- DAO

### Deferred / later candidates
Present in old structure, but not yet mature enough for V1 scoring until rules are tightened.

Examples:
- HDL
- Homocysteine
- Uric Acid
- ALT
- Blood Pressure
- Fasting Insulin
- OGTT Insulin
- LDL-P
- Fibrinogen
- Lp-PLA2
- oxLDL / oxPL
- ADMA / SDMA
- APOE genotype

## Rule Hardness Classes

### Hard
Safe enough for early structured interpretation.

Traits:
- relatively stable evidence base,
- clear unit requirements,
- clear preventive relevance,
- low ambiguity in V1 usage.

Examples:
- ApoB high vs target policy,
- HbA1c target bands,
- glucose target bands,
- hs-CRP with explicit assay,
- Lp(a) one-time elevated vs not elevated.

### Medium / policy-based
Usable, but should be explicitly marked as policy or bounded heuristic.

Examples:
- Vitamin D optimal zone above deficiency threshold,
- triglyceride target for optimization,
- magnesium optimization zone,
- weekly self-report focus logic.

### Soft / exploratory
Allowed in explanation or experiments, not in hard core score.

Examples:
- DAO interpretation,
- ambitious longevity targets with weak consensus,
- causal recommendation jumps from one contextual marker.

## Severity vs Coverage

These must never be collapsed into one concept.

### Severity
How concerning a measured, interpretable value appears.

### Coverage
How complete, fresh, and interpretable the data basis is.

Rules:
- missing data does not equal severity,
- coverage gaps may trigger "collect more data",
- coverage should have its own summary field or insight.

## Score Eligibility Policy

### Allowed in first priority score
- ApoB
- LDL only when ApoB is missing or explicitly treated as a separate lens
- Triglycerides
- Lp(a) with one-time logic and no recurring missing penalty
- HbA1c
- Glucose
- hs-CRP when assay type is known

### Not allowed in first hard core score
- DAO
- ferritin without context gate
- vitamin D as direct hard-risk input
- magnesium as direct hard-risk input
- B12 as direct hard-risk input

These may still appear in:
- supporting summaries,
- secondary focus lists,
- contextual recommendations,
- data collection suggestions.

## Unit and Assay Policy

## Mandatory principle
A value without usable unit or assay metadata may be stored, but not necessarily interpreted.

### ApoB
- preferred unit: mg/dL
- interpretable when unit is known

### LDL
- preferred unit: mg/dL
- interpretable when unit is known

### Triglycerides
- preferred unit: mg/dL
- interpretable when unit is known

### Lp(a)
- unit must be explicit
- mg/dL and nmol/L must not be silently converted into each other for V1
- interpretation and threshold policy must be unit-specific

### HbA1c
- unit format must be explicit
- percent and mmol/mol must not be mixed without explicit conversion rules

### Glucose
- unit must be explicit
- mg/dL vs mmol/L needs conversion policy before use

### CRP / hs-CRP
- assay name is required for reliable interpretation
- if assay type is unknown, value may be stored but should become "interpretation limited"

### Ferritin
- unit must be explicit
- interpretation should require context gate if elevated

### Vitamin D
- unit must be explicit
- optimization zone must be labeled as policy choice, not universal consensus

### Magnesium
- assay/sample type should be captured later if available
- serum-only interpretation should remain bounded

### DAO
- unit must be explicit
- interpretation remains contextual only

## Context Gates

### Ferritin context gate
Elevated ferritin should not create a high-priority signal without context such as:
- CRP / inflammation context,
- liver markers,
- iron context if available.

### Lp(a) cadence gate
Lp(a) should not repeatedly create a weekly missing or missing-score penalty.
It is a static or slow-changing marker.

### Biomarker freshness gate
A biomarker result should not silently act current forever.
Each linked weekly view should surface data freshness.

Suggested V1 freshness labels:
- current
- recent
- aging
- stale
- missing

## Recommendation Eligibility

A recommendation may only be generated when:
- the source value is interpretable,
- the rule hardness is sufficient for the recommendation type,
- the recommendation type matches the evidence class,
- the scope is explicit.

### Recommendation types
- Inform
- Monitor
- Collect More Data
- Behavior Adjustment
- Clinician Clarification

### Never do in V1
- treatment recommendation,
- diagnostic claim,
- medication suggestion,
- false certainty from a single contextual marker.

## Safety States

Every derived insight or recommendation should eventually expose one of these states:
- ready
- needs_more_data
- uncertain
- out_of_scope
- safety_handoff

## Score Framing Policy

The first score should be named as a priority construct, not as medical truth.

Recommended naming:
- Priority Score
- Focus Score
- Attention Score

Avoid:
- Health Score
- Longevity Score
- Risk Score

unless a validated model is being used and clearly identified as such.

## Immediate V1 Consequences

1. Old giant biomarker formulas should not be copied blindly.
2. Weak markers move into contextual/supporting layers.
3. Missing data becomes a coverage issue, not a disease signal.
4. Unit and assay fields become first-class properties.
5. Recommendation output must use explicit evidence/confidence/scope fields.
