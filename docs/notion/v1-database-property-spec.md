# V1 Database Property Specification

## Verdict

This document defines the first serious Notion V1 property model for One L1fe.
It is intentionally simpler than a full production system, but much cleaner than the old MVP tables.

## 1. Profiles

Purpose:
Store stable human baseline context.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | profile identity | Maximilian Opp |
| Active | Checkbox | yes | current active profile | true |
| Interpretation Context | Select | yes | sex/gender or interpretation context used for marker rules when needed | Male |
| Age Band | Select | no | softer age framing for interpretation | 30-39 |
| Health Goal | Text | no | plain-language main goal | Live long and good |
| Priority Horizon | Select | no | short, medium, long | Long-term |
| Family History Summary | Text | no | condensed family context | Cardiovascular disease |
| Exercise Baseline | Number | yes | weekly anchor 0-10 | 8 |
| Sleep Baseline | Number | yes | weekly anchor 0-10 | 7 |
| Nutrition Baseline | Number | yes | weekly anchor 0-10 | 6 |
| Emotional Baseline | Number | yes | weekly anchor 0-10 | 9 |
| Constraints | Text | no | biggest practical blockers | Discipline |
| Readiness | Number | no | readiness 0-10 | 9 |
| Weekly Check-Ins | Relation | no | linked weekly rows | Week 14 |
| Lab Panels | Relation | no | linked lab panels | Apr 2025 Panel |

## 2. Lab Panels

Purpose:
Store one lab event per row.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | panel label | Apr 2025 Panel |
| Profile | Relation | yes | owner profile | Maximilian Opp |
| Collected At | Date | yes | collection date | 2025-04-18 |
| Source | Text | no | lab/source text | ALAB blood test |
| Source Type | Select | yes | manual, import, lab, API, other | lab |
| Panel Notes | Text | no | context notes | Post H. pylori phase |
| Freshness Status | Formula/Select | yes | current, recent, aging, stale | aging |
| Interpretation Window End | Date | no | expected freshness boundary | 2025-07-18 |
| Lab Entries | Relation | no | linked measurement rows | LDL entry |
| Derived Insights | Relation | no | linked insights | Cardiovascular focus |
| Recommendations | Relation | no | linked recommendation rows | Collect ApoB |

## 3. Lab Entries

Purpose:
Store one biomarker result per row.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | row label | Apr 2025 LDL |
| Lab Panel | Relation | yes | parent panel | Apr 2025 Panel |
| Profile | Relation | yes | owner profile | Maximilian Opp |
| Biomarker Key | Select | yes | canonical marker key | ldl |
| Marker Class | Select | yes | core, supporting, contextual, deferred | core |
| Value Numeric | Number | yes | raw measured value | 133 |
| Unit | Select | yes | exact unit | mg/dL |
| Assay Type | Select | no | assay/method when relevant | hs-CRP |
| Source Confidence | Select | no | direct lab, imported, manual copy | direct lab |
| Interpretable | Checkbox | yes | whether logic may interpret it | true |
| Interpretation Blocker | Text | no | why interpretation is limited | missing assay type |
| Canonical Status | Select | no | optimal, good, borderline, high, critical, missing | high |
| Severity Level | Number | no | normalized 0-4 severity | 3 |
| Score Eligible | Checkbox | yes | whether allowed in first priority score | true |
| Evidence Class | Select | yes | hard, medium, soft | hard |
| Score Weight Version | Select | no | policy version reference | v1 |
| Weighted Priority Contribution | Number | no | contribution to V1 priority score | 3 |
| Policy Notes | Text | no | special interpretation constraints | LDL as fallback if ApoB missing |

## 4. Weekly Check-Ins

Purpose:
Store one weekly self-report row.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | week label | Week 14 |
| Profile | Relation | yes | owner profile | Maximilian Opp |
| Week Date | Date | yes | week anchor | 2026-03-29 |
| Exercise | Number | yes | 0-10 self score | 8 |
| Sleep | Number | yes | 0-10 self score | 6 |
| Nutrition | Number | yes | 0-10 self score | 8 |
| Emotional Health | Number | yes | 0-10 self score | 9 |
| Exercise Deviation | Formula | yes | current minus baseline | 0 |
| Sleep Deviation | Formula | yes | current minus baseline | -1 |
| Nutrition Deviation | Formula | yes | current minus baseline | 2 |
| Emotional Deviation | Formula | yes | current minus baseline | 0 |
| Lowest Pillar | Formula | yes | weakest current area | Sleep |
| Secondary Pillar | Formula | no | second weakest area | Exercise |
| Suggested Focus | Formula/Text | no | simple focus text | Focus: Sleep |
| Bottleneck | Select | no | blocker type | Discipline |
| Biggest Risk | Text | no | free text risk | sleep consistency |
| Intended Action | Text | no | user chosen action | fix wake-up time |
| Linked Lab Panel | Relation | no | optional panel link | Apr 2025 Panel |
| Biomarker Freshness Note | Rollup/Formula | no | whether linked labs are still current | aging |
| Weekly Summary | Formula/Text | no | assembled human summary | Focus this week: Sleep |

## 5. Derived Insights

Purpose:
Structured interpretation, separated from raw data.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | insight label | Cardiovascular follow-up focus |
| Profile | Relation | yes | owner profile | Maximilian Opp |
| Insight Kind | Select | yes | trend, focus, pattern, coverage, trigger | focus |
| Source Layer | Select | yes | lab, weekly, mixed | lab |
| Related Lab Panel | Relation | no | linked panel | Apr 2025 Panel |
| Related Week | Relation | no | linked week | Week 14 |
| Evidence Class | Select | yes | hard, medium, soft | hard |
| Confidence | Select | yes | high, medium, low | medium |
| Scope | Select/Text | yes | what this covers and what not | lipid follow-up only |
| Safety State | Select | yes | ready, needs_more_data, uncertain, out_of_scope, safety_handoff | needs_more_data |
| Summary | Text | yes | structured human-readable summary | LDL elevated, ApoB missing |
| Structured Evidence | Text | no | why this exists | LDL 133 mg/dL, ApoB not measured |
| Actionability | Select | yes | high, medium, low | high |

## 6. Recommendations

Purpose:
Bounded next-step actions.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | recommendation label | Collect ApoB next panel |
| Profile | Relation | yes | owner profile | Maximilian Opp |
| Recommendation Type | Select | yes | inform, monitor, collect_data, behavior_adjustment, clinician_clarification | collect_data |
| Derived Insight | Relation | yes | originating insight | Cardiovascular follow-up focus |
| Verdict | Text | yes | short verdict | lipid picture incomplete |
| Recommendation Text | Text | yes | next best action | add ApoB on next blood draw |
| Evidence Summary | Text | yes | concise basis | LDL above target, ApoB missing |
| Confidence | Select | yes | high, medium, low | medium |
| Scope | Text | yes | bounded scope | preventive lipid follow-up |
| Actionability | Select | yes | high, medium, low | high |
| Handoff Required | Checkbox | yes | whether clinician clarification is needed | false |
| Status | Select | yes | open, done, deferred | open |

## 7. Source Registry

Purpose:
Track where important policy choices came from.

| Property | Type | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| Name | Title | yes | source label | ApoB causal evidence |
| Topic | Select | yes | lipid, inflammation, metabolic, training, architecture | lipid |
| Source Type | Select | yes | paper, guideline, review, book, summary | review |
| Quality Score | Number | no | internal quality estimate | 10 |
| Supports Rule | Text | no | what logic this supports | ApoB primary over LDL |
| Notes | Text | no | caveats or context | use for preventive policy |

## Beginner Explanation

Old system:
- one big biomarker table tried to do almost everything at once.

New system:
- each type of thing gets its own home.
- profile data stays in profile rows.
- one lab event becomes one panel.
- each biomarker result becomes its own row.
- interpretations and recommendations are separate rows.

Why this is better:
- easier to understand,
- easier to debug,
- easier to automate later,
- much less hidden logic,
- fewer errors when the system grows.
