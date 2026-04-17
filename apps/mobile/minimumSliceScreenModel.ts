import {
  buildMinimumSlicePanelInputFromMobileDraft,
  createOptionalFieldMetadata,
  createMinimumSliceMobileFormDraft,
  getOptionalMarkerConfig,
  MinimumSliceMobileFormDraft,
  OptionalMinimumSliceMarkerKey,
} from '../../packages/domain/minimumSliceMobileForm.ts';
import { FieldState } from '../../packages/domain/fieldValueState.ts';
import {
  createIdleMinimumSliceSubmissionState,
  createSubmittingMinimumSliceSubmissionState,
  MinimumSliceSubmissionState,
  MinimumSliceSubmissionStateSummary,
  submitMinimumSlicePanel,
  summarizeMinimumSliceSubmissionState,
} from '../../packages/domain/minimumSliceMobileIntegration.ts';

export interface MinimumSliceMobileSession {
  profileId: string;
  accessToken: string;
  supabaseUrl: string;
  supabaseAnonKey?: string;
  functionPath?: string;
}

export interface MinimumSliceScreenModel {
  draft: MinimumSliceMobileFormDraft;
  submissionState: MinimumSliceSubmissionState;
  submissionSummary: MinimumSliceSubmissionStateSummary;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function createExampleMinimumSliceMobileDraft(now = new Date()): MinimumSliceMobileFormDraft {
  return {
    ...createMinimumSliceMobileFormDraft(),
    panelId: 'panel_mobile_demo_1',
    collectedAt: now.toISOString(),
    apob: '118',
    ldl: '152',
    hba1c: '5.8',
    glucose: '104',
    lpa: '62',
    crp: '2.4',
    source: 'mobile-minimum-slice-screen',
  };
}

export function createMinimumSliceScreenModel(
  draft: MinimumSliceMobileFormDraft = createExampleMinimumSliceMobileDraft(),
): MinimumSliceScreenModel {
  const submissionState = createIdleMinimumSliceSubmissionState();

  return {
    draft,
    submissionState,
    submissionSummary: summarizeMinimumSliceSubmissionState(submissionState),
  };
}

export function patchMinimumSliceDraft(
  state: MinimumSliceScreenModel,
  patch: Partial<MinimumSliceMobileFormDraft>,
): MinimumSliceScreenModel {
  return {
    ...state,
    draft: {
      ...state.draft,
      ...patch,
    },
  };
}

export function setOptionalMarkerFieldState(
  state: MinimumSliceScreenModel,
  marker: OptionalMinimumSliceMarkerKey,
  fieldState: Extract<FieldState, 'provided' | 'missing' | 'disabled'>,
): MinimumSliceScreenModel {
  const config = getOptionalMarkerConfig(marker);
  const nextMetadata = createOptionalFieldMetadata(fieldState);

  return {
    ...state,
    draft: {
      ...state.draft,
      ...(fieldState === 'disabled' ? { [marker]: '' } : {}),
      [config.metadataKey]: nextMetadata,
    },
  };
}

export async function submitMinimumSliceScreen(
  state: MinimumSliceScreenModel,
  session: MinimumSliceMobileSession,
): Promise<MinimumSliceScreenModel> {
  const submittingState = createSubmittingMinimumSliceSubmissionState(state.submissionState);
  const panel = buildMinimumSlicePanelInputFromMobileDraft(state.draft, {
    profileId: session.profileId,
    defaultSource: 'mobile-minimum-slice-screen',
  });

  const options = {
    baseUrl: `${trimTrailingSlash(session.supabaseUrl)}/functions/v1`,
    getAccessToken: () => session.accessToken,
    ...(session.supabaseAnonKey !== undefined
      ? { supabaseAnonKey: session.supabaseAnonKey }
      : {}),
    ...(session.functionPath !== undefined ? { functionPath: session.functionPath } : {}),
  };

  const result = await submitMinimumSlicePanel(options, panel, submittingState);

  return {
    draft: state.draft,
    submissionState: result.nextState,
    submissionSummary: summarizeMinimumSliceSubmissionState(result.nextState),
  };
}
