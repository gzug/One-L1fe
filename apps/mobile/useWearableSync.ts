import { useCallback, useState } from 'react';
import {
  submitWearableSync,
  WearableSyncClientOptions,
  WearableSyncRequest,
  WearableSyncResponse,
} from './wearableSyncClient.ts';

export type WearableSyncState = 'idle' | 'submitting' | 'success' | 'signed-out' | 'error';

export interface UseWearableSyncResult {
  state: WearableSyncState;
  error?: string;
  result?: WearableSyncResponse;
  submitSync: (request: WearableSyncRequest) => Promise<WearableSyncResponse>;
  reset: () => void;
}

export function useWearableSync(options?: WearableSyncClientOptions): UseWearableSyncResult {
  const [state, setState] = useState<WearableSyncState>('idle');
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<WearableSyncResponse | undefined>();

  const submitSync = useCallback(
    async (request: WearableSyncRequest): Promise<WearableSyncResponse> => {
      setState('submitting');
      setError(undefined);

      const syncResult = await submitWearableSync(request, options);

      if (syncResult.kind === 'success') {
        setResult(syncResult.response);
        setState('success');
        return syncResult.response;
      }

      setResult(undefined);
      setError(syncResult.message);
      setState(syncResult.kind === 'signed-out' ? 'signed-out' : 'error');
      throw new Error(syncResult.message);
    },
    [options],
  );

  const reset = useCallback(() => {
    setState('idle');
    setError(undefined);
    setResult(undefined);
  }, []);

  return { state, error, result, submitSync, reset };
}
