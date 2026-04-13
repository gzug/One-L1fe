import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import {
  createMinimumSliceHttpTransport,
  invokeMinimumSliceFunctionOverHttp,
  MinimumSliceHttpFetch,
} from './minimumSliceAppHttpClient.ts';

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

export async function runMinimumSliceAppHttpClientAssertions(): Promise<void> {
  let capturedUrl: string | undefined;
  let capturedMethod: string | undefined;
  let capturedHeaders: Record<string, string> | undefined;
  let capturedBody: unknown;

  const fetchImpl: MinimumSliceHttpFetch = async (input, init) => {
    capturedUrl = input;
    capturedMethod = init?.method;
    capturedHeaders = init?.headers;
    capturedBody = init?.body ? JSON.parse(init.body) : undefined;

    return {
      status: 200,
      async json() {
        return {
          evaluation: {
            profileId: fixturePrimaryLipidWithBoundedModifiers.profileId,
            panelId: fixturePrimaryLipidWithBoundedModifiers.panelId,
          },
          persistence: {
            interpretationRunId: 'run_http_1',
            interpretedEntryIds: ['entry_http_1'],
            recommendationIds: ['rec_http_1'],
          },
        };
      },
    };
  };

  const transport = createMinimumSliceHttpTransport({
    baseUrl: 'https://example.supabase.co/functions/v1/',
    getAccessToken: () => 'token_123',
    fetchImpl,
  });

  const result = await transport({
    path: 'save-minimum-slice-interpretation',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hello: 'world' }),
  });

  assert(capturedUrl === 'https://example.supabase.co/functions/v1/save-minimum-slice-interpretation', 'HTTP transport should join the function URL correctly.');
  assert(capturedMethod === 'POST', 'HTTP transport should preserve the request method.');
  assert(capturedHeaders?.Authorization === 'Bearer token_123', 'HTTP transport should attach the bearer token.');
  assert(
    typeof capturedBody === 'object' && capturedBody !== null && (capturedBody as { hello?: string }).hello === 'world',
    'HTTP transport should forward the serialized request body.',
  );
  assert(result.status === 200, 'HTTP transport should return the response status.');

  const invocationResult = await invokeMinimumSliceFunctionOverHttp(
    {
      baseUrl: 'https://example.supabase.co/functions/v1',
      getAccessToken: async () => 'token_abc',
      fetchImpl: async (input, init) => ({
        status: 200,
        async json() {
          assert(input === 'https://example.supabase.co/functions/v1/save-minimum-slice-interpretation', 'HTTP invocation should target the default function path.');
          assert(init?.headers?.Authorization === 'Bearer token_abc', 'HTTP invocation should use the async token provider.');

          return {
            evaluation: {
              profileId: fixturePrimaryLipidWithBoundedModifiers.profileId,
              panelId: fixturePrimaryLipidWithBoundedModifiers.panelId,
            },
            persistence: {
              interpretationRunId: 'run_http_2',
              interpretedEntryIds: ['entry_http_2'],
              recommendationIds: ['rec_http_2'],
            },
          };
        },
      }),
    },
    fixturePrimaryLipidWithBoundedModifiers,
  );

  assert(invocationResult.persistence.interpretationRunId === 'run_http_2', 'HTTP invocation helper should return the parsed minimum-slice result.');

  await assertRejects(
    async () =>
      invokeMinimumSliceFunctionOverHttp(
        {
          baseUrl: 'https://example.supabase.co/functions/v1',
          getAccessToken: async () => '   ',
          fetchImpl,
        },
        fixturePrimaryLipidWithBoundedModifiers,
      ),
    'accessToken must be a non-empty string.',
  );

  const malformedResponseTransport = createMinimumSliceHttpTransport({
    baseUrl: 'https://example.supabase.co/functions/v1',
    getAccessToken: () => 'token_jsonless',
    fetchImpl: async () => ({
      status: 502,
      async json() {
        throw new Error('bad gateway html');
      },
    }),
  });

  const malformedResponse = await malformedResponseTransport({
    path: 'save-minimum-slice-interpretation',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hello: 'world' }),
  });

  assert(malformedResponse.status === 502, 'HTTP transport should preserve status codes even when JSON parsing fails.');
  assert(malformedResponse.json === undefined, 'HTTP transport should return undefined JSON when the response body is not valid JSON.');
}
