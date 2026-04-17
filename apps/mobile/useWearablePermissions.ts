import { useCallback, useEffect, useState } from 'react';
import {
  getWearablePermissionsAdapter,
  WearablePermissionStatus,
} from './wearablePermissions';

export interface UseWearablePermissionsResult {
  status: WearablePermissionStatus;
  request: () => Promise<void>;
}

export function useWearablePermissions(): UseWearablePermissionsResult {
  const [status, setStatus] = useState<WearablePermissionStatus>('unknown');

  useEffect(() => {
    getWearablePermissionsAdapter()
      .then((adapter) => adapter.check())
      .then(setStatus)
      .catch(() => setStatus('denied'));
  }, []);

  const request = useCallback(async () => {
    try {
      const adapter = await getWearablePermissionsAdapter();
      const result = await adapter.request();
      setStatus(result);
    } catch {
      setStatus('denied');
    }
  }, []);

  return { status, request };
}
