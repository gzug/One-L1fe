# Private Notion V1 Change Log

## Purpose

This page makes the transition from the old MVP visible.
It should be mirrored into Notion so that someone who was not part of the original discussions can still understand:
- what changed,
- what stayed,
- what was simplified,
- what moved outside Notion,
- and why.

## How to use this page in Notion

Recommended layout:
- one main summary section at the top,
- then one block per changed area,
- each block answering five questions:
  1. What existed before?
  2. What exists now?
  3. What was removed or downgraded?
  4. Why was it changed?
  5. What happens later outside Notion?

## Executive summary

The new private Notion V1 does **not** try to delete the old MVP.
It keeps the practical strengths of the old system, but reduces the parts that were fragile, overloaded, or too hidden.

The main direction is:
- preserve usability,
- improve clarity,
- reduce hidden formula complexity,
- and prepare the structure for a later backend and app.

## Change blocks

### 1. Workspace shape

**Before**
- several important pages and structures were useful, but the overall experience could feel spread out.

**Now**
- one main health dashboard becomes the visible home page,
- with attached sub-pages for operational data entry and review.

**Removed or downgraded**
- scattered feeling,
- less compact navigation.

**Why this changed**
- the user should have one obvious starting point,
- and the system should feel closer to a real product.

**What happens later outside Notion**
- the dashboard logic may later be mirrored or replaced in web/app surfaces.

### 2. Lab structure

**Before**
- one broad biomarker panel concept carried too many jobs at once.

**Now**
- lab panels and lab entries are clearly separated,
- one panel row per collection event,
- one entry row per biomarker result.

**Removed or downgraded**
- giant wide-table biomarker logic.

**Why this changed**
- easier entry,
- easier review,
- easier migration to backend later,
- less formula fragility.

**What happens later outside Notion**
- interpretation and scoring logic can run against these cleaner rows in domain/backend systems.

### 3. Missing data handling

**Before**
- missing values could behave too much like severity or penalty.

**Now**
- missing becomes a coverage issue,
- not a disease-like signal.

**Removed or downgraded**
- penalty-style missing-data pressure.

**Why this changed**
- more honest,
- less misleading,
- better for private interpretation.

**What happens later outside Notion**
- stronger coverage logic and recommendation generation can happen in backend/domain systems.

### 4. ApoB and LDL logic

**Before**
- ApoB and LDL could push the same story too similarly.

**Now**
- ApoB is primary,
- LDL is fallback or secondary lens.

**Removed or downgraded**
- double-counting risk in lipid logic.

**Why this changed**
- better aligned with the current rule posture,
- cleaner and more defensible.

**What happens later outside Notion**
- this hierarchy is better enforced in shared logic and backend calculation.

### 5. Unit and assay visibility

**Before**
- unit and assay issues could remain too invisible until interpretation time.

**Now**
- they should be visible in entry fields and helper guidance,
- so the user understands at entry time what matters for clean interpretation.

**Removed or downgraded**
- silent ambiguity.

**Why this changed**
- better data quality,
- better results,
- fewer hidden interpretation blockers.

**What happens later outside Notion**
- stronger interpretability gates and automated checks can run in backend/domain logic.

### 6. Weekly and context layer

**Before**
- weekly inputs were useful, but context could be too mixed into other parts of the system.

**Now**
- weekly check-ins remain,
- and context notes get a clearer home.

**Removed or downgraded**
- mixing measured values and explanatory life context in one blob.

**Why this changed**
- easier to understand,
- easier to preserve meaning,
- better for later analytics.

**What happens later outside Notion**
- context-aware analysis can become richer without losing the user's explanation layer.

### 7. Dashboard logic

**Before**
- too much could end up living inside dashboard formulas.

**Now**
- the dashboard should mainly display,
- summarize,
- and guide action.

**Removed or downgraded**
- heavy hidden calculation logic inside views.

**Why this changed**
- makes the workspace easier to trust,
- easier to edit,
- and easier to migrate later.

**What happens later outside Notion**
- heavier calculations move into backend/domain systems while results remain visible in the UI.

## What should stay visible in Notion when changes happen

Whenever a metric, table, rule, or interpretation field changes, the Notion change log should record:
- what changed,
- whether something was added, removed, simplified, or moved out,
- why the change was made,
- and whether the change is temporary, private-only, or part of the long-term structure.

## Recommended page title inside Notion

**Why This Version Changed**

That title is easier for non-technical users than a purely technical label.
