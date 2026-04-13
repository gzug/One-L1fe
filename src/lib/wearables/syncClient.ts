/**
 * wearablesSyncClient
 *
 * HTTP client for the `wearables-sync` and `compute-daily-summaries`
 * Supabase Edge Functions.
 *
 * Design rules (mirrors minimumSliceAppHttpClient.ts):
 *   - fetchImpl is injectable for testing and React Native compat.
 *   - getAccessToken is async to support token refresh before the call.
 *   - Errors are thrown as typed WearablesSyncClientError so callers can
 *     distinguish network, auth, and server errors without string matching.
 *   - No retry logic here — callers own retry policy.
 */

import type {
  WearableSyncRequest,
  WearableSyncResponse,
} from './syncContract';

// ---------------------------------------------------------------------------
// Shared fetch abstraction
// ---------------------------------------------------------------------------

export interface WearablesHttpFetchResponse {
  status: number;
  json(): Promise<unknown>;
}

export type WearablesHttpFetch = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<WearablesHttpFetchResponse>;

// ---------------------------------------------------------------------------
// Client options
// ---------------------------------------------------------------------------

export interface WearablesSyncClientOptions {
  /**
   * Base URL of the Supabase Functions endpoint.
   * Example: 'https://xyzxyz.supabase.co/functions/v1'
   * Trailing slash is stripped automatically.
   */
  baseUrl: string;

  /**
   * Returns a valid Supabase access token.
   * Called fresh for every request — use this to trigger token refresh
   * (e.g. supabase.auth.refreshSession) before returning.
   */
  getAccessToken: () => Promise<string> | string;

  /** Override fetch for testing or RN environments. Defaults to globalThis.fetch. */
  fetchImpl?: WearablesHttpFetch;
}

// ---------------------------------------------------------------------------
// Typed error
// ---------------------------------------------------------------------------

export type WearablesSyncErrorKind =
  | 'NETWORK_ERROR'       // fetch threw (offline, timeout, DNS)
  | 'UNAUTHORIZED'        // HTTP 401
  | 'SERVER_ERROR'        // HTTP 5xx
  | 'UNEXPECTED_STATUS'   // any other non-2xx
  | 'INVALID_RESPONSE';   // 2xx but body not parseable

export class WearablesSyncClientError extends Error {
  readonly kind: WearablesSyncErrorKind;
  readonly httpStatus?: number;

  constructor(kind: WearablesSyncErrorKind, message: string, httpStatus?: number) {
    super(message);
    this.name = 'WearablesSyncClientError';
    this.kind = kind;
    this.httpStatus = httpStatus;
  }
}

// ---------------------------------------------------------------------------
// compute-daily-summaries request/response
// (local copy — avoids cross-package import from edge function types)
// ---------------------------------------------------------------------------

export interface ComputeDailySummariesRequest {
  wearable_source_id: string;
  date_from?: string;
  date_to?: string;
}

export interface ComputeDailySummariesResponse {
  wearable_source_id: string;
  date_from: string;
  date_to: string;
  summaries_written: number;
  computation_version: string;
  error_summary: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function requireNonEmpty(value: string, field: string): string {
  if (value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value;
}

function getDefaultFetch(): WearablesHttpFetch {
  const fetchImpl = (globalThis as typeof globalThis & { fetch?: WearablesHttpFetch }).fetch;
  if (!fetchImpl) {
    throw new Error('No fetch implementation available. Pass fetchImpl explicitly.');
  }
  return fetchImpl;
}

async function post<T>(
  options: WearablesSyncClientOptions,
  path: string,
  body: unknown,
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? getDefaultFetch();
  const baseUrl = trimTrailingSlash(requireNonEmpty(options.baseUrl, 'baseUrl'));

  let accessToken: string;
  try {
    accessToken = requireNonEmpty(await options.getAccessToken(), 'accessToken');
  } catch (err) {
    throw new WearablesSyncClientError(
      'UNAUTHORIZED',
      err instanceof Error ? err.message : 'Failed to obtain access token.',
    );
  }

  let response: WearablesHttpFetchResponse;
  try {
    response = await fetchImpl(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new WearablesSyncClientError(
      'NETWORK_ERROR',
      err instanceof Error ? err.message : 'Network request failed.',
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    if (response.status >= 200 && response.status < 300) {
      throw new WearablesSyncClientError(
        'INVALID_RESPONSE',
        `HTTP ${response.status} but response body is not valid JSON.`,
        response.status,
      );
    }
    json = undefined;
  }

  if (response.status === 401) {
    throw new WearablesSyncClientError(
      'UNAUTHORIZED',
      `Unauthorized (HTTP 401). Token may be expired.`,
      401,
    );
  }

  if (response.status >= 500) {
    const message =
      json !== null &&
      json !== undefined &&
      typeof json === 'object' &&
      'message' in json
        ? String((json as Record<string, unknown>)['message'])
        : `Server error HTTP ${response.status}.`;
    throw new WearablesSyncClientError('SERVER_ERROR', message, response.status);
  }

  if (response.status < 200 || response.status >= 300) {
    const message =
      json !== null &&
      json !== undefined &&
      typeof json === 'object' &&
      'message' in json
        ? String((json as Record<string, unknown>)['message'])
        : `Unexpected HTTP ${response.status}.`;
    throw new WearablesSyncClientError('UNEXPECTED_STATUS', message, response.status);
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends a batch of wearable observations to the `wearables-sync` edge function.
 *
 * @throws WearablesSyncClientError on network, auth, or server errors.
 *
 * Example:
 * ```ts
 * const response = await invokeWearablesSync(
 *   { baseUrl, getAccessToken },
 *   syncRequest,
 * );
 * // Store response.next_cursor on device for next incremental sync.
 * ```
 */
export async function invokeWearablesSync(
  options: WearablesSyncClientOptions,
  request: WearableSyncRequest,
): Promise<WearableSyncResponse> {
  return post<WearableSyncResponse>(options, 'wearables-sync', request);
}

/**
 * Calls `compute-daily-summaries` to materialise wearable_daily_summaries
 * for the given source and date range.
 *
 * Call this after a successful `invokeWearablesSync` to keep summaries fresh.
 *
 * @throws WearablesSyncClientError on network, auth, or server errors.
 *
 * Example:
 * ```ts
 * const result = await invokeComputeDailySummaries(
 *   { baseUrl, getAccessToken },
 *   { wearable_source_id: sourceId, date_from: '2026-04-14' },
 * );
 * console.log(`Summaries written: ${result.summaries_written}`);
 * ```
 */
export async function invokeComputeDailySummaries(
  options: WearablesSyncClientOptions,
  request: ComputeDailySummariesRequest,
): Promise<ComputeDailySummariesResponse> {
  return post<ComputeDailySummariesResponse>(options, 'compute-daily-summaries', request);
}
