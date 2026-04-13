import {
  createMinimumSliceScreenModel,
  patchMinimumSliceDraft,
  submitMinimumSliceScreen,
} from './minimumSliceScreenModel.ts';

async function example(): Promise<void> {
  let screen = createMinimumSliceScreenModel();

  screen = patchMinimumSliceDraft(screen, {
    panelId: 'panel_mobile_live_1',
  });

  screen = await submitMinimumSliceScreen(screen, {
    profileId: 'user_123',
    accessToken: 'session-access-token',
    supabaseUrl: 'https://your-project.supabase.co',
  });

  console.log(screen.submissionSummary);
}

void example;
