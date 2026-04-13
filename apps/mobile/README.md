# apps/mobile

React Native application for One L1fe.

## Intended early scope

- authentication shell
- biomarker overview
- trend visualization
- manual entry
- recommendation display

## Working rule

Keep domain logic out of random UI files. If a rule affects meaning, units, validation, or recommendation structure, it should live in `packages/domain`.

## Current status

Architecture scaffold only. The next mobile integration path should use the shared minimum-slice helpers in `packages/domain/`:

1. `minimumSliceMobileForm.ts` to map simple app form values into the shared minimum-slice panel input
2. `minimumSliceAppClient.ts` to build the shared function contract
3. `minimumSliceAppHttpClient.ts` to call the Supabase edge function over HTTP
4. `minimumSliceMobileIntegration.ts` for a minimal submission-state wrapper plus compact submission-state summary suitable for app usage
5. `minimumSliceResultSummary.ts` for compact UI-facing summaries of the returned backend result

## Recommended first app seam

Execution brief:
- `docs/planning/mobile-minimum-slice-first-seam.md`
- `apps/mobile/minimum-slice-example.md`

Implement one narrow flow only:
- collect a minimum-slice panel payload
- submit it through the shared mobile integration helper
- show success or error state
- display returned persistence ids or a minimal summary via the shared result-summary helper

Do not rebuild request shaping or backend transport logic directly inside the app layer.
