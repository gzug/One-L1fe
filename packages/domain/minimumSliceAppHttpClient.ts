import {
  InvokeMinimumSliceFunctionOptions,
  MinimumSliceFunctionTransport,
  MinimumSliceFunctionTransportResponse,
  invokeMinimumSliceFunction,
} from './minimumSliceAppClient.ts';
import { MinimumSlicePanelInput } from './minimumSlice.ts';
import { SaveMinimumSliceInterpretationResult } from './supabaseRepository.ts';

export interface MinimumSliceHttpFetchResponse {
  status: number;
  json(): Promise<unknown>;
}

export type MinimumSliceHttpFetch = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<MinimumSliceHttpFetchResponse>;

export interface CreateMinimumSliceHttpTransportOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string> | string;
  fetchImpl?: MinimumSliceHttpFetch;
}

function requireNonEmptyString(value: string, field: string): string {
  if (value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getDefaultFetch(): MinimumSliceHttpFetch {
  const fetchImpl = (globalThis as typeof globalThis & { fetch?: MinimumSliceHttpFetch }).fetch;

  if (!fetchImpl) {
    throw new Error('No fetch implementation is available for the minimum-slice HTTP client.');
  }

  return fetchImpl;
}

export function createMinimumSliceHttpTransport(
  options: CreateMinimumSliceHttpTransportOptions,
): MinimumSliceFunctionTransport {
  const fetchImpl = options.fetchImpl ?? getDefaultFetch();
  const baseUrl = trimTrailingSlash(requireNonEmptyString(options.baseUrl, 'baseUrl'));

  return async (request): Promise<MinimumSliceFunctionTransportResponse> => {
    const accessToken = requireNonEmptyString(await options.getAccessToken(), 'accessToken');
    const response = await fetchImpl(`${baseUrl}/${request.path}`, {
      method: request.method,
      headers: {
        ...request.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      body: request.body,
    });

    let json: unknown;

    try {
      json = await response.json();
    } catch {
      json = undefined;
    }

    return {
      status: response.status,
      json,
    };
  };
}

export async function invokeMinimumSliceFunctionOverHttp(
  options: CreateMinimumSliceHttpTransportOptions,
  input: MinimumSlicePanelInput,
  requestOptions?: InvokeMinimumSliceFunctionOptions,
): Promise<SaveMinimumSliceInterpretationResult> {
  return invokeMinimumSliceFunction(createMinimumSliceHttpTransport(options), input, requestOptions);
}
