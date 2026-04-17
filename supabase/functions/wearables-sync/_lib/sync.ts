/**
 * Core sync logic for wearables-sync edge function.
 *
 * Responsibilities:
 *   1. Verify wearable_source belongs to the authenticated user.
 *   2. Open a wearable_sync_run record.
 *   3. Upsert observations (dedup on source_record_id).
 *   4. Close the sync_run with final counts and status.
 *   5. Return WearableSyncResponse.
 *
 * Does NOT compute daily summaries — that is a separate async job.
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type { WearableSyncRequest, WearableSyncResponse } from './types.ts';

export async function runSync(
  supabase: SupabaseClient,
  profileId: string,
  body: WearableSyncRequest,
): Promise<WearableSyncResponse> {
  // ------------------------------------------------------------------
  // 1. Verify source ownership
  // ------------------------------------------------------------------
  const { data: source, error: sourceError } = await supabase
    .from('wearable_sources')
    .select('id, profile_id, is_active')
    .eq('id', body.wearable_source_id)
    .single();

  if (sourceError || !source) {
    throw new Error(`wearable_source_id not found: ${body.wearable_source_id}`);
  }
  if (source.profile_id !== profileId) {
    throw new Error('wearable_source_id does not belong to authenticated user.');
  }
  if (source.is_active !== true) {
    throw new Error('wearable_source is inactive. Reactivate before syncing.');
  }

  // ------------------------------------------------------------------
  // 2. Open sync run
  // ------------------------------------------------------------------
  const { data: syncRun, error: syncRunError } = await supabase
    .from('wearable_sync_runs')
    .insert({
      profile_id: profileId,
      wearable_source_id: body.wearable_source_id,
      sync_mode: body.sync_mode,
      started_at: body.started_at,
      status: 'running',
      records_seen: body.observations.length,
      records_inserted: 0,
      records_updated: 0,
      source_cursor: body.source_cursor ?? null,
    })
    .select('id')
    .single();

  if (syncRunError || !syncRun) {
    throw new Error(`Failed to open sync run: ${syncRunError?.message}`);
  }

  const syncRunId: string = syncRun.id;
  let recordsInserted = 0;
  let recordsUpdated = 0;
  let errorSummary: string | null = null;
  let finalStatus: 'success' | 'partial' | 'failed' = 'success';

  try {
    // ------------------------------------------------------------------
    // 3. Upsert observations in chunks of 500
    // Dedup key: (wearable_source_id, metric_key, source_record_id)
    // ------------------------------------------------------------------
    const CHUNK_SIZE = 500;
    const chunks = chunkArray(body.observations, CHUNK_SIZE);

    for (const chunk of chunks) {
      const rows = chunk.map((obs) => ({
        profile_id: profileId,
        wearable_source_id: body.wearable_source_id,
        metric_key: obs.metric_key,
        source_record_id: obs.source_record_id,
        raw_type: obs.raw_type,
        aggregation_level: deriveAggregationLevel(obs.metric_key),
        observed_at: obs.observed_at,
        observation_end_at: obs.observation_end_at ?? null,
        source_timezone: obs.source_timezone,
        value_numeric: obs.value_numeric ?? null,
        value_text: obs.value_text ?? null,
        value_json: obs.value_json ?? null,
        unit: obs.unit ?? null,
        measurement_method: obs.measurement_method ?? null,
        source_confidence: 'unknown' as const,
        vendor_signal_class: 'raw_observed' as const,
        source_payload: obs.source_payload ?? {},
      }));

      const { error: upsertError, count } = await supabase
        .from('wearable_observations')
        .upsert(rows, {
          onConflict: 'wearable_source_id,metric_key,source_record_id',
          ignoreDuplicates: false,
          count: 'exact',
        });

      if (upsertError) {
        throw new Error(`Upsert failed: ${upsertError.message}`);
      }

      // Supabase upsert count reflects affected rows; treat all as inserted for now.
      // TODO: differentiate insert vs update once Supabase exposes it.
      recordsInserted += count ?? chunk.length;
    }
  } catch (err) {
    finalStatus = 'failed';
    errorSummary = err instanceof Error ? err.message : 'Unknown error during upsert.';
  }

  // ------------------------------------------------------------------
  // 4. Close sync run
  // ------------------------------------------------------------------
  const completedAt = new Date().toISOString();
  const nextCursor = finalStatus === 'success' ? completedAt : null;

  await supabase
    .from('wearable_sync_runs')
    .update({
      status: finalStatus,
      completed_at: completedAt,
      records_inserted: recordsInserted,
      records_updated: recordsUpdated,
      error_summary: errorSummary,
      source_cursor: nextCursor,
    })
    .eq('id', syncRunId);

  // ------------------------------------------------------------------
  // 5. Return response
  // ------------------------------------------------------------------
  return {
    sync_run_id: syncRunId,
    status: finalStatus,
    records_seen: body.observations.length,
    records_inserted: recordsInserted,
    records_updated: recordsUpdated,
    next_cursor: nextCursor,
    error_summary: errorSummary,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveAggregationLevel(
  metricKey: string,
): 'sample' | 'session' | 'day' {
  if (metricKey === 'sleep_session' || metricKey === 'workout_session') return 'session';
  if (
    metricKey === 'steps_total' ||
    metricKey === 'active_minutes' ||
    metricKey === 'resting_heart_rate' ||
    metricKey === 'distance_total' ||
    metricKey === 'active_energy_burned' ||
    metricKey === 'temperature_deviation'
  ) return 'day';
  return 'sample';
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
