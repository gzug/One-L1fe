# Old MVP to V1 Migration Map

## Verdict

The old Notion MVP was useful as a thinking tool, but too much logic was packed into too few places.
The new V1 keeps the good shape while reducing hidden assumptions and making the system more durable.

## Old Structure

Main elements in old setup:
- Final MVP Marker Set
- Health Profile Biomarkers (Baseline)
- Biomarker Panel
- Weekly Health Reports
- Weekly Health Dashboard
- Biomarker Explanation

## New Structure

New V1 elements:
- Marker Policy
- Profiles
- Lab Panels
- Lab Entries
- Weekly Check-Ins
- Derived Insights
- Recommendations
- Overview / Dashboard
- Source Registry

## Direct Mapping

| Old Element | New V1 Destination | What changes |
| --- | --- | --- |
| Final MVP Marker Set | Marker Policy + Source Registry | thresholds become explicit policy, not just page text |
| Health Profile Biomarkers | Profiles | baseline remains, but cleaner and narrower |
| Biomarker Panel | Lab Panels + Lab Entries + Derived Insights + Recommendations | split one overloaded table into clearer layers |
| Weekly Health Reports | Weekly Check-Ins + optional Derived Insights | keep weekly check-in logic, remove hidden complexity |
| Weekly Health Dashboard | Overview / Dashboard | display layer only |
| Biomarker Explanation | Explanation layer / docs | stays explanatory, not computational |

## Biggest Structural Changes

### 1. Giant biomarker table becomes two data layers plus two output layers

Old:
- one row had many biomarker columns,
- status logic,
- score logic,
- text logic,
- recommendation logic,
- all bundled together.

New:
- one panel row per lab event,
- one lab-entry row per biomarker,
- derived insights separate,
- recommendations separate.

Why better:
- much easier to update,
- easier to add new markers later,
- much easier to validate,
- better for automation and backend migration.

### 2. Missing data no longer behaves like a disease signal

Old:
- missing markers often added penalty-style pressure into the score.

New:
- missing becomes coverage state,
- coverage can create a "collect more data" recommendation,
- but missing is no longer treated like the body is worse.

Why better:
- more honest,
- less misleading,
- avoids fake severity.

### 3. ApoB and LDL are no longer treated too similarly

Old:
- both could effectively contribute in a way that risks double-counting the lipid story.

New:
- ApoB is the primary atherogenic lens,
- LDL becomes fallback or secondary lens when needed.

Why better:
- closer to current research logic,
- avoids overweighting one biological story twice.

### 4. Weak markers move out of the hard core score

Old:
- contextual markers like DAO could still shape the overall panel output strongly.

New:
- contextual markers still matter,
- but they move into contextual or experimental logic,
- not hard core scoring.

Why better:
- reduces overconfidence,
- makes the score cleaner,
- keeps personalization without pretending certainty.

### 5. Unit and assay metadata become first-class fields

Old:
- units were present, but the system structure still allowed silent interpretation problems.

New:
- unit and assay are explicit interpretation gates.

Why better:
- fewer false calculations,
- more medically serious handling,
- better future automation.

### 6. Weekly reports stay simple and useful

Old:
- weekly reports were already one of the more useful parts.

New:
- keep weekly self-reporting,
- keep baseline deviations,
- keep focus suggestions,
- but separate weekly coaching from deeper biomarker logic.

Why better:
- preserves usefulness,
- reduces formula sprawl,
- easier for beginners to trust.

### 7. Recommendations get a contract

Old:
- recommendation text was generated, but the underlying rule boundaries were not always explicit.

New:
- every recommendation has type, verdict, evidence, confidence, and scope.

Why better:
- easier to review,
- easier to improve,
- safer and more serious.

## What We Keep Because It Was Good

- school-like layered thinking,
- weekly focus concept,
- profile baseline concept,
- dashboard as overview,
- plain-language explanations,
- action-oriented output.

## What We Intentionally Stop Doing

- hiding core logic inside Notion formulas only,
- treating missing as automatic severity,
- mixing measurement and recommendation in one blob,
- pretending one total score is a medical truth,
- letting weak markers distort the main priority view.

## Beginner Explanation

The old system was like one giant spreadsheet that tried to be:
- notebook,
- calculator,
- coach,
- and dashboard
all at the same time.

The new system is more like a small team where each part has one job:
- one part stores profile basics,
- one part stores lab events,
- one part stores single biomarker values,
- one part writes interpretations,
- one part stores recommendations,
- one part shows the overview.

That makes the MVP better because:
- it is cleaner,
- more believable,
- easier to scale,
- easier to debug,
- and much easier to automate later without rebuilding everything.
