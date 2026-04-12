# Notion V1 Implementation Sequence

## Verdict

The new V1 should not be rebuilt all at once.
The safest path is to create the new structure in a clear sequence so that logic, terminology, and review stay aligned.

## Phase 1: Define the stable policy layer

Create or finalize first:
- marker classes
- rule hardness classes
- unit policy
- assay policy
- score eligibility policy
- recommendation contract

Why this phase exists:
- it prevents database design from drifting away from domain logic,
- it reduces hidden formula decisions later,
- it keeps the structure explainable.

## Phase 2: Build the new Notion databases

Create these databases in this order:
1. Profiles
2. Lab Panels
3. Lab Entries
4. Weekly Check-Ins
5. Derived Insights
6. Recommendations
7. Source Registry

Why this order works:
- later databases depend on earlier ones,
- relations stay simpler,
- review is easier while building.

## Phase 3: Add the minimum useful formulas and rollups

Only add light logic at first:
- weekly baseline deviations,
- lowest pillar,
- secondary pillar,
- panel freshness labels,
- basic summary text,
- simple rollups for linked views.

Do not add yet:
- large scoring logic,
- deep recommendation assembly,
- complex threshold trees,
- hidden policy formulas.

## Phase 4: Migrate concepts from the old MVP

Move over only what remains valid:
- baseline profile fields,
- weekly pillar structure,
- lab panel concept,
- simple dashboard sections,
- plain-language summaries.

Do not copy blindly:
- giant biomarker wide-table design,
- missing-as-penalty logic,
- mixed rule and recommendation formulas,
- weak contextual markers inside the core score.

## Phase 5: Create the first V1 views

Recommended first views:
- Active Profiles
- Latest Lab Panels
- Latest Core Marker Entries
- Weekly Check-Ins by Date
- Coverage Issues
- Recommendation Queue
- Source Policy Notes

## Phase 6: Add the first bounded outputs

V1 should first support these outputs:
- latest biomarker focus summary,
- weekly focus summary,
- coverage summary,
- freshness summary,
- bounded recommendation list.

## Phase 7: Prepare backend migration boundary

After the Notion V1 structure is stable:
- freeze property names,
- freeze canonical marker keys,
- freeze recommendation field names,
- freeze safety states,
- freeze score framing.

Then move heavier logic into shared domain and backend.

## Beginner Explanation

The old version tried to build everything in one jump.
That usually makes systems messy fast.

The new version is built like a house:
1. define the rules,
2. create the rooms,
3. move the right things into the right rooms,
4. only then add the useful automation.

That makes the MVP better because each step is easier to review, trust, and improve.
