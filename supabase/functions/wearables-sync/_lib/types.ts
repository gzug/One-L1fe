/**
 * Local type re-exports for the wearables-sync edge function.
 * Mirrors src/lib/wearables/syncContract.ts — kept separate because
 * Deno edge functions cannot import from the mobile src/ tree directly.
 *
 * IMPORTANT: Keep in sync with src/lib/wearables/syncContract.ts.
 * Both files define the same contract — mobile side and server side.
 */

export type SyncPlatform = 'apple_health' | 'health_connect';

export type SyncMode =
  | 'manual'
  | 'app_launch'
  | 'foreground_refresh'
  | 'background'
  | 'backfill';

export type HrvMethod = 'sdnn' | 'rmssd' | 'unknown';

export interface RawObservationPayload {
  metric_key: string;
  source_record_id: string;
  raw_type: string;
  observed_at: string;
  observation_end_at: string | null;
  source_timezone: string;
  value_numeric: number | null;
  value_text: string | null;
  value_json: Record<string, unknown> | null;
  unit: string | null;
  measurement_method: HrvMethod | string | null;
  source_payload?: Record<string, unknown>;
}

export interface WearableSyncRequest {
  wearable_source_id: string;
  platform: SyncPlatform;
  sync_mode: SyncMode;
  started_at: string;
  source_cursor: string | null;
  observations: RawObservationPayload[];
}

export interface WearableSyncResponse {
  sync_run_id: string;
  status: 'success' | 'partial' | 'failed';
  records_seen: number;
  records_inserted: number;
  records_updated: number;
  next_cursor: string | null;
  error_summary: string | null;
}
