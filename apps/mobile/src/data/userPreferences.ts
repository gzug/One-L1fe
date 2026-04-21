import {
  DEFAULT_HC_RECORD_TYPES,
  MANDATORY_MARKER_KEYS,
  OPTIONAL_MARKER_KEYS,
  type MarkerPreference,
  type WearablePreference,
} from '../../../../packages/domain/userPreferences.ts';
import { getMobileSupabaseClient } from '../../mobileSupabaseAuth.ts';

type MarkerRow = {
  marker_key: string;
  enabled: boolean;
};

type WearableRow = {
  hc_record_type: string;
  enabled: boolean;
};

export async function seedDefaultPreferencesIfAbsent(appInstallId: string): Promise<void> {
  const supabase = getMobileSupabaseClient();
  const markerRows = [...MANDATORY_MARKER_KEYS, ...OPTIONAL_MARKER_KEYS].map((markerKey) => ({
    app_install_id: appInstallId,
    marker_key: markerKey,
    enabled: true,
  }));

  const wearableRows = DEFAULT_HC_RECORD_TYPES.map((hcRecordType) => ({
    app_install_id: appInstallId,
    hc_record_type: hcRecordType,
    enabled: true,
  }));

  await supabase.from('user_marker_preferences').upsert(markerRows, {
    onConflict: 'app_install_id,marker_key',
    ignoreDuplicates: true,
  });

  await supabase.from('user_wearable_preferences').upsert(wearableRows, {
    onConflict: 'app_install_id,hc_record_type',
    ignoreDuplicates: true,
  });
}

export async function fetchMarkerPreferences(appInstallId: string): Promise<MarkerPreference[]> {
  const supabase = getMobileSupabaseClient();
  const { data, error } = await supabase
    .from('user_marker_preferences')
    .select('marker_key, enabled')
    .eq('app_install_id', appInstallId);

  if (error) throw error;
  return (data ?? []).map((row: MarkerRow) => ({ markerKey: row.marker_key, enabled: row.enabled }));
}

export async function fetchWearablePreferences(appInstallId: string): Promise<WearablePreference[]> {
  const supabase = getMobileSupabaseClient();
  const { data, error } = await supabase
    .from('user_wearable_preferences')
    .select('hc_record_type, enabled')
    .eq('app_install_id', appInstallId);

  if (error) throw error;
  return (data ?? []).map((row: WearableRow) => ({ hcRecordType: row.hc_record_type, enabled: row.enabled }));
}

export async function setMarkerPreference(
  appInstallId: string,
  markerKey: string,
  enabled: boolean,
  onRollback: (previousValue: boolean) => void,
): Promise<void> {
  const supabase = getMobileSupabaseClient();
  const { error } = await supabase.from('user_marker_preferences').upsert(
    {
      app_install_id: appInstallId,
      marker_key: markerKey,
      enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'app_install_id,marker_key' },
  );

  if (error) {
    onRollback(!enabled);
    throw error;
  }
}

export async function setWearablePreference(
  appInstallId: string,
  recordType: string,
  enabled: boolean,
  onRollback: (previousValue: boolean) => void,
): Promise<void> {
  const supabase = getMobileSupabaseClient();
  const { error } = await supabase.from('user_wearable_preferences').upsert(
    {
      app_install_id: appInstallId,
      hc_record_type: recordType,
      enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'app_install_id,hc_record_type' },
  );

  if (error) {
    onRollback(!enabled);
    throw error;
  }
}
