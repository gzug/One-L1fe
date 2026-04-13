import { MinimumSlicePanelInput } from './minimumSlice.ts';
import {
  CreateMinimumSliceHttpTransportOptions,
  invokeMinimumSliceFunctionOverHttp,
} from './minimumSliceAppHttpClient.ts';
import { MinimumSliceResultSummary, summarizeMinimumSliceResult } from './minimumSliceResultSummary.ts';
import { SaveMinimumSliceInterpretationResult } from './supabaseRepository.ts';

export interface MinimumSliceMobileIntegrationOptions extends CreateMinimumSliceHttpTransportOptions {
  functionPath?: string;
}

export interface MinimumSliceSubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  lastResult?: SaveMinimumSliceInterpretationResult;
  lastError?: string;
}

export interface SubmitMinimumSliceResult {
  nextState: MinimumSliceSubmissionState;
  result?: SaveMinimumSliceInterpretationResult;
}

export interface MinimumSliceSubmissionStateSummary {
  status: MinimumSliceSubmissionState['status'];
  lastError?: string;
  lastResultSummary?: MinimumSliceResultSummary;
}

export function createIdleMinimumSliceSubmissionState(): MinimumSliceSubmissionState {
  return {
    status: 'idle',
  };
}

export function createSubmittingMinimumSliceSubmissionState(
  previous?: MinimumSliceSubmissionState,
): MinimumSliceSubmissionState {
  const nextState: MinimumSliceSubmissionState = {
    status: 'submitting',
  };

  if (previous?.lastResult !== undefined) {
    nextState.lastResult = previous.lastResult;
  }

  return nextState;
}

export function summarizeMinimumSliceSubmissionState(
  state: MinimumSliceSubmissionState,
): MinimumSliceSubmissionStateSummary {
  const summary: MinimumSliceSubmissionStateSummary = {
    status: state.status,
  };

  if (state.lastError !== undefined) {
    summary.lastError = state.lastError;
  }

  if (state.lastResult !== undefined) {
    summary.lastResultSummary = summarizeMinimumSliceResult(state.lastResult);
  }

  return summary;
}

export async function submitMinimumSlicePanel(
  options: MinimumSliceMobileIntegrationOptions,
  input: MinimumSlicePanelInput,
  previous?: MinimumSliceSubmissionState,
): Promise<SubmitMinimumSliceResult> {
  try {
    const requestOptions = options.functionPath !== undefined ? { path: options.functionPath } : undefined;
    const result = await invokeMinimumSliceFunctionOverHttp(options, input, requestOptions);

    return {
      result,
      nextState: {
        status: 'success',
        lastResult: result,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown minimum-slice submission error.';

    const nextState: MinimumSliceSubmissionState = {
      status: 'error',
      lastError: message,
    };

    if (previous?.lastResult !== undefined) {
      nextState.lastResult = previous.lastResult;
    }

    return {
      nextState,
    };
  }
}
