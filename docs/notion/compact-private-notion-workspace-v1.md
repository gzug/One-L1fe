# Compact Private Notion Workspace V1

## Verdict

The right short-term Notion setup is not a stripped-down toy and not a full hidden logic engine.
It should be a compact private working system that:
- preserves the practical strengths of the old MVP,
- reduces formula sprawl,
- keeps manual data entry usable,
- presents a strong main dashboard,
- and acts as a realistic bridge toward the later app and backend.

This workspace should feel like one coherent operating surface, not like six disconnected pages.

## Primary design goal

Create one main dashboard page that acts as the visible home of the private system.
Below it, keep the operational data-entry and review areas as attached sub-pages.

This keeps the workspace:
- easier to understand,
- easier to navigate,
- visually cleaner,
- and closer to a future product structure.

## Workspace model

### Main page
**One L1fe Private Health Dashboard**

This is the top-level page the user opens first.
It should contain:
- current high-level summaries,
- latest panels,
- current focus areas,
- active recommendations,
- weekly status,
- freshness and coverage highlights,
- and quick links into the underlying data-entry areas.

### Sub-pages under the dashboard

1. **Profiles**
   - stable baseline context
   - goals
   - family history summary
   - weekly baselines
   - constraints

2. **Lab Panels**
   - one row per lab event
   - collection date
   - source
   - panel notes
   - freshness helpers

3. **Lab Entries**
   - one row per biomarker result
   - value
   - unit
   - assay type where needed
   - interpretability helper fields
   - simple status and visibility fields

4. **Weekly Check-Ins**
   - self-reported weekly pillars
   - bottlenecks
   - intended actions
   - optional contextual notes

5. **Derived Insights**
   - structured interpretation outputs
   - coverage notes
   - focus summaries
   - confidence and scope

6. **Recommendations**
   - bounded next actions
   - recommendation type
   - verdict
   - evidence summary
   - actionability and status

7. **Context Notes**
   - free-form but structured explanatory context
   - stress
   - travel
   - illness
   - unusual workload
   - sport load
   - sleep disruption reasons

8. **Change Log / Why This Changed**
   - visible record of what changed from the old MVP
   - what was kept
   - what was simplified
   - what moved out of Notion
   - why those changes were made

## Why this compact structure is better

The old MVP had useful ideas, but the experience could feel spread out.
This compact model keeps the same major layers while improving the user experience.

Instead of several separate working islands, the user gets:
- one main dashboard,
- one clearer navigation model,
- and one workspace that still preserves proper structure underneath.

## What the main dashboard should show

### A. Current health overview
- latest panel date
- latest weekly check-in
- current top focus areas
- current recommendation count

### B. Biomarker focus block
- latest core marker statuses
- latest panel summary
- current lipid/metabolic focus
- coverage issues

### C. Weekly block
- latest weekly scores
- weakest current pillar
- suggested weekly focus
- important contextual note if present

### D. Recommendations block
- open recommendations
- handoff-needed items
- high-actionability items

### E. Freshness and coverage block
- stale labs
- missing key markers
- blocked entries due to missing unit or assay

### F. Quick actions block
- add new lab panel
- add new lab entry
- add weekly check-in
- add context note
- review recommendation queue

## Recommended database structure

### 1. Profiles
Use for stable personal baseline context.

Minimum fields:
- Name
- Active
- Interpretation Context
- Age Band or Birth Year
- Health Goal
- Priority Horizon
- Family History Summary
- Exercise Baseline
- Sleep Baseline
- Nutrition Baseline
- Emotional Baseline
- Constraints
- Readiness

### 2. Lab Panels
Use one row per collection event.

Minimum fields:
- Name
- Profile
- Collected At
- Source
- Source Type
- Panel Notes
- Freshness Status
- Interpretation Window End

### 3. Lab Entries
Use one row per marker result.

Minimum fields:
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
- Policy Notes

Important UX note:
Fields like `Unit`, `Assay Type`, `Interpretable`, and `Interpretation Blocker` should have visible guidance.
The user should understand at entry time why missing unit or assay information can weaken the result.

### 4. Weekly Check-Ins
Use one row per week.

Minimum fields:
- Name
- Profile
- Week Date
- Exercise
- Sleep
- Nutrition
- Emotional Health
- Bottleneck
- Biggest Risk
- Intended Action
- Linked Lab Panel
- Weekly Summary

### 5. Derived Insights
Use for structured interpretation output.

Minimum fields:
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

### 6. Recommendations
Use for bounded next actions.

Minimum fields:
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

### 7. Context Notes
Use for contextual explanations that help interpret the rest of the data.

Minimum fields:
- Name
- Profile
- Date
- Context Type
- Related Week
- Related Lab Panel
- Summary
- Details
- Relevance Level

Suggested context types:
- work stress
- sleep disruption reason
- illness / infection
- travel / jet lag
- unusual training load
- nutrition disruption
- medication or supplement change
- other

## What should stay inside Notion

Keep in Notion:
- manual entry
- relations
- rollups
- simple freshness helpers
- weekly deviations from baseline
- weakest-pillar helpers
- simple human-readable summaries
- compact dashboard views
- explanation and review surfaces

## What should not be rebuilt as complex Notion logic

Do not rebuild these as heavy Notion formula systems:
- canonical threshold policy as the only truth
- unit conversion logic
- assay gating logic
- full score weighting engine
- advanced recommendation assembly
- complex historical rescoring
- deeper evidence governance logic

Those should be documented clearly in GitHub and move gradually into backend/domain logic.

## How this supports the later app

This Notion structure should not be treated as throwaway work.
It should act as:
- a working private health system now,
- a field-tested user experience reference,
- a data-shape reference,
- and an early product blueprint.

That means:
- naming should stay stable where possible,
- canonical marker keys should stay stable,
- recommendation field shapes should stay stable,
- and visible dashboard sections should reflect later product priorities.

## Recommended build order

1. create the main dashboard page
2. create the seven sub-pages as databases
3. add minimum properties and relations
4. add only light helper formulas and filtered views
5. create the dashboard views and linked database blocks
6. add visible field guidance for unit, assay, and context-sensitive fields
7. add the change-log page so every structural change remains explainable

## Definition of success

This compact private Notion workspace is successful if:
- the user can continue working immediately,
- the old MVP strengths are still recognizable,
- the structure is cleaner than before,
- the dashboard becomes the obvious home page,
- hidden complexity is reduced,
- and the workspace can serve as a credible bridge to the later app and backend.
