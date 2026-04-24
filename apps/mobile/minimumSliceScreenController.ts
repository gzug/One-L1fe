import {
  createExampleMinimumSliceMobileDraft,
  createMinimumSliceScreenModel,
  MinimumSliceMobileSession,
  MinimumSliceScreenModel,
  patchMinimumSliceDraft,
  setOptionalMarkerFieldState,
  submitMinimumSliceScreen,
} from './minimumSliceScreenModel.ts';
import { ONE_L1FE_SUPABASE_PROJECT_REF, getOneL1feSupabaseUrl } from './minimumSliceHostedConfig.ts';
import { MinimumSliceMobileFormDraft, MinimumSliceStatusMarkerKey } from '../../packages/domain/minimumSliceMobileForm.ts';

export interface MinimumSliceAuthenticatedUser {
  id: string;
}

export interface MinimumSliceAuthSession {
  user: MinimumSliceAuthenticatedUser;
  accessToken: string;
}

export interface MinimumSliceAuthSessionProvider {
  getSession(): Promise<MinimumSliceAuthSession>;
}

export interface MinimumSliceScreenControllerOptions {
  authSessionProvider: MinimumSliceAuthSessionProvider;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  functionPath?: string;
}

export interface MinimumSliceScreenController {
  getState(): MinimumSliceScreenModel;
  patchDraft(patch: Partial<MinimumSliceMobileFormDraft>): MinimumSliceScreenModel;
  setOptionalMarkerFieldState(marker: MinimumSliceStatusMarkerKey, fieldState: 'provided' | 'missing' | 'disabled'): MinimumSliceScreenModel;
  reset(): MinimumSliceScreenModel;
  submit(): Promise<MinimumSliceScreenModel>;
}

function resolveSession(session: MinimumSliceAuthSession, options: MinimumSliceScreenControllerOptions): MinimumSliceMobileSession {
  return {
    profileId: session.user.id,
    accessToken: session.accessToken,
    supabaseUrl: options.supabaseUrl ?? getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
    ...(options.supabaseAnonKey !== undefined ? { supabaseAnonKey: options.supabaseAnonKey } : {}),
    ...(options.functionPath !== undefined ? { functionPath: options.functionPath } : {}),
  };
}

export function createMinimumSliceScreenController(
  options: MinimumSliceScreenControllerOptions,
  initialState: MinimumSliceScreenModel = createMinimumSliceScreenModel(createExampleMinimumSliceMobileDraft()),
): MinimumSliceScreenController {
  let state = initialState;

  return {
    getState(): MinimumSliceScreenModel {
      return state;
    },

    patchDraft(patch: Partial<MinimumSliceMobileFormDraft>): MinimumSliceScreenModel {
      state = patchMinimumSliceDraft(state, patch);
      return state;
    },

    setOptionalMarkerFieldState(marker: MinimumSliceStatusMarkerKey, fieldState: 'provided' | 'missing' | 'disabled'): MinimumSliceScreenModel {
      state = setOptionalMarkerFieldState(state, marker, fieldState);
      return state;
    },

    reset(): MinimumSliceScreenModel {
      state = createMinimumSliceScreenModel(createExampleMinimumSliceMobileDraft());
      return state;
    },

    async submit(): Promise<MinimumSliceScreenModel> {
      const session = await options.authSessionProvider.getSession();

      state = await submitMinimumSliceScreen(state, resolveSession(session, options));

      return state;
    },
  };
}
