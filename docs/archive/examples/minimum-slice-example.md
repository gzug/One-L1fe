---
status: archived
canonical_for: historical minimum-slice mobile usage example
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: apps/mobile/README.md
scope: archive
---

# Minimum-slice mobile usage example

> Archived historical example. The active mobile prototype now uses the app shell documented in `apps/mobile/README.md`.

This example shows the intended first app-side flow for the minimum slice.

## Shared imports

```ts
import {
  buildMinimumSlicePanelInputFromMobileDraft,
  createMinimumSliceMobileFormDraft,
} from '../../packages/domain/minimumSliceMobileForm.ts';
import {
  createIdleMinimumSliceSubmissionState,
  createSubmittingMinimumSliceSubmissionState,
  submitMinimumSlicePanel,
  summarizeMinimumSliceSubmissionState,
} from '../../packages/domain/minimumSliceMobileIntegration.ts';
```

## Example flow

```ts
const draft = createMinimumSliceMobileFormDraft();

draft.panelId = 'panel_mobile_demo_1';
draft.collectedAt = new Date().toISOString();
draft.apob = '118';
draft.ldl = '152';
draft.hba1c = '5.8';
draft.glucose = '104';
draft.lpa = '62';
draft.crp = '2.4';

let state = createIdleMinimumSliceSubmissionState();
state = createSubmittingMinimumSliceSubmissionState(state);

const panel = buildMinimumSlicePanelInputFromMobileDraft(draft, {
  profileId: session.user.id,
  defaultSource: 'mobile-screen',
});

const result = await submitMinimumSlicePanel(
  {
    baseUrl: `${supabaseUrl}/functions/v1`,
    getAccessToken: () => session.access_token,
  },
  panel,
  state,
);

state = result.nextState;
const summary = summarizeMinimumSliceSubmissionState(state);
```

## What the first UI should render

Render only:
- `summary.status`
- `summary.lastError`
- `summary.lastResultSummary?.interpretationRunId`
- `summary.lastResultSummary?.interpretedEntryCount`
- `summary.lastResultSummary?.recommendationCount`
- `summary.lastResultSummary?.coverageState`
- `summary.lastResultSummary?.topDrivers`

Do not rebuild transport, payload shaping, or recommendation interpretation in the UI layer.
