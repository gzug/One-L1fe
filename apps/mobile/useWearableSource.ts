import { useState, useCallback } from 'react';
import {
  resolveWearableSourceForCurrentUser,
  ResolveWearableSourceRequest,
  ResolveWearableSourceResponse,
} from './wearableSourceProvisioning';

export type WearableSourceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; wearableSourceId: string; response: ResolveWearableSourceResponse }
  | { status: 'error'; message: string };

export interface UseWearableSourceOptions {
  // Reserved for future use: pass auto: true to trigger provision on mount.
  // Not implemented in v1 — provision must be called explicitly.
  auto?: false;
}

export function useWearableSource(_options: UseWearableSourceOptions = {}) {
  const [state, setState] = useState<WearableSourceState>({ status: 'idle' });

  const provision = useCallback(async (request: ResolveWearableSourceRequest) => {
    setState({ status: 'loading' });
    try {
      const response = await resolveWearableSourceForCurrentUser(request);
      setState({
        status: 'ready',
        wearableSourceId: response.wearable_source_id,
        response,
      });
    } catch (err) {
      setState({
        status: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Unknown error during wearable source provisioning.',
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, provision, reset };
}
