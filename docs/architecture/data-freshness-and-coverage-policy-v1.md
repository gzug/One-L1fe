# Data Freshness and Coverage Policy V1

## Verdict

The old MVP mixed data presence and data seriousness too easily.
V1 must clearly separate:
- whether data exists,
- whether data is still fresh enough to use,
- whether data is interpretable,
- whether data is strong enough to drive recommendations.

## Coverage vs Severity

### Coverage
Coverage answers:
- do we have the data?
- is it fresh enough?
- is the unit present?
- is the assay known where needed?

### Severity
Severity answers:
- how concerning is the value itself?

Rule:
Coverage gaps must not inflate severity.

## Coverage States

Recommended V1 states:
- complete
- partial
- missing
- interpretation_limited
- stale

### Meaning
- `complete`: enough usable data exists for the intended view
- `partial`: some useful data exists, but important pieces are missing
- `missing`: required data is absent
- `interpretation_limited`: value exists, but unit, assay, or context is insufficient
- `stale`: value exists, but is too old to act as current state without warning

## Freshness States

Recommended V1 freshness labels:
- current
- recent
- aging
- stale
- unknown

## Suggested Lab Freshness Windows

These are V1 operating windows, not universal clinical truth.

### Static or infrequent markers
Examples:
- Lp(a)
- genotype

Suggested handling:
- do not mark as weekly missing,
- keep as long-lived context,
- refresh only when clinically meaningful.

### Slow-moving markers
Examples:
- ApoB
- HbA1c
- ferritin
- vitamin D

Suggested handling:
- `current`: within 90 days
- `recent`: 91-180 days
- `aging`: 181-365 days
- `stale`: more than 365 days

### Faster-moving markers
Examples:
- CRP / hs-CRP
- glucose under changing conditions

Suggested handling:
- `current`: within 30 days
- `recent`: 31-90 days
- `aging`: 91-180 days
- `stale`: more than 180 days

## Weekly Linkage Rule

A weekly check-in may link a lab panel.
But the weekly output must surface freshness rather than silently treating all lab data as current.

Examples:
- "latest lipid panel is recent"
- "linked inflammation marker is stale"
- "biomarker interpretation limited due to missing assay"

## Coverage-Driven Recommendation Types

Coverage problems may create these outputs:
- collect_more_data
- inform
- monitor

Coverage problems should not directly create:
- strong behavior change advice,
- risk-like escalation,
- pseudo-severity scoring.

## Required Coverage Checks for V1

### Lab entry level
- value present
- unit present
- assay present when required
- marker class known
- score eligibility known

### Panel level
- profile linked
- collection date present
- source present or intentionally unknown
- freshness state derivable

### Weekly level
- profile linked
- 4 weekly pillar values present
- linked panel freshness visible if panel exists

## Beginner Explanation

Old system:
- if something was missing, the output could feel more alarming than it should.

New system:
- the system first asks a simpler question:
  - do we actually have enough good data to talk about this?

That improves the MVP because it becomes:
- more honest,
- less confusing,
- and less likely to treat missing data like a health problem.
