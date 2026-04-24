import { useCallback } from 'react';
import type { WearablePermissionStatus } from './wearablePermissions';

export interface UseWearablePermissionsResult {
  status: WearablePermissionStatus;
  request: () => Promise<void>;
}

export function useWearablePermissions(): UseWearablePermissionsResult {
  const request = useCallback(async () => {}, []);

  return {
    status: 'unavailable',
    request,
  };
}
