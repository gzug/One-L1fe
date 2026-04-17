import { getFreshAccessToken } from './mobileSupabaseAuth.ts';
import {
  ONE_L1FE_SUPABASE_PROJECT_REF,
  getOneL1feSupabaseUrl,
} from './minimumSliceHostedConfig.ts';

export interface WearableObservationInput {
  metric_key: string;
  source_record_id: string;
  raw_type: string;
  observed_at: string;
  observation_end_at: string | null;
  source_timezone: string | null;
  value_numeric: number | null;
  value_text: string | null;
  value_json: Record<string, unknown> | null;
  unit: string | null;
  measurement_method: string | null;
}

export interface WearableSyncRequest {
  wearable_source_id: string;
  platform: string;
  sync_mode: string;
  started_at: string;
  source_cursor: string | null;
  observations: WearableObservationInput[];
}

export interface WearableSyncResponse {
  sync_run_id: string;
  status: string;
  records_seen: number;
  records_inserted: number;
  records_updated: number;
  next_cursor: string | null;
  error_summary: unknown;
}

export type WearableSyncResult =
  | {
      kind: 'success';
      response: WearableSyncResponse;
    }
  | {
      kind: 'signed-out';
      message: string;
    }
  | {
      kind: 'error';
      message: string;
      status?: number;
    };

export interface WearableSyncClientOptions {
  supabaseUrl?: string;
  functionPath?: string;
}

function getWearablesSyncUrl(options?: WearableSyncClientOptions): string {
  const supabaseUrl = options?.supabaseUrl ?? getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF);
  const functionPath = options?.functionPath ?? 'wearables-sync';
  return `${supabaseUrl}/functions/v1/${functionPath}`;
}

export async function submitWearableSync(
  request: WearableSyncRequest,
  options?: WearableSyncClientOptions,
): Promise<WearableSyncResult> {
  const tokenResult = await getFreshAccessToken();

  if (tokenResult.kind === 'signed-out') {
    return {
      kind: 'signed-out',
      message: 'No active session. Please sign in first.',
    };
  }

  if (tokenResult.kind === 'error') {
    return {
      kind: 'error',
      message: tokenResult.message,
    };
  }

  const response = await fetch(getWearablesSyncUrl(options), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResult.accessToken}`,
      apikey: process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify(request),
  });

  const rawText = await response.text();
  const parsedBody = rawText.length > 0 ? safeJsonParse(rawText) : null;

  if (!response.ok) {
    const message =
      parsedBody !== null &&
      typeof parsedBody === 'object' &&
      'error' in parsedBody &&
      typeof parsedBody.error === 'string'
        ? parsedBody.error
        : `Wearable sync failed with HTTP ${response.status}.`;

    return {
      kind: 'error',
      message,
      status: response.status,
    };
  }

  return {
    kind: 'success',
    response: parsedBody as WearableSyncResponse,
  };
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
