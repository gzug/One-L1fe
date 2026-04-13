import {
  createExampleMinimumSliceMobileDraft,
  createMinimumSliceScreenModel,
  MinimumSliceMobileSession,
  MinimumSliceScreenModel,
  patchMinimumSliceDraft,
  submitMinimumSliceScreen,
} from './minimumSliceScreenModel.ts';
import { ONE_L1FE_SUPABASE_PROJECT_REF, getOneL1feSupabaseUrl } from './minimumSliceHostedConfig.ts';
import { MinimumSliceMobileFormDraft } from '../../packages/domain/minimumSliceMobileForm.ts';

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
  functionPath?: string;
}

export interface MinimumSliceScreenController {
  getState(): MinimumSliceScreenModel;
  patchDraft(patch: Partial<MinimumSliceMobileFormDraft>): MinimumSliceScreenModel;
  reset(): MinimumSliceScreenModel;
  submit(): Promise<MinimumSliceScreenModel>;
}

function resolveSession(session: MinimumSliceAuthSession, options: MinimumSliceScreenControllerOptions): MinimumSliceMobileSession {
  return {
    profileId: session.user.id,
    accessToken: session.accessToken,
    supabaseUrl: options.supabaseUrl ?? getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
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
