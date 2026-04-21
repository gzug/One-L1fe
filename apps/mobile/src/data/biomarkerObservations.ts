import { SupabaseClient } from '@supabase/supabase-js';
import { getMobileSupabaseClient } from '../mobileSupabaseAuth.ts';

export interface BiomarkerObservation {
  id: string;
  app_install_id: string;
  marker_key: string;
  value: number;
  unit: string;
  recorded_at: string;
  source: string;
  created_at?: string;
}

type BiomarkerObservationRow = BiomarkerObservation;

export async function fetchObservationsForPanel(
  appInstallId: string,
  markerKeys: string[],
  windowDays: number,
): Promise<Record<string, BiomarkerObservation[]>> {
  const client: SupabaseClient = getMobileSupabaseClient();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await client
    .from('biomarker_observations')
    .select('id, app_install_id, marker_key, value, unit, recorded_at, source, created_at')
    .eq('app_install_id', appInstallId)
    .in('marker_key', markerKeys)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: false });

  if (error !== null) {
    throw new Error(`Failed to fetch biomarker observations: ${error.message}`);
  }

  const rows = (data ?? []) as BiomarkerObservationRow[];
  return rows.reduce<Record<string, BiomarkerObservation[]>>((acc, row) => {
    const current = acc[row.marker_key] ?? [];
    current.push(row);
    acc[row.marker_key] = current;
    return acc;
  }, {});
}
