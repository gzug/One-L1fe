/**
 * Core aggregation logic for compute-daily-summaries.
 *
 * v1 scope:
 *   - Only processes aggregation_level = 'day' observations.
 *   - summary_source_scope is always 'single_source'.
 *   - One summary row per (profile_id, wearable_source_id, summary_date, summary_key).
 *   - computation_version = 'v1'.
 *   - Upserts are idempotent: safe to re-run after a sync.
 *
 * Out of scope for v1 (document, do not implement):
 *   - 'merged' scope across sources.
 *   - 'sample' or 'session' aggregation_level inputs.
 *   - Derived metrics that span multiple metric_keys.
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type {
  ComputeDailySummariesRequest,
  ComputeDailySummariesResponse,
  DailySummaryRow,
} from './types.ts';

const COMPUTATION_VERSION = 'v1';

export async function computeDailySummaries(
  supabase: SupabaseClient,
  profileId: string,
  body: ComputeDailySummariesRequest,
): Promise<ComputeDailySummariesResponse> {
  // ------------------------------------------------------------------
  // 1. Verify source ownership
  // ------------------------------------------------------------------
  const { data: source, error: sourceError } = await supabase
    .from('wearable_sources')
    .select('id, profile_id')
    .eq('id', body.wearable_source_id)
    .single();

  if (sourceError || !source) {
    throw new Error(`wearable_source_id not found: ${body.wearable_source_id}`);
  }
  if (source.profile_id !== profileId) {
    throw new Error('wearable_source_id does not belong to authenticated user.');
  }

  const dateFrom = body.date_from!;
  const dateTo = body.date_to!;

  // ------------------------------------------------------------------
  // 2. Fetch day-level observations for the requested window
  // ------------------------------------------------------------------
  const { data: observations, error: obsError } = await supabase
    .from('wearable_observations')
    .select(
      'metric_key, observed_at, value_numeric, value_text, unit, source_timezone, source_record_id',
    )
    .eq('profile_id', profileId)
    .eq('wearable_source_id', body.wearable_source_id)
    .eq('aggregation_level', 'day')
    .eq('is_deleted_at_source', false)
    .gte('observed_at', `${dateFrom}T00:00:00Z`)
    .lte('observed_at', `${dateTo}T23:59:59Z`);

  if (obsError) {
    throw new Error(`Failed to fetch observations: ${obsError.message}`);
  }

  if (!observations || observations.length === 0) {
    return {
      wearable_source_id: body.wearable_source_id,
      date_from: dateFrom,
      date_to: dateTo,
      summaries_written: 0,
      computation_version: COMPUTATION_VERSION,
      error_summary: null,
    };
  }

  // ------------------------------------------------------------------
  // 3. Group by (summary_date, metric_key) and derive summary rows
  // For day-level observations, one observation = one summary in v1.
  // Multiple observations for the same (date, metric_key) are averaged.
  // ------------------------------------------------------------------
  type GroupKey = string; // `${summary_date}::${metric_key}`
  const groups = new Map<
    GroupKey,
    {
      metric_key: string;
      summary_date: string;
      values: number[];
      value_text: string | null;
      unit: string | null;
      source_timezone: string | null;
      source_record_ids: string[];
    }
  >();

  for (const obs of observations) {
    const summaryDate = obs.observed_at.slice(0, 10);
    const key: GroupKey = `${summaryDate}::${obs.metric_key}`;

    if (!groups.has(key)) {
      groups.set(key, {
        metric_key: obs.metric_key,
        summary_date: summaryDate,
        values: [],
        value_text: null,
        unit: obs.unit ?? null,
        source_timezone: obs.source_timezone ?? null,
        source_record_ids: [],
      });
    }

    const group = groups.get(key)!;
    if (obs.value_numeric !== null) {
      group.values.push(obs.value_numeric);
    }
    if (obs.value_text !== null) {
      group.value_text = obs.value_text;
    }
    group.source_record_ids.push(obs.source_record_id);
  }

  // ------------------------------------------------------------------
  // 4. Build upsert rows
  // ------------------------------------------------------------------
  const rows: DailySummaryRow[] = [];

  for (const group of groups.values()) {
    const hasNumeric = group.values.length > 0;
    const avgNumeric = hasNumeric
      ? group.values.reduce((a, b) => a + b, 0) / group.values.length
      : null;

    const qualityFlag: DailySummaryRow['quality_flag'] =
      group.values.length === 1 ? 'good'
      : group.values.length > 1 ? 'partial'
      : group.value_text !== null ? 'good'
      : 'insufficient';

    rows.push({
      summary_key: group.metric_key,
      summary_date: group.summary_date,
      value_numeric: avgNumeric !== null ? Math.round(avgNumeric * 10000) / 10000 : null,
      value_text: group.value_text,
      unit: group.unit,
      quality_flag: qualityFlag,
      derived_from: group.source_record_ids,
    });
  }

  // ------------------------------------------------------------------
  // 5. Upsert into wearable_daily_summaries
  // Conflict target: single_source unique index
  //   (profile_id, wearable_source_id, summary_date, summary_key, computation_version)
  // ------------------------------------------------------------------
  const upsertRows = rows.map((r) => ({
    profile_id: profileId,
    wearable_source_id: body.wearable_source_id,
    summary_source_scope: 'single_source' as const,
    summary_date: r.summary_date,
    summary_timezone: 'UTC',
    summary_key: r.summary_key,
    value_numeric: r.value_numeric,
    value_text: r.value_text,
    unit: r.unit,
    computation_version: COMPUTATION_VERSION,
    derived_from: r.derived_from,
    quality_flag: r.quality_flag,
  }));

  const { error: upsertError } = await supabase
    .from('wearable_daily_summaries')
    .upsert(upsertRows, {
      onConflict: 'profile_id,wearable_source_id,summary_date,summary_key,computation_version',
      ignoreDuplicates: false,
    });

  if (upsertError) {
    throw new Error(`Failed to upsert daily summaries: ${upsertError.message}`);
  }

  // ------------------------------------------------------------------
  // 6. Return
  // ------------------------------------------------------------------
  return {
    wearable_source_id: body.wearable_source_id,
    date_from: dateFrom,
    date_to: dateTo,
    summaries_written: rows.length,
    computation_version: COMPUTATION_VERSION,
    error_summary: null,
  };
}
