# V1 Implementation Rule Inventory

## Verdict

The next implementation step is not more philosophy.
It is a stable runtime inventory that tells the code:
- which inputs each rule needs,
- what blocks interpretation,
- what the rule is allowed to output,
- whether it may affect the Priority Score,
- and what provenance must be attached.

This file turns the V1 rule posture into implementation-safe inventory rows.

## Purpose

Use this inventory as the bridge between:
- `docs/architecture/v1-rule-matrix.md`
- `docs/architecture/measurement-interpretation-policy.md`
- `docs/architecture/priority-score-v1.md`
- runtime rule configuration
- test fixtures
- recommendation serialization

It is intentionally more operational than the rule matrix.
The rule matrix explains policy.
This inventory explains what the engine must actually do.

## Runtime field expectations

Every evaluated entry should be able to expose at least:
- `rule_id`
- `rule_version`
- `marker`
- `value`
- `unit`
- `assay_type` when relevant
- `interpretable_state`
- `freshness_state`
- `canonical_status`
- `severity`
- `score_eligible`
- `recommendation_types_allowed`
- `origin`
- `anchor_source_id`

Recommended enums:
- `interpretable_state`: `interpretable | interpretation_limited | missing`
- `freshness_state`: `current | recent | aging | stale | unknown`
- `canonical_status`: `optimal | good | borderline | high | critical | unknown`
- `severity`: `0 | 1 | 2 | 3 | 4 | null`

## Rule inventory

| Rule ID | Marker / domain | Purpose | Minimum required inputs | Blocking gates | Canonical output expectation | Score behavior | Recommendation types allowed | Provenance minimum |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIP-001 | ApoB | primary lipid interpretation | value, unit, collected_at | missing value, missing unit, stale panel | status + severity + interpretable state | yes, primary lipid contributor | inform, behavior_adjustment, clinician_clarification | rule_id, rule_version, anchor_source_id |
| LIP-002 | LDL | fallback or secondary lipid lens | value, unit, collected_at, ApoB presence state | missing value, missing unit, stale panel | status + severity + fallback/secondary note | conditional only | inform, collect_more_data, behavior_adjustment | rule_id, rule_version, anchor_source_id |
| LIP-003 | ApoB missing | coverage signal for lipid story | panel context, ApoB presence state | none beyond context detection | coverage note, not severity | no | collect_more_data | rule_id, rule_version |
| LIP-004 | Lp(a) elevated | bounded inherited-risk modifier | value, unit, collected_at | missing unit, stale panel, unsupported unit path | bounded modifier or informational flag | limited modifier only | inform, clinician_clarification | rule_id, rule_version, anchor_source_id |
| MET-001 | HbA1c | metabolic interpretation | value, explicit unit format, collected_at | missing value, missing unit, unsupported format, stale panel | status + severity + interpretable state | yes | inform, behavior_adjustment, clinician_clarification | rule_id, rule_version, anchor_source_id |
| MET-002 | Glucose | glucose interpretation | value, unit, collected_at, optional fasting_context | missing value, missing unit, stale panel | status + severity + context note | yes | inform, behavior_adjustment, collect_more_data | rule_id, rule_version, anchor_source_id |
| INF-001 | hs-CRP elevated | bounded inflammation support | value, unit, assay_type, collected_at | missing assay, stale panel, likely acute context | status or limited interpretation note | limited only when assay-valid and context-suitable | inform, monitor, clinician_clarification | rule_id, rule_version, anchor_source_id |
| INF-002 | CRP without assay clarity | protect against over-interpretation | value present, assay missing or ambiguous | none | interpretation-limited state | no | collect_more_data, inform | rule_id, rule_version |
| INF-003 | acute-phase inflammation gate | exclude unstable inflammatory context | value, assay if known, acute_context signals | none | exclusion or monitor note | no | collect_more_data, monitor, clinician_clarification | rule_id, rule_version |
| SUP-001 | Vitamin D deficiency | bounded deficiency support | value, unit, collected_at | missing unit, stale panel | deficiency/adequacy status | no | inform, monitor, behavior_adjustment | rule_id, rule_version, anchor_source_id |
| SUP-002 | Vitamin D optimization gap | softer policy-only optimization note | value, unit, collected_at | missing unit, stale panel | policy-gap note, not hard status escalation | no | inform, monitor | rule_id, rule_version, anchor_source_id |
| CTX-001 | Ferritin elevated | contextual ferritin flag | value, unit, collected_at | missing unit, stale panel | contextual note only | no | inform, collect_more_data | rule_id, rule_version, anchor_source_id |
| CTX-002 | Ferritin elevated with context | gated ferritin escalation | ferritin, CRP or inflammation context, liver or iron context | incomplete context gate | contextual escalation with caveat | no | inform, clinician_clarification | rule_id, rule_version, anchor_source_id |
| CTX-003 | B12 low | contextual deficiency support | value, unit, collected_at | missing unit, stale panel | bounded status note | no | inform, monitor, behavior_adjustment | rule_id, rule_version, anchor_source_id |
| CTX-004 | Magnesium low | bounded magnesium support | value, unit, collected_at | missing unit, stale panel | bounded status note | no | inform, monitor | rule_id, rule_version, anchor_source_id |
| CTX-005 | DAO low | contextual-only interpretation | value, unit, collected_at | missing unit, stale panel | contextual note only | no | inform, monitor | rule_id, rule_version, anchor_source_id |
| WEE-001 | Weekly sleep below baseline | self-report coaching signal | weekly sleep score, baseline or prior comparison | insufficient weekly data | heuristic weekly note | no | inform, behavior_adjustment | rule_id, rule_version |
| WEE-002 | Weekly lowest pillar | coaching prioritization | weekly pillar set | invalid or incomplete weekly data | heuristic weekly note | no | inform, behavior_adjustment | rule_id, rule_version |
| WEE-003 | Repeated weak pillar | repeated self-report trend | 2+ weekly observations | insufficient cadence | heuristic trend note | no | inform, behavior_adjustment, monitor | rule_id, rule_version |
| WEE-004 | Linked biomarker freshness stale | show stale labs in weekly view | linked lab date | none | freshness note only | no | collect_more_data, inform | rule_id, rule_version |
| COV-001 | Missing core lipid data | separate coverage from severity | lipid context + missing ApoB | none | coverage warning | no | collect_more_data | rule_id, rule_version |
| COV-002 | Unit missing | protect unsafe interpretation | marker, raw value | none | interpretation-limited state | no | collect_more_data | rule_id, rule_version |
| COV-003 | Assay missing | protect assay-sensitive interpretation | marker, raw value | none | interpretation-limited state | no | collect_more_data | rule_id, rule_version |
| COV-004 | Stale panel | freshness guard | collected_at | none | stale state + freshness note | no | collect_more_data, monitor | rule_id, rule_version |

## Shared implementation consequences

### 1. Interpretability must be computed before status
Do not assign canonical status or severity until the engine has checked:
- value presence,
- usable unit,
- assay metadata where relevant,
- and freshness eligibility.

### 2. Coverage must never masquerade as severity
Missing ApoB, missing units, missing assay, and stale panels must emit:
- coverage notes,
- interpretation-limited states,
- or collect-more-data recommendations,
not pseudo-high severity.

### 3. Score eligibility is a separate decision
A marker may be:
- interpretable but not score-eligible,
- score-eligible only under conditions,
- or excluded despite being present.

### 4. Recommendation eligibility is stricter than interpretation eligibility
A row may be interpretable but still blocked from stronger outputs if:
- rule hardness is too soft,
- evidence posture is too weak,
- the marker is contextual only,
- or the intended-use boundary would be stretched.

### 5. Provenance is required for active rules
Every active non-coverage rule should carry:
- `rule_id`
- `rule_version`
- `origin`
- `anchor_source_id`
- optional `supporting_source_ids`

## Required supporting enums for runtime config

### Marker role
- `core`
- `supporting`
- `contextual`
- `weekly`
- `coverage`

### Score role
- `primary`
- `fallback`
- `bounded_modifier`
- `excluded`

### Recommendation eligibility class
- `full`
- `bounded`
- `coverage_only`
- `blocked`

## Immediate build order enabled by this file

1. add shared marker registry projection
2. add interpretability gate helpers
3. add canonical status mappers for ApoB, LDL, HbA1c, and glucose
4. add bounded modifier handling for Lp(a)
5. add assay and acute-context gates for hs-CRP
6. add recommendation serializer with eligibility guardrails
7. add provenance fields to interpretation output

## Definition of done for the inventory layer

This layer is complete when:
- every V1 rule has explicit required inputs,
- every blocking gate is machine-readable,
- score eligibility is deterministic,
- recommendation allowances are explicit,
- and fixtures can be built from this file without guessing hidden policy.
