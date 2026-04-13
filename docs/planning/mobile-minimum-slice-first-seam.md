# Mobile minimum-slice first seam

## Verdict

The first real mobile seam should be one narrow authenticated submission flow, not broad app scaffolding.

## Goal

Create one mobile screen or hook that can:
- collect a fixed minimum-slice payload,
- submit it through the shared domain helpers,
- render idle, submitting, success, and error states,
- and show the compact returned summary without rebuilding backend logic in the app layer.

## Required shared helpers

Use these files as the only app-facing path for this seam:
- `packages/domain/minimumSliceMobileForm.ts`
- `packages/domain/minimumSliceAppClient.ts`
- `packages/domain/minimumSliceAppHttpClient.ts`
- `packages/domain/minimumSliceMobileIntegration.ts`
- `packages/domain/minimumSliceResultSummary.ts`

Do not reshape request bodies or interpret backend payloads directly in app UI code.

## Suggested first implementation shape

### Screen inputs
Use a fixed local demo form or fixture-style inputs for:
- `panelId`
- `collectedAt`
- `apob`
- `ldl`
- `hba1c`
- `glucose`
- optional `lpa`
- optional `crp`

### App state
The first seam only needs:
- auth access token
- form values
- `MinimumSliceSubmissionState`
- `MinimumSliceSubmissionStateSummary`

### Submit path
1. collect form values into `MinimumSliceMobileFormDraft`
2. convert them with `buildMinimumSlicePanelInputFromMobileDraft(...)`
3. call `submitMinimumSlicePanel(...)`
4. derive UI output via `summarizeMinimumSliceSubmissionState(...)`
5. render the compact result summary

## First UI output contract

Render only:
- current submission status
- latest error message if present
- interpretation run id
- interpreted entry count
- recommendation count
- coverage state
- top drivers

Do not build recommendation-detail UI in this seam.

## Acceptance criteria

The seam is done when:
1. one authenticated user can submit the example payload from the app layer,
2. the UI never rebuilds transport or request-shaping logic by hand,
3. success and failure states survive repeat submissions,
4. the last successful compact summary remains visible after a later failed submission,
5. the implementation stays thin enough that backend contract changes still flow through the shared domain package.

## Non-goals

Do not add yet:
- trend charts
- recommendation detail rendering
- edit history
- background sync
- offline queueing
- generalized biomarker form builder
- hidden fallback logic inside the UI layer

## Next action after this seam

After the first screen or hook works, the next app step should be extracting a small reusable mobile adapter around auth token retrieval and submission wiring, not expanding feature breadth.
