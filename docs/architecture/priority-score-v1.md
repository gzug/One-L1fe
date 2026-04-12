# Priority Score V1

## Verdict

V1 may use a score, but the score must be framed honestly.
It is not a medical risk score.
It is a bounded prioritization tool.

## Recommended Name

Use one of these names:
- Priority Score
- Focus Score
- Attention Score

Preferred default for V1:
- Priority Score

## What the Score Means

The Priority Score answers:
- which measured areas most likely deserve attention next,
- based on a limited set of interpretable markers,
- under a declared rule version.

It does not answer:
- total health,
- disease probability,
- life expectancy,
- validated clinical risk.

## What Is Allowed Into V1 Priority Score

Allowed early core inputs:
- ApoB
- LDL only under fallback or explicitly separate-lens rules
- Triglycerides
- HbA1c
- Glucose

Allowed only as bounded modifiers:
- Lp(a) only under bounded one-time logic
- hs-CRP only when assay is known and interpretation context is suitable

## What Stays Out of V1 Priority Score

Excluded or downgraded inputs:
- DAO
- ferritin without context gate
- vitamin D as direct hard-risk input
- magnesium as direct hard-risk input
- B12 as direct hard-risk input
- weekly self-report pillars
- generic CRP without assay clarity
- stale or interpretation-limited data

## Scoring Logic Shape

Suggested chain:
1. determine whether row is interpretable,
2. determine whether the marker is a core input, bounded modifier, or excluded input,
3. map value to canonical status,
4. map canonical status to severity,
5. apply weight only if score-eligible,
6. sum allowed contributions,
7. expose score version and coverage note.

## Status to Severity Mapping

Suggested V1 mapping:
- optimal = 0
- good = 1
- borderline = 2
- high = 3
- critical = 4
- missing = not a severity state

## Coverage Handling

Missing or stale data should not pretend to be severity.
Instead, expose separately:
- coverage status,
- freshness status,
- collect-more-data recommendations if needed.

## Required Metadata Around the Score

Every displayed score should eventually have:
- score_version
- included marker count
- bounded modifier note
- excluded marker note
- coverage summary
- freshness note
- top drivers

## Beginner Explanation

Old system:
- one total number could look like a health grade.

New system:
- the number is only a helper for focus.
- it says, "these are the measured areas that deserve attention next."
- it does not say, "this is your real health score."

That makes the MVP better because it is:
- more honest,
- easier to defend,
- easier to improve later,
- less likely to double-count the same biology,
- and less likely to mislead.
