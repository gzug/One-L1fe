import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import { buildMinimumSliceFunctionRequestBody, invokeMinimumSliceFunction } from './minimumSliceAppClient.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function assertRejects(fn: () => Promise<unknown>, expectedMessage: string): Promise<void> {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(message.includes(expectedMessage), `Expected error to include "${expectedMessage}", got "${message}".`);
    return;
  }

  throw new Error(`Expected promise to reject with message including "${expectedMessage}".`);
}

export async function runMinimumSliceAppClientAssertions(): Promise<void> {
  const request = buildMinimumSliceFunctionRequestBody(
    fixturePrimaryLipidWithBoundedModifiers,
    {
      now: new Date('2026-04-13T02:50:00.000Z'),
      createdAt: '2026-04-13T02:50:00.000Z',
      auditTraceId: 'trace_123',
    },
  );

  assert(request.panel.panelId === fixturePrimaryLipidWithBoundedModifiers.panelId, 'Client request builder should preserve panel ids.');
  assert(request.panel.entries.length === fixturePrimaryLipidWithBoundedModifiers.entries.length, 'Client request builder should preserve entry count.');
  assert(request.execution?.now === '2026-04-13T02:50:00.000Z', 'Client request builder should serialize execution timestamps.');
  assert(request.persistence?.auditTraceId === 'trace_123', 'Client request builder should preserve persistence options.');

  let capturedPath: string | undefined;
  let capturedMethod: string | undefined;
  let capturedHeaders: Record<string, string> | undefined;
  let capturedBody: unknown;

  const result = await invokeMinimumSliceFunction(
    async (transportRequest) => {
      capturedPath = transportRequest.path;
      capturedMethod = transportRequest.method;
      capturedHeaders = transportRequest.headers;
      capturedBody = JSON.parse(transportRequest.body);

      return {
        status: 200,
        json: {
          evaluation: {
            profileId: fixturePrimaryLipidWithBoundedModifiers.profileId,
            panelId: fixturePrimaryLipidWithBoundedModifiers.panelId,
          },
          persistence: {
            interpretationRunId: 'run_123',
            interpretedEntryIds: ['entry_1'],
            recommendationIds: ['rec_1'],
          },
        },
      };
    },
    fixturePrimaryLipidWithBoundedModifiers,
  );

  assert(capturedPath === 'save-minimum-slice-interpretation', 'Client invocation should default to the minimum-slice function path.');
  assert(capturedMethod === 'POST', 'Client invocation should use POST.');
  assert(capturedHeaders?.['Content-Type'] === 'application/json', 'Client invocation should send JSON.');
  assert(
    typeof capturedBody === 'object' && capturedBody !== null && (capturedBody as { panel?: { panelId?: string } }).panel?.panelId === fixturePrimaryLipidWithBoundedModifiers.panelId,
    'Client invocation should serialize the shared function contract.',
  );
  assert(result.persistence.interpretationRunId === 'run_123', 'Client invocation should return the parsed function result.');

  let failureMessage = '';

  try {
    await invokeMinimumSliceFunction(
      async () => ({
        status: 400,
        json: { error: 'Missing Authorization header.' },
      }),
      fixturePrimaryLipidWithBoundedModifiers,
    );
  } catch (error) {
    failureMessage = error instanceof Error ? error.message : String(error);
  }

  assert(failureMessage === 'Missing Authorization header.', 'Client invocation should surface function errors clearly.');

  await assertRejects(
    async () =>
      invokeMinimumSliceFunction(
        async () => ({
          status: 200,
          json: {
            ok: true,
          },
        }),
        fixturePrimaryLipidWithBoundedModifiers,
      ),
    'unexpected response shape',
  );

  await assertRejects(
    async () => {
      buildMinimumSliceFunctionRequestBody(
        {
          ...fixturePrimaryLipidWithBoundedModifiers,
          collectedAt: 'not-a-date',
        },
      );
    },
    'panel.collectedAt must be a valid ISO timestamp.',
  );
}
