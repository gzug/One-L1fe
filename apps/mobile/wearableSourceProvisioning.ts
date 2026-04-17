import { ONE_L1FE_SUPABASE_PROJECT_REF, getOneL1feSupabaseUrl } from './minimumSliceHostedConfig.ts';
import { FreshAccessTokenResult, getFreshAccessToken } from './mobileSupabaseAuth.ts';

export type WearableSourceKind =
  | 'apple_health'
  | 'health_connect'
  | 'vendor_api'
  | 'manual_import';

export const GARMIN_SOURCE_KIND: WearableSourceKind = 'vendor_api';
export const GARMIN_VENDOR_NAME = 'garmin';
export const GARMIN_CONNECT_SOURCE_APP_ID = 'com.garmin.android.apps.connectmobile';
export const GARMIN_CONNECT_SOURCE_APP_NAME = 'Garmin Connect';

export interface ResolveWearableSourceRequest {
  source_kind: WearableSourceKind;
  vendor_name: string;
  source_app_id?: string | null;
  source_app_name?: string | null;
  device_hardware_id?: string | null;
  device_label?: string | null;
  app_install_id?: string | null;
}

export interface ResolveWearableSourceResponse {
  wearable_source_id: string;
  profile_id: string;
  source_kind: WearableSourceKind;
  vendor_name: string;
  created: boolean;
}

export interface ResolveWearableSourceOptions {
  functionPath?: string;
  getToken?: () => Promise<FreshAccessTokenResult>;
  fetchImpl?: typeof fetch;
}

export interface GarminProvisioningRequestOverrides {
  app_install_id: string;
  source_app_id?: string | null;
  source_app_name?: string | null;
  device_hardware_id?: string | null;
  device_label?: string | null;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getMobileFunctionsBaseUrl(): string {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF);

  return `${trimTrailingSlash(supabaseUrl)}/functions/v1`;
}

function assertResolveResponse(value: unknown): ResolveWearableSourceResponse {
  if (typeof value !== 'object' || value === null) {
    throw new Error('wearable-source-resolve returned a non-object response.');
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.wearable_source_id !== 'string' ||
    typeof candidate.profile_id !== 'string' ||
    typeof candidate.source_kind !== 'string' ||
    typeof candidate.vendor_name !== 'string' ||
    typeof candidate.created !== 'boolean'
  ) {
    throw new Error('wearable-source-resolve returned an unexpected response shape.');
  }

  return candidate as unknown as ResolveWearableSourceResponse;
}

export async function resolveWearableSourceForCurrentUser(
  request: ResolveWearableSourceRequest,
  options: ResolveWearableSourceOptions = {},
): Promise<ResolveWearableSourceResponse> {
  const tokenResult = await (options.getToken ?? getFreshAccessToken)();

  if (tokenResult.kind === 'signed-out') {
    throw new Error('No active session. Please sign in first.');
  }

  if (tokenResult.kind === 'error') {
    throw new Error(tokenResult.message);
  }

  const functionPath = options.functionPath ?? 'wearable-source-resolve';
  const fetchImpl = options.fetchImpl ?? fetch;
  const requestUrl = `${getMobileFunctionsBaseUrl()}/${functionPath}`;
  const anonKey = process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY;
  const response = await fetchImpl(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(typeof anonKey === 'string' && anonKey.trim().length > 0
        ? { apikey: anonKey.trim() }
        : {}),
      Authorization: `Bearer ${tokenResult.accessToken}`,
    },
    body: JSON.stringify(request),
  });

  let responseJson: unknown;
  try {
    responseJson = await response.json();
  } catch {
    responseJson = undefined;
  }

  if (response.status >= 400) {
    const apiMessage =
      typeof responseJson === 'object' &&
      responseJson !== null &&
      'error' in responseJson &&
      typeof (responseJson as { error?: unknown }).error === 'string'
        ? (responseJson as { error: string }).error
        : `wearable-source-resolve failed with status ${response.status}.`;

    throw new Error(apiMessage);
  }

  return assertResolveResponse(responseJson);
}

export function createGarminProvisioningRequest(
  overrides: GarminProvisioningRequestOverrides,
): ResolveWearableSourceRequest {
  return {
    source_kind: GARMIN_SOURCE_KIND,
    vendor_name: GARMIN_VENDOR_NAME,
    source_app_id: overrides.source_app_id ?? GARMIN_CONNECT_SOURCE_APP_ID,
    source_app_name: overrides.source_app_name ?? GARMIN_CONNECT_SOURCE_APP_NAME,
    device_hardware_id: overrides.device_hardware_id ?? null,
    device_label: overrides.device_label ?? null,
    app_install_id: overrides.app_install_id,
  };
}

export const provisionWearableSourceForCurrentUser = resolveWearableSourceForCurrentUser;
