import { useCallback, useState } from 'react';
import { supabase } from './supabaseClient';

export type ComputeState = 'idle' | 'submitting' | 'success' | 'error';

export interface ComputeResult {
  summaries_written: number;
  computation_version: string;
  error_summary: string | null;
}

export interface ComputeDailySummariesParams {
  wearable_source_id: string;
  date_from: string;
  date_to?: string;
}

export interface UseComputeDailySummariesReturn {
  state: ComputeState;
  result: ComputeResult | null;
  error: string | null;
  submitCompute: (params: ComputeDailySummariesParams) => Promise<ComputeResult | null>;
  reset: () => void;
}

export function useComputeDailySummaries(): UseComputeDailySummariesReturn {
  const [state, setState] = useState<ComputeState>('idle');
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitCompute = useCallback(
    async (params: ComputeDailySummariesParams): Promise<ComputeResult | null> => {
      setState('submitting');
      setError(null);
      setResult(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'compute-daily-summaries',
          { body: params },
        );

        if (fnError) {
          setState('error');
          setError(fnError.message ?? 'compute-daily-summaries failed');
          return null;
        }

        const computeResult: ComputeResult = {
          summaries_written: data.summaries_written ?? 0,
          computation_version: data.computation_version ?? 'v1',
          error_summary: data.error_summary ?? null,
        };

        setState('success');
        setResult(computeResult);
        return computeResult;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState('error');
        setError(message);
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return { state, result, error, submitCompute, reset };
}
