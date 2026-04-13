# V1 Decision Tables

## Verdict

V1 needs a small set of deterministic decision tables before code starts spreading policy across random conditionals.

These tables define the exact runtime branching shape for the first implementation slice.
They are not final thresholds.
They are final control-flow intent for V1.

## How to use this file

Use these tables for:
- rule-engine implementation
- fixture design
- serializer behavior
- negative-path tests
- backend and domain alignment

Use the rule matrix for policy names.
Use this file for decision order.

---

## Table 1. Universal entry interpretability gate

Apply this before any marker-specific interpretation.

| Step | Check | If yes | If no |
| --- | --- | --- | --- |
| 1 | raw value present? | continue | state = `missing`, emit coverage note |
| 2 | unit usable for this marker? | continue | state = `interpretation_limited`, emit `COV-002` |
| 3 | assay metadata required for this marker? | if yes, check step 4 | skip to step 5 |
| 4 | required assay metadata present? | continue | state = `interpretation_limited`, emit `COV-003` |
| 5 | collected date present? | continue | freshness = `unknown`, continue with caution |
| 6 | freshness still valid for active use? | continue | freshness = `stale`, emit `COV-004`, block score contribution |
| 7 | acute-context exclusion relevant? | if yes, evaluate marker table | mark interpretable |

### Output rule
If any blocking gate fails, do not assign canonical status or severity unless the specific marker table explicitly allows a limited safe label.

---

## Table 2. ApoB and LDL lipid hierarchy

| ApoB interpretable? | LDL interpretable? | Primary lipid driver | LDL score contribution | Required outputs |
| --- | --- | --- | --- | --- |
| yes | yes | ApoB | no duplicate primary contribution | show LDL as secondary lens only |
| yes | no | ApoB | none | emit LDL coverage or interpretation-limited note if applicable |
| no | yes | LDL fallback path | yes, bounded fallback | emit ApoB-missing coverage note |
| no | no | none | none | emit collect-more-data lipid coverage output |

### Consequences
- ApoB wins when present and interpretable.
- LDL must not create a second co-equal lipid score when ApoB is already driving the story.
- Missing ApoB is a coverage problem, not a severity multiplier.

---

## Table 3. ApoB runtime decision table

| Condition | Interpretable state | Canonical status | Score eligible | Recommendation posture |
| --- | --- | --- | --- | --- |
| value missing | missing | unknown | no | collect_more_data |
| unit missing | interpretation_limited | unknown | no | collect_more_data |
| stale panel | interpretable or limited, but stale | existing status may be stored, not used as current score input | no | collect_more_data or monitor |
| value interpretable and within target | interpretable | optimal or good | yes | inform |
| value interpretable and above target | interpretable | borderline, high, or critical | yes | inform, behavior_adjustment, clinician_clarification |

---

## Table 4. LDL runtime decision table

| Condition | LDL role | Score eligible | Required note |
| --- | --- | --- | --- |
| ApoB interpretable | secondary lens | no duplicate primary contribution | explain ApoB-primary logic |
| ApoB missing and LDL interpretable | fallback lipid driver | yes, bounded fallback | explain fallback status |
| LDL missing or limited | none | no | coverage or interpretation-limited note |

---

## Table 5. HbA1c unit-format handling

| Unit / format state | Action |
| --- | --- |
| explicit percent | interpret under percent threshold path |
| explicit mmol/mol | interpret under mmol/mol path or explicit conversion path |
| ambiguous or missing format | interpretation_limited, no score contribution, collect_more_data |

### Consequences
- Percent and mmol/mol must not be mixed silently.
- Threshold logic must remain versioned and explicit.

---

## Table 6. Glucose context handling

| Input state | Interpretation behavior | Score behavior | Recommendation posture |
| --- | --- | --- | --- |
| unit missing | interpretation_limited | no | collect_more_data |
| unit present, fasting context unknown | bounded interpretation with context caveat | yes if policy allows | inform or collect_more_data |
| unit present, fasting context known and suitable | normal interpretation | yes | inform, behavior_adjustment |
| stale panel | stale | no | monitor or collect_more_data |

### V1 note
Fasting context is preferred, not mandatory, for the first bounded implementation slice.
If absent, keep the language honest.

---

## Table 7. Lp(a) bounded modifier logic

| Condition | Interpretation behavior | Score behavior | Recommendation posture |
| --- | --- | --- | --- |
| value missing | optional missing state only | no penalty | no recurring missing recommendation required |
| unit missing | interpretation_limited | no | collect_more_data if useful |
| value present in supported unit and below policy threshold | interpretable | no major score role | inform only if surfaced |
| value present in supported unit and elevated | bounded inherited-risk flag | bounded modifier only | inform or clinician_clarification |
| unsupported conversion need between mg/dL and nmol/L | interpretation_limited | no | collect_more_data |

### Consequences
- Lp(a) is not a recurring completeness burden.
- Unit strictness matters more than broad optimization logic in V1.

---

## Table 8. hs-CRP / CRP assay gating

| Marker label / context | Assay known? | Acute context likely? | Interpretation outcome | Score behavior |
| --- | --- | --- | --- | --- |
| hs-CRP | yes | no | interpretable | limited bounded modifier allowed |
| hs-CRP | yes | yes | acute-phase exclusion or monitor state | no |
| hs-CRP | no | either | interpretation_limited | no |
| CRP generic | no | either | interpretation_limited | no |
| CRP generic | yes but unsuitable for preventive baseline | bounded note only | no |

### Consequences
- Unknown assay blocks preventive scoring.
- Likely acute-phase results must not behave like stable baseline cardiometabolic signals.

---

## Table 9. Ferritin context gate

| Ferritin state | Context available? | Interpretation outcome | Score behavior | Recommendation posture |
| --- | --- | --- | --- | --- |
| elevated | no | contextual note only | no | inform, collect_more_data |
| elevated | yes, partial | contextual note with caveat | no | inform |
| elevated | yes, sufficient inflammation/liver/iron context | gated contextual escalation | no | inform, clinician_clarification |
| low | yes or no | more directly interpretable support path | no | inform, monitor |

### Consequence
High ferritin alone is not a hard-priority signal in V1.

---

## Table 10. Vitamin D bounded policy table

| Vitamin D state | Interpretation posture | Score behavior | Recommendation posture |
| --- | --- | --- | --- |
| deficiency range | stronger bounded support | no | inform, monitor, behavior_adjustment |
| adequate range | neutral or adequate note | no | inform |
| adequate but below product optimization preference | soft policy note only | no | inform, monitor |
| high or excess-caution range | safety-oriented caution note | no | inform, clinician_clarification |

### Consequence
Deficiency and excess caution are stronger than optimization preferences.

---

## Table 11. Coverage and freshness summary table

| Entry states present in panel | Coverage summary |
| --- | --- |
| all required slice markers interpretable and fresh | complete |
| at least one required marker missing | partial or missing |
| at least one required marker interpretation-limited | interpretation_limited |
| all required markers present but panel stale | stale |
| mixed states | partial with explicit notes |

### Required note categories
- missing core marker
- missing unit
- missing assay
- stale panel
- optional marker skipped

---

## Table 12. Recommendation eligibility by rule class

| Rule class | Inform | Monitor | Collect more data | Behavior adjustment | Clinician clarification |
| --- | --- | --- | --- | --- | --- |
| hard core rule | yes | yes | yes | yes | yes |
| medium bounded rule | yes | yes | yes | conditional | conditional |
| soft / heuristic rule | yes, bounded | yes, bounded | yes | no unless explicitly allowed | no |
| coverage rule | yes, bounded | conditional | yes | no | no |

### Consequences
- Stronger recommendation types must be blocked by default for soft and coverage-only rules.
- Recommendation type must be validated against the originating rule, not only against the marker.

---

## Table 13. Priority Score inclusion table for the minimum slice

| Marker | Interpretable and fresh required? | Default score role | Inclusion rule |
| --- | --- | --- | --- |
| ApoB | yes | primary | include when interpretable and fresh |
| HbA1c | yes | primary | include when interpretable and fresh |
| Glucose | yes | primary | include when interpretable and fresh |
| LDL | yes | fallback | include only when ApoB is missing or separate-lens policy explicitly active |
| Lp(a) | yes | bounded_modifier | never major recurring contribution |
| hs-CRP | yes plus assay validity and non-acute context | bounded_modifier | include only under full gate success |

---

## Table 14. Minimum provenance attachment table

| Output object | Required provenance fields |
| --- | --- |
| interpreted entry | rule_id, rule_version |
| score contribution | rule_id, rule_version, score_version |
| recommendation | rule_id, rule_version, anchor_source_id, confidence, scope |
| interpretation-limited or coverage output | rule_id, rule_version, blocking_reason |

---

## Immediate test fixture set implied by these tables

1. ApoB present, LDL present, both interpretable -> ApoB drives, LDL visible but not co-scored
2. ApoB missing, LDL present -> LDL bounded fallback plus ApoB coverage recommendation
3. HbA1c with ambiguous format -> interpretation_limited, no score contribution
4. hs-CRP value without assay -> interpretation_limited, no score contribution
5. Lp(a) elevated with explicit unit -> bounded modifier only
6. Ferritin elevated without context -> contextual note only
7. Stale otherwise-valid panel -> stale coverage path, no current score contribution

## Definition of done

These decision tables are doing their job when a developer can implement the minimum slice without guessing:
- branch order,
- fallback logic,
- score inclusion,
- or recommendation boundaries.
