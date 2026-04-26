# Prototype V1 - Marathon Product Strategy

## Verdict

Build a reduced Android-first incubator prototype focused on marathon preparation. This is not the full One L1fe app and not a diagnostic or treatment product.

## Product goal

Make the prototype feel calm, premium, credible, and data-based while staying honest about demo data and current implementation limits.

## Home structure

1. Header with `Prototype V1 - Marathon` and visible data mode.
2. Readiness orbit for recovery, training load, biomarker context, and data coverage.
3. Training signals with clear status labels.
4. Blood marker context without medical diagnosis language.
5. Next steps as bounded coaching support.
6. Nutrition context as planned/inert area.
7. Safety note.

## Score model

Use a readiness-context orbit, not a clinical risk score. The orbit is a presentation model for training and recovery context. It must not claim diagnosis, treatment, prediction, or medical risk.

## Demo and real data

Demo values must remain visibly labelled. Real data must not be implied unless the code path actually reads real records. No live Garmin or Health Connect claims without proof.

## Nutrition decision

Nutrition is visible as planned context only. It must not influence readiness until a justified data model and source path exist.

## Copy rules

Use user-facing labels such as `Demo data`, `Available`, `Needs attention`, `Connected`, and `Not available`. Avoid `Antler Health OS`, `Synthetic demo`, `Demo Filled`, medical advice, diagnosis, treatment, and risk-score language.

## Agent workflow

Work directly on `main`. Keep prototype-specific files inside `apps/mobile/prototypes/v1-marathon/`. Touch `apps/mobile/App.tsx` only when wiring is explicitly needed and the prototype screen typechecks.

## Batch roadmap

- Batch A-lite: scaffold source structure, theme, copy, demo data, minimal components, docs.
- Batch B: polish home hierarchy and visual system.
- Batch C: wire app shell after typecheck.
- Batch D: final review for safety, accessibility, demo honesty, and checkpoint accuracy.

## Do not do

- Do not touch Supabase for this prototype scaffold.
- Do not make Nutrition scoring-active.
- Do not hide demo-data labels.
- Do not copy stale branch routing into current docs.
- Do not scatter prototype files across the full app shell.
