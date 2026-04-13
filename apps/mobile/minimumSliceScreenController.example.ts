import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';

async function example(): Promise<void> {
  const controller = createMinimumSliceScreenController({
    authSessionProvider: {
      async getSession() {
        return {
          user: { id: 'user_123' },
          accessToken: 'session-access-token',
        };
      },
    },
  });

  controller.patchDraft({
    panelId: 'panel_mobile_live_1',
  });

  const result = await controller.submit();
  console.log(result.submissionSummary);
}

void example;
