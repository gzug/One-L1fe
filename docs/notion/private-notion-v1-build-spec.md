# Private Notion V1 Build Spec

## Verdict

This file is the practical build sheet for the private Notion V1 workspace.
It is written so the workspace can be created directly in Notion with minimal interpretation.

Use this as the live setup checklist when building the actual Notion workspace.

## Build target

Create one compact workspace with:
- one main dashboard page,
- attached database sub-pages,
- light helper formulas only,
- visible explanations for important data-quality fields,
- and a visible change-log page.

## Top-level page

### Page title
**One L1fe Private Health Dashboard**

### Suggested top-page section order
1. Header / purpose note
2. Current Overview block
3. Biomarker Focus block
4. Weekly block
5. Recommendations block
6. Freshness & Coverage block
7. Quick Actions block
8. Linked database sub-pages section
9. Why This Version Changed section

### Suggested opening text
Use this workspace as the private working version of One L1fe.
It is designed to stay immediately usable in Notion while the deeper calculation and automation layers are built outside Notion over time.

## Sub-pages to create under the main dashboard

Create these as database pages directly under the dashboard:
1. Profiles
2. Lab Panels
3. Lab Entries
4. Weekly Check-Ins
5. Derived Insights
6. Recommendations
7. Context Notes
8. Why This Version Changed

## Database specifications

---

## 1. Profiles

### Database title
**Profiles**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | profile identity |
| Active | Checkbox | yes | active profile marker |
| Interpretation Context | Select | yes | e.g. Male, Female, Other, Context-specific |
| Age Band | Select | no | e.g. 20-29, 30-39, 40-49 |
| Health Goal | Text | no | plain-language main goal |
| Priority Horizon | Select | no | short, medium, long |
| Family History Summary | Text | no | short summary only |
| Exercise Baseline | Number | yes | 0-10 |
| Sleep Baseline | Number | yes | 0-10 |
| Nutrition Baseline | Number | yes | 0-10 |
| Emotional Baseline | Number | yes | 0-10 |
| Constraints | Text | no | practical blockers |
| Readiness | Number | no | 0-10 |
| Lab Panels | Relation | no | relation to Lab Panels |
| Weekly Check-Ins | Relation | no | relation to Weekly Check-Ins |
| Context Notes | Relation | no | relation to Context Notes |

### Suggested first views
- Active Profiles
- All Profiles

---

## 2. Lab Panels

### Database title
**Lab Panels**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | e.g. Apr 2026 Panel |
| Profile | Relation | yes | relation to Profiles |
| Collected At | Date | yes | lab date |
| Source | Text | no | lab/provider/source label |
| Source Type | Select | yes | manual, lab, import, api, other |
| Panel Notes | Text | no | context for the panel |
| Freshness Status | Select | yes | current, recent, aging, stale |
| Interpretation Window End | Date | no | optional helper |
| Lab Entries | Relation | no | relation to Lab Entries |
| Derived Insights | Relation | no | relation to Derived Insights |
| Recommendations | Relation | no | relation to Recommendations |
| Context Notes | Relation | no | optional related context |

### Suggested first views
- Latest Panels
- Stale Panels
- Panels by Profile

---

## 3. Lab Entries

### Database title
**Lab Entries**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | e.g. Apr 2026 ApoB |
| Lab Panel | Relation | yes | relation to Lab Panels |
| Profile | Relation | yes | relation to Profiles |
| Biomarker Key | Select | yes | apob, ldl, hba1c, glucose, lpa, crp, vitamin_d, ferritin, b12, magnesium, dao |
| Marker Class | Select | yes | core, supporting, contextual, deferred |
| Value Numeric | Number | yes | raw measured number |
| Unit | Select | yes | use fixed options only |
| Assay Type | Select | no | especially for CRP / hs-CRP |
| Source Confidence | Select | no | direct lab, imported, manual copy |
| Interpretable | Checkbox | yes | helper field |
| Interpretation Blocker | Text | no | e.g. missing assay type |
| Canonical Status | Select | no | optimal, good, borderline, high, critical, unknown |
| Severity Level | Number | no | 0-4 helper |
| Score Eligible | Checkbox | yes | helper field |
| Policy Notes | Text | no | e.g. LDL fallback if ApoB missing |

### Suggested field guidance
Add property descriptions or nearby callout text for:
- **Unit**: Missing or wrong unit can block clean interpretation.
- **Assay Type**: Some markers need assay clarity before they can be used safely.
- **Interpretable**: Use this to show whether the current row is valid for interpretation.
- **Interpretation Blocker**: Explain clearly why a row cannot be interpreted yet.

### Suggested first views
- Latest Core Marker Entries
- Interpretation Blocked
- Score Eligible Entries
- By Biomarker Key

---

## 4. Weekly Check-Ins

### Database title
**Weekly Check-Ins**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | e.g. Week 15 |
| Profile | Relation | yes | relation to Profiles |
| Week Date | Date | yes | week anchor |
| Exercise | Number | yes | 0-10 |
| Sleep | Number | yes | 0-10 |
| Nutrition | Number | yes | 0-10 |
| Emotional Health | Number | yes | 0-10 |
| Exercise Deviation | Formula | no | current minus baseline |
| Sleep Deviation | Formula | no | current minus baseline |
| Nutrition Deviation | Formula | no | current minus baseline |
| Emotional Deviation | Formula | no | current minus baseline |
| Lowest Pillar | Formula | no | light helper only |
| Secondary Pillar | Formula | no | optional |
| Bottleneck | Select | no | discipline, time, stress, travel, illness, other |
| Biggest Risk | Text | no | short note |
| Intended Action | Text | no | next step |
| Linked Lab Panel | Relation | no | optional relation |
| Weekly Summary | Text | no | simple human summary |

### Suggested first views
- Latest Weekly Check-Ins
- Lowest Pillar Focus
- By Profile

---

## 5. Derived Insights

### Database title
**Derived Insights**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | insight label |
| Profile | Relation | yes | relation to Profiles |
| Insight Kind | Select | yes | trend, focus, pattern, coverage, trigger |
| Source Layer | Select | yes | lab, weekly, mixed |
| Related Lab Panel | Relation | no | optional |
| Related Week | Relation | no | optional |
| Evidence Class | Select | yes | hard, medium, soft |
| Confidence | Select | yes | high, medium, low |
| Scope | Text | yes | what this insight covers |
| Safety State | Select | yes | ready, needs_more_data, uncertain, out_of_scope, safety_handoff |
| Summary | Text | yes | short human summary |
| Structured Evidence | Text | no | why this exists |
| Actionability | Select | yes | high, medium, low |

### Suggested first views
- Current Focus Insights
- Coverage Insights
- Needs More Data

---

## 6. Recommendations

### Database title
**Recommendations**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | recommendation label |
| Profile | Relation | yes | relation to Profiles |
| Recommendation Type | Select | yes | inform, monitor, collect_more_data, behavior_adjustment, clinician_clarification |
| Derived Insight | Relation | yes | relation to Derived Insights |
| Verdict | Text | yes | short conclusion |
| Recommendation Text | Text | yes | next best action |
| Evidence Summary | Text | yes | concise why |
| Confidence | Select | yes | high, medium, low |
| Scope | Text | yes | bounded scope |
| Actionability | Select | yes | high, medium, low |
| Handoff Required | Checkbox | yes | true/false |
| Status | Select | yes | open, done, deferred |

### Suggested first views
- Open Recommendations
- High Actionability
- Handoff Required

---

## 7. Context Notes

### Database title
**Context Notes**

### Properties
| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Title | yes | short label |
| Profile | Relation | yes | relation to Profiles |
| Date | Date | yes | context date |
| Context Type | Select | yes | work stress, sleep disruption reason, illness, travel, training load, nutrition disruption, medication change, supplement change, other |
| Related Week | Relation | no | optional relation |
| Related Lab Panel | Relation | no | optional relation |
| Summary | Text | yes | short visible explanation |
| Details | Text | no | more detail |
| Relevance Level | Select | no | high, medium, low |

### Suggested first views
- Latest Context Notes
- Sleep Context
- Stress Context
- Panel-Linked Context

---

## 8. Why This Version Changed

### Page type
Standard page, not a database.

### Recommended structure
Use repeating sections with these subheadings:
- Before
- Now
- Removed or downgraded
- Why this changed
- What happens later outside Notion

### Suggested initial blocks
- Workspace shape
- Lab structure
- Missing data handling
- ApoB / LDL logic
- Unit and assay visibility
- Weekly and context layer
- Dashboard logic

## Recommended Notion formulas to keep light

Safe helper formulas:
- weekly baseline deviations
- lowest pillar
- simple freshness labels
- simple summary assembly
- simple rollup counts

Avoid rebuilding in formulas:
- full marker threshold logic
- unit conversion logic
- assay gating trees
- complex recommendation generation
- complex score weighting system

## Suggested dashboard linked views

### Current Overview block
Use linked views for:
- Active Profiles
- Latest Panels
- Open Recommendations

### Biomarker Focus block
Use linked view for:
- Latest Core Marker Entries
- grouped or filtered by latest panel

### Weekly block
Use linked view for:
- Latest Weekly Check-Ins

### Recommendations block
Use linked view for:
- Open Recommendations
- Handoff Required

### Freshness & Coverage block
Use linked views for:
- Stale Panels
- Interpretation Blocked entries
- Coverage Insights

### Quick Actions block
Create text links or buttons to:
- New Lab Panel
- New Lab Entry
- New Weekly Check-In
- New Context Note

## Build checklist

- [ ] create main dashboard page
- [ ] create Profiles database
- [ ] create Lab Panels database
- [ ] create Lab Entries database
- [ ] create Weekly Check-Ins database
- [ ] create Derived Insights database
- [ ] create Recommendations database
- [ ] create Context Notes database
- [ ] create Why This Version Changed page
- [ ] add relations
- [ ] add light helper formulas only
- [ ] add field guidance for unit and assay-sensitive fields
- [ ] add linked views to the dashboard

## Final note

This build spec is for the private transition version.
It should be good enough to work now, but clean enough that later app and backend work can inherit its structure instead of starting over.
