import { Platform } from 'react-native';

// react-native-health-connect is Android-only.
// iOS adapter (HealthKit) will be added as a separate slice when iOS support is introduced.
// Import is dynamic to avoid breaking iOS builds before the library is conditionally linked.
export type WearablePermissionStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export interface WearablePermissionsAdapter {
  check: () => Promise<WearablePermissionStatus>;
  request: () => Promise<WearablePermissionStatus>;
}

export const GARMIN_READ_PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Steps' as const },
  { accessType: 'read' as const, recordType: 'HeartRate' as const },
  { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
  { accessType: 'read' as const, recordType: 'Distance' as const },
  { accessType: 'read' as const, recordType: 'SleepSession' as const },
];

async function createAndroidAdapter(): Promise<WearablePermissionsAdapter> {
  // Dynamic import keeps iOS builds from failing before HealthKit adapter is added.
  const hc = await import('react-native-health-connect');

  return {
    check: async (): Promise<WearablePermissionStatus> => {
      const isInitialized = await hc.initialize();
      if (!isInitialized) return 'unavailable';
      const granted = await hc.getGrantedPermissions();
      const grantedKeys = new Set(granted.map((p: { recordType: string }) => p.recordType));
      const allGranted = GARMIN_READ_PERMISSIONS.every((p) => grantedKeys.has(p.recordType));
      return allGranted ? 'granted' : 'denied';
    },
    request: async (): Promise<WearablePermissionStatus> => {
      const isInitialized = await hc.initialize();
      if (!isInitialized) return 'unavailable';
      const granted = await hc.requestPermission(GARMIN_READ_PERMISSIONS);
      const grantedKeys = new Set(granted.map((p: { recordType: string }) => p.recordType));
      const allGranted = GARMIN_READ_PERMISSIONS.every((p) => grantedKeys.has(p.recordType));
      return allGranted ? 'granted' : 'denied';
    },
  };
}

// iOS stub — replace with HealthKit adapter when iOS support slice is built.
function createIOSAdapter(): WearablePermissionsAdapter {
  return {
    check: async () => 'unavailable',
    request: async () => 'unavailable',
  };
}

export async function getWearablePermissionsAdapter(): Promise<WearablePermissionsAdapter> {
  if (Platform.OS === 'android') return createAndroidAdapter();
  return createIOSAdapter();
}
