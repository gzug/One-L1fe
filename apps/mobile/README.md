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

A first real Expo scaffold now exists, intentionally without `expo-router`. The app seam is still thin and should keep using the shared minimum-slice helpers in `packages/domain/`:

1. `minimumSliceMobileForm.ts` to map simple app form values into the shared minimum-slice panel input
2. `minimumSliceAppClient.ts` to build the shared function contract
3. `minimumSliceAppHttpClient.ts` to call the Supabase edge function over HTTP
4. `minimumSliceMobileIntegration.ts` for a minimal submission-state wrapper plus compact submission-state summary suitable for app usage
5. `minimumSliceResultSummary.ts` for compact UI-facing summaries of the returned backend result

The first thin app-side model now lives at:
- `apps/mobile/minimumSliceScreenModel.ts`
- `apps/mobile/minimumSliceScreenModel.example.ts`

The next thin adapter around real hosted wiring now lives at:
- `apps/mobile/minimumSliceHostedConfig.ts`
- `apps/mobile/minimumSliceScreenController.ts`
- `apps/mobile/minimumSliceScreenController.example.ts`

These files keep the app seam narrow: draft state in the app layer, request shaping and transport in the shared domain layer, and compact submission summaries ready for UI rendering.

The controller layer is the intended bridge to the Expo screen or a future hook:
- it asks one auth-session provider for the current user id and access token,
- points at the hosted Supabase project by default,
- and keeps submission wiring out of random UI files.

The first runnable Expo scaffold now lives at:
- `apps/mobile/App.tsx`
- `apps/mobile/app.json`
- `apps/mobile/package.json`
- `apps/mobile/.env.example`

It renders one narrow form, submits through the existing controller seam, and shows the shared submission summary.

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
