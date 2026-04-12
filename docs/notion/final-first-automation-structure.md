# Final First Notion Automation Structure

## Verdict

The first serious Notion automation structure for One L1fe should preserve the useful shape of the old MVP, but stop using Notion as the place where core health logic silently lives.

For V1:
- Notion is the human operating and review layer.
- GitHub defines domain rules and documentation.
- Supabase is the long-term system of record for measurements.
- Notion may still hold manual-entry rows early on, but should not become the hidden medical logic engine.

## V1 Goal

Create a first durable structure that can:
- accept manual health inputs,
- produce understandable weekly and biomarker summaries,
- separate measurement from interpretation,
- support bounded recommendations,
- stay upgradeable later without a full rebuild.

## Core Design Principles

1. Severity is not coverage.
2. Priority score is not clinical risk score.
3. Missing data is a state, not a punishment.
4. ApoB is primary, LDL is fallback or secondary lens.
5. Weak or contextual markers do not belong in the hard core score.
6. Unit and assay metadata are part of the truth.
7. Recommendation logic must be explicit and bounded.
8. Notion should summarize and organize, not hide core domain logic.

## Final V1 Layer Model

### 1. Marker Policy
Purpose:
- define marker classes,
- define threshold policy,
- define allowed units and assay requirements,
- define scoring eligibility.

System of truth:
- GitHub domain docs and structured rule files.

Notion role:
- optional read-only mirror or human summary.

### 2. Profile Baseline
Purpose:
- hold relatively stable human baseline context,
- store goals, constraints, and weekly anchor baselines.

Examples:
- age,
- sex/gender as needed for interpretation,
- baseline weekly self-ratings,
- constraints,
- willingness/readiness,
- family history summary.

### 3. Lab Panels
Purpose:
- group one collection event or lab report.

Examples:
- panel date,
- source,
- notes,
- freshness,
- profile link.

### 4. Lab Entries
Purpose:
- store one marker measurement per row.

Examples:
- biomarker key,
- raw value,
- unit,
- assay type,
- status,
- interpretation eligibility,
- score eligibility,
- evidence class used.

Important:
This row-level design is more durable than one giant table with a separate column for every biomarker.

### 5. Weekly Check-Ins
Purpose:
- hold self-report weekly execution data.

Examples:
- exercise,
- sleep,
- nutrition,
- emotional health,
- biggest risk,
- intended action,
- bottleneck,
- optional linked lab panel.

### 6. Derived Insights
Purpose:
- capture structured interpretation output, separate from raw data.

Examples:
- kind: trend, focus, pattern, coverage, recommendation-trigger,
- based-on rows,
- summary,
- confidence,
- scope,
- safety state.

### 7. Recommendations
Purpose:
- produce bounded next-step outputs.

Allowed types:
- inform,
- monitor,
- collect more data,
- behavior adjustment,
- clinician clarification.

Examples:
- verdict,
- evidence summary,
- confidence,
- scope,
- action type,
- handoff required,
- linked insight.

### 8. Overview / Dashboard
Purpose:
- display current state only.

Important:
- no hidden core logic,
- no important formula sprawl,
- mostly rollups, filtered views, and human-readable summaries.

## Recommended Notion Databases for V1

### A. Profiles
Manual + stable context.

Key properties:
- Name
- Active
- Birth Year or Age Band
- Sex / Interpretation Context
- Health Goal
- Priority Horizon
- Family History Summary
- Exercise Baseline (0-10)
- Sleep Baseline (0-10)
- Nutrition Baseline (0-10)
- Emotional Baseline (0-10)
- Constraints
- Readiness

### B. Lab Panels
One row per lab event.

Key properties:
- Name
- Profile
- Collected At
- Source
- Source Type
- Panel Notes
- Freshness Status
- Interpretation Window End
- Entries
- Derived Insight Count
- Recommendation Count

### C. Lab Entries
One row per marker measurement.

Key properties:
- Name
- Lab Panel
- Profile
- Biomarker Key
- Marker Class
- Value Numeric
- Unit
- Assay Type
- Source Confidence
- Interpretable
- Interpretation Blocker
- Canonical Status
- Severity Level
- Score Eligible
- Score Weight Version
- Weighted Priority Contribution
- Policy Notes

### D. Weekly Check-Ins
One row per week.

Key properties:
- Name
- Profile
- Week Start / Date
- Exercise (0-10)
- Sleep (0-10)
- Nutrition (0-10)
- Emotional Health (0-10)
- Exercise Deviation
- Sleep Deviation
- Nutrition Deviation
- Emotional Deviation
- Lowest Pillar
- Secondary Pillar
- Suggested Focus
- Bottleneck
- Biggest Risk
- Intended Action
- Linked Lab Panel
- Linked Biomarker Insight
- Weekly Summary

### E. Derived Insights
Structured interpretation layer.

Key properties:
- Name
- Profile
- Insight Kind
- Source Layer
- Related Lab Panel
- Related Week
- Evidence Class
- Confidence
- Scope
- Safety State
- Summary
- Structured Evidence
- Actionability

### F. Recommendations
Structured next-step layer.

Key properties:
- Name
- Profile
- Recommendation Type
- Derived Insight
- Verdict
- Recommendation Text
- Evidence Summary
- Confidence
- Scope
- Actionability
- Handoff Required
- Status

### G. Source Registry
Optional in Notion, strongly recommended in GitHub and/or Supabase later.

Purpose:
- map claims to quality,
- track where threshold or rule logic came from.

## What Changes From the Old Structure

### Keep
- profile baseline concept,
- weekly check-in concept,
- lab panel concept,
- dashboard as display layer,
- understandable summaries.

### Change
- replace one giant biomarker panel table with row-based lab entries,
- separate raw data from insights and recommendations,
- stop using missing data as a default hidden penalty,
- stop mixing hard logic and coaching text in one layer,
- make freshness, unit, assay, and evidence explicit.

### Remove or downgrade
- direct pseudo-medical total score framing,
- weak contextual markers inside core score,
- hidden formula sprawl in dashboard pages,
- implicit unit assumptions.

## What Notion Should Calculate in V1

Acceptable in Notion:
- weekly deviations from baseline,
- lowest pillar / secondary pillar,
- simple filtered views,
- display summaries,
- simple status text assembly.

Avoid placing long-term core logic only in Notion:
- canonical medical threshold rules,
- unit conversion policy,
- assay gating,
- core weighting logic,
- evidence policy,
- advanced recommendation assembly.

## Migration Logic From Old MVP

Phase 1:
- preserve old concepts,
- re-model them cleanly.

Phase 2:
- move biomarker rows into row-based lab entries,
- normalize status logic,
- add explicit evidence/confidence/scope fields.

Phase 3:
- let Notion become primarily a human review and summary layer,
- move heavier logic toward shared domain + backend.

## V1 Output Types

The system should produce these outputs first:
1. Weekly self-report summary.
2. Latest biomarker focus summary.
3. Coverage summary.
4. Data freshness summary.
5. Bounded recommendation set.

It should not yet claim:
- diagnosis,
- treatment planning,
- validated clinical risk scoring,
- broad autonomous medical reasoning.

## Immediate Next Build Artifacts

1. Marker classification matrix.
2. Rule hardness matrix.
3. Unit and assay policy matrix.
4. Recommendation contract.
5. Notion database property specification.
6. migration notes from old MVP structure.
