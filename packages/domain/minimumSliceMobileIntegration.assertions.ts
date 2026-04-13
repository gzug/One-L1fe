import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import {
  createIdleMinimumSliceSubmissionState,
  createSubmittingMinimumSliceSubmissionState,
  summarizeMinimumSliceSubmissionState,
  submitMinimumSlicePanel,
} from './minimumSliceMobileIntegration.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export async function runMinimumSliceMobileIntegrationAssertions(): Promise<void> {
  const idleState = createIdleMinimumSliceSubmissionState();
  assert(idleState.status === 'idle', 'Mobile integration should expose an idle submission state.');

  const submittingState = createSubmittingMinimumSliceSubmissionState({
    status: 'success',
    lastResult: {
      evaluation: {
        profileId: 'profile_1',
        panelId: 'panel_1',
      },
      persistence: {
        interpretationRunId: 'run_previous',
        interpretedEntryIds: ['entry_previous'],
        recommendationIds: ['rec_previous'],
      },
    } as any,
  });
  assert(submittingState.status === 'submitting', 'Mobile integration should expose a submitting state.');
  assert(submittingState.lastResult?.persistence.interpretationRunId === 'run_previous', 'Submitting state should preserve the last successful result.');

  const success = await submitMinimumSlicePanel(
    {
      baseUrl: 'https://example.supabase.co/functions/v1',
      getAccessToken: async () => 'token_mobile',
      fetchImpl: async () => ({
        status: 200,
        async json() {
          return {
            evaluation: {
              profileId: fixturePrimaryLipidWithBoundedModifiers.profileId,
              panelId: fixturePrimaryLipidWithBoundedModifiers.panelId,
            },
            persistence: {
              interpretationRunId: 'run_mobile_1',
              interpretedEntryIds: ['entry_mobile_1'],
              recommendationIds: ['rec_mobile_1'],
            },
          };
        },
      }),
    },
    fixturePrimaryLipidWithBoundedModifiers,
  );

  assert(success.nextState.status === 'success', 'Successful mobile submission should move to success state.');
  assert(success.result?.persistence.interpretationRunId === 'run_mobile_1', 'Successful mobile submission should return the function result.');

  const successSummary = summarizeMinimumSliceSubmissionState(success.nextState);
  assert(successSummary.status === 'success', 'Submission summary should preserve the success status.');
  assert(successSummary.lastResultSummary?.interpretationRunId === 'run_mobile_1', 'Submission summary should expose the compact result summary.');

  const failure = await submitMinimumSlicePanel(
    {
      baseUrl: 'https://example.supabase.co/functions/v1',
      getAccessToken: async () => 'token_mobile',
      fetchImpl: async () => ({
        status: 400,
        async json() {
          return {
            error: 'Unauthorized.',
          };
        },
      }),
    },
    fixturePrimaryLipidWithBoundedModifiers,
    success.nextState,
  );

  assert(failure.nextState.status === 'error', 'Failed mobile submission should move to error state.');
  assert(failure.nextState.lastError === 'Unauthorized.', 'Failed mobile submission should preserve the surfaced backend error.');
  assert(failure.nextState.lastResult?.persistence.interpretationRunId === 'run_mobile_1', 'Failed mobile submission should preserve the last successful result.');

  const failureSummary = summarizeMinimumSliceSubmissionState(failure.nextState);
  assert(failureSummary.status === 'error', 'Submission summary should preserve the error status.');
  assert(failureSummary.lastError === 'Unauthorized.', 'Submission summary should preserve the latest error.');
  assert(failureSummary.lastResultSummary?.panelId === fixturePrimaryLipidWithBoundedModifiers.panelId, 'Submission summary should preserve the last successful compact result.');
}
