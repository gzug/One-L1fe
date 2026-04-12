# V1 Rule Matrix

## Verdict

V1 rules should be simple, testable, and explicit.
They should not try to act like a hidden medical expert system.

## Rule Columns

- Rule ID
- Marker / Domain
- Trigger
- Conditions
- Hardness
- Score Eligible
- Allowed Output Type
- Notes

## Biomarker Rules

| Rule ID | Marker / Domain | Trigger | Conditions | Hardness | Score Eligible | Allowed Output Type | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LIP-001 | ApoB | value above target policy | unit known, interpretable | hard | yes | inform, behavior_adjustment, clinician_clarification | primary lipid rule |
| LIP-002 | LDL | value above target policy | ApoB missing or LDL intentionally viewed as secondary lens | hard | conditional | inform, collect_more_data, behavior_adjustment | avoid double-counting |
| LIP-003 | ApoB missing | no ApoB in relevant lipid workup | lipid context present | hard | no | collect_more_data | missing is coverage state |
| LIP-004 | Lp(a) elevated | value above unit-specific threshold | unit explicit, interpretable, one-time logic | medium | limited | inform, clinician_clarification | bounded inherited risk-enhancing flag, no recurring missing penalty |
| MET-001 | HbA1c above target policy | interpretable value present | unit explicit | hard | yes | inform, behavior_adjustment, clinician_clarification | core metabolic rule |
| MET-002 | Glucose above target policy | interpretable value present | fasting context preferred, unit explicit | hard | yes | inform, behavior_adjustment, collect_more_data | bounded output only |
| INF-001 | hs-CRP elevated | value above target policy | assay known, interpretable, preventive context suitable | medium | limited | inform, monitor, clinician_clarification | supporting marker, not a major recurring score axis |
| INF-002 | CRP without assay clarity | value exists | assay unknown | hard | no | collect_more_data, inform | interpretation limited |
| INF-003 | hs-CRP likely acute-phase result | value strongly elevated or acute context present | hs-CRP or CRP exists | hard | no | collect_more_data, monitor, clinician_clarification | do not treat as stable preventive baseline |
| SUP-001 | Vitamin D deficiency | value below deficiency threshold | unit explicit | medium | no | inform, monitor, behavior_adjustment | deficiency-first policy |
| SUP-002 | Vitamin D optimization gap | value in adequate-but-below-policy-target range | unit explicit | soft | no | inform, monitor | policy preference, not universal consensus |
| CTX-001 | Ferritin elevated | interpretable value present | context gate incomplete | medium | no | inform, collect_more_data | do not escalate alone |
| CTX-002 | Ferritin elevated with context | ferritin elevated plus context signals | CRP/liver/iron context available | medium | no | inform, clinician_clarification | still contextual, not hard core score |
| CTX-003 | B12 low | interpretable value present | unit explicit | medium | no | inform, monitor, behavior_adjustment | contextual deficiency support |
| CTX-004 | Magnesium low | interpretable value present | unit explicit | soft | no | inform, monitor | bounded interpretation |
| CTX-005 | DAO low | contextual marker abnormal | unit explicit | soft | no | inform, monitor | experimental or contextual only |

## Weekly Rules

| Rule ID | Marker / Domain | Trigger | Conditions | Hardness | Score Eligible | Allowed Output Type | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WEE-001 | Weekly sleep below baseline | sleep deviation negative | at least one weekly check-in | medium | no | inform, behavior_adjustment | self-report layer only |
| WEE-002 | Weekly lowest pillar | one pillar lower than others | valid weekly scores present | medium | no | inform, behavior_adjustment | simple coaching layer, heuristic not biomedical rule |
| WEE-003 | Repeated weak pillar | same pillar weak for 2+ weeks | enough weekly data | medium | no | inform, behavior_adjustment, monitor | useful trend trigger |
| WEE-004 | Linked biomarker freshness stale | linked panel too old | linked panel exists | hard | no | collect_more_data, inform | weekly should surface stale data |

## Coverage Rules

| Rule ID | Marker / Domain | Trigger | Conditions | Hardness | Score Eligible | Allowed Output Type | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| COV-001 | Missing core lipid data | ApoB absent in lipid context | no recent ApoB result | hard | no | collect_more_data | coverage, not severity |
| COV-002 | Unit missing | measurement row lacks unit | raw value exists | hard | no | collect_more_data | cannot interpret safely |
| COV-003 | Assay missing | assay-dependent marker lacks assay type | raw value exists | hard | no | collect_more_data | especially relevant for CRP and assay-sensitive markers |
| COV-004 | Stale panel | panel exceeds freshness window | date exists | hard | no | collect_more_data, monitor | stale is not current |

## Beginner Explanation

Old system:
- many decisions were hidden inside formulas and long text blocks.

New system:
- each important decision becomes a named rule.
- every rule says:
  - what triggers it,
  - how strong it is,
  - whether it can affect score,
  - what kind of output it is allowed to create.

Why this is better:
- much easier to inspect,
- much easier to improve,
- safer,
- easier to anchor to evidence,
- and far less magical.
