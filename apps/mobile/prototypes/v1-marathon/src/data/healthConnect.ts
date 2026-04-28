/**
 * healthConnect.ts
 *
 * Thin wrapper around react-native-health-connect for the V1 Marathon
 * prototype. The prototype only attempts permission/status — it does not
 * ingest data, store records, or claim "live sync".
 *
 * V1 metric keys we ask for align with wearable-metric-keys-v1.md:
 *   sleep_session, sleep_duration, awake_duration  → Sleep
 *   steps_total, active_minutes, workout_session    → Activity
 *   heart_rate, resting_heart_rate, hrv             → Cardiovascular / recovery
 *
 * On non-Android platforms we return a clear "unavailable" status.
 */
import { Platform } from 'react-native';

export type HealthConnectStatus =
  | 'unsupported_platform'   // iOS / web
  | 'unavailable'            // Android but HC not installed/usable
  | 'provider_update_required'
  | 'available_no_permissions'
  | 'connected'              // any V1 read permission granted
  | 'error';

export type HealthConnectState = {
  status: HealthConnectStatus;
  granted: string[];
  message?: string;
};

const V1_PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'SleepSession' as const },
  { accessType: 'read' as const, recordType: 'Steps' as const },
  { accessType: 'read' as const, recordType: 'HeartRate' as const },
  { accessType: 'read' as const, recordType: 'RestingHeartRate' as const },
  { accessType: 'read' as const, recordType: 'HeartRateVariabilityRmssd' as const },
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
  { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
  { accessType: 'read' as const, recordType: 'Distance' as const },
];

async function loadModule() {
  if (Platform.OS !== 'android') return null;
  try {
    return await import('react-native-health-connect');
  } catch (err) {
    return null;
  }
}

export async function checkHealthConnect(): Promise<HealthConnectState> {
  if (Platform.OS !== 'android') {
    return { status: 'unsupported_platform', granted: [], message: 'Health Connect is Android-only.' };
  }
  const mod = await loadModule();
  if (!mod) {
    return { status: 'error', granted: [], message: 'Health Connect module not linked.' };
  }
  try {
    const sdk = await mod.getSdkStatus();
    if (sdk === mod.SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      return { status: 'unavailable', granted: [], message: 'Health Connect is not installed on this device.' };
    }
    if (sdk === mod.SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return { status: 'provider_update_required', granted: [], message: 'Health Connect provider needs an update.' };
    }
    await mod.initialize();
    const granted = await mod.getGrantedPermissions();
    const records = granted
      .filter((g: any) => g && g.recordType)
      .map((g: any) => g.recordType as string);
    if (records.length === 0) {
      return { status: 'available_no_permissions', granted: [] };
    }
    return { status: 'connected', granted: records };
  } catch (err: any) {
    return { status: 'error', granted: [], message: err?.message ?? 'Health Connect check failed.' };
  }
}

export async function requestHealthConnect(): Promise<HealthConnectState> {
  if (Platform.OS !== 'android') {
    return { status: 'unsupported_platform', granted: [], message: 'Health Connect is Android-only.' };
  }
  const mod = await loadModule();
  if (!mod) {
    return { status: 'error', granted: [], message: 'Health Connect module not linked.' };
  }
  try {
    const sdk = await mod.getSdkStatus();
    if (sdk !== mod.SdkAvailabilityStatus.SDK_AVAILABLE) {
      return checkHealthConnect();
    }
    await mod.initialize();
    const result = await mod.requestPermission(V1_PERMISSIONS as any);
    const records = (result || [])
      .filter((g: any) => g && g.recordType)
      .map((g: any) => g.recordType as string);
    if (records.length === 0) {
      return { status: 'available_no_permissions', granted: [], message: 'No permissions granted.' };
    }
    return { status: 'connected', granted: records };
  } catch (err: any) {
    return { status: 'error', granted: [], message: err?.message ?? 'Health Connect request failed.' };
  }
}

export async function openHealthConnectSettings(): Promise<void> {
  const mod = await loadModule();
  if (!mod) return;
  try {
    mod.openHealthConnectSettings();
  } catch {
    /* no-op */
  }
}

export function statusLabel(state: HealthConnectState): string {
  switch (state.status) {
    case 'unsupported_platform':     return 'Android-only feature';
    case 'unavailable':              return 'Health Connect not installed';
    case 'provider_update_required': return 'Provider update required';
    case 'available_no_permissions': return 'Available · no permissions';
    case 'connected':                return `Connected · ${state.granted.length} permission${state.granted.length === 1 ? '' : 's'} · import not active in prototype`;
    case 'error':                    return 'Check failed';
  }
}
