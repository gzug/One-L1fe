import {
  buildMinimumSlicePanelInputFromMobileDraft,
  createMinimumSliceMobileFormDraft,
} from './minimumSliceMobileForm.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn: () => void, expectedMessage: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(message.includes(expectedMessage), `Expected error to include "${expectedMessage}", got "${message}".`);
    return;
  }

  throw new Error(`Expected function to throw with message including "${expectedMessage}".`);
}

export function runMinimumSliceMobileFormAssertions(): void {
  const emptyDraft = createMinimumSliceMobileFormDraft();
  assert(emptyDraft.panelId === '', 'Mobile form draft factory should start with empty panel id.');
  assert(emptyDraft.source === 'mobile-manual-entry', 'Mobile form draft factory should default the source.');
  assert(emptyDraft.fastingContext === true, 'Mobile form draft factory should default fastingContext to true.');

  const input = buildMinimumSlicePanelInputFromMobileDraft(
    {
      panelId: 'panel_mobile_1',
      collectedAt: '2026-04-13T09:00:00.000Z',
      apob: '118',
      ldl: '152',
      hba1c: '5.8',
      glucose: '104',
      lpa: '62',
      crp: '2.4',
      fastingContext: true,
      source: 'manual-mobile-test',
    },
    {
      profileId: 'profile_mobile_1',
    },
  );

  assert(input.profileId === 'profile_mobile_1', 'Mobile form builder should preserve profile id.');
  assert(input.panelId === 'panel_mobile_1', 'Mobile form builder should preserve panel id.');
  assert(input.collectedAt === '2026-04-13T09:00:00.000Z', 'Mobile form builder should preserve collectedAt.');
  assert(input.source === 'manual-mobile-test', 'Mobile form builder should preserve the explicit source.');
  assert(input.entries.length === 6, 'Mobile form builder should include optional markers when present.');
  assert(input.entries[0]?.marker === 'apob' && input.entries[0]?.unit === 'mg/dL', 'Mobile form builder should create ApoB entry with fixed unit.');
  assert(input.entries[3]?.marker === 'glucose' && input.entries[3]?.fastingContext === true, 'Mobile form builder should preserve glucose fasting context.');

  const fallbackSourceInput = buildMinimumSlicePanelInputFromMobileDraft(
    {
      panelId: 'panel_mobile_2',
      collectedAt: '2026-04-13T09:00:00.000Z',
      apob: '90',
      ldl: '120',
      hba1c: '5.4',
      glucose: '95',
      lpa: '',
      crp: '',
      source: '   ',
    },
    {
      profileId: 'profile_mobile_2',
      defaultSource: 'mobile-screen',
    },
  );

  assert(fallbackSourceInput.source === 'mobile-screen', 'Mobile form builder should use the default source when the draft source is blank.');
  assert(fallbackSourceInput.entries.length === 4, 'Mobile form builder should skip optional blank markers.');

  assertThrows(
    () =>
      buildMinimumSlicePanelInputFromMobileDraft(
        {
          panelId: '',
          collectedAt: '2026-04-13T09:00:00.000Z',
          apob: '118',
          ldl: '152',
          hba1c: '5.8',
          glucose: '104',
        },
        { profileId: 'profile_mobile_3' },
      ),
    'panelId must be a non-empty string.',
  );

  assertThrows(
    () =>
      buildMinimumSlicePanelInputFromMobileDraft(
        {
          panelId: 'panel_mobile_3',
          collectedAt: 'not-a-date',
          apob: '118',
          ldl: '152',
          hba1c: '5.8',
          glucose: '104',
        },
        { profileId: 'profile_mobile_3' },
      ),
    'collectedAt must be a valid ISO timestamp.',
  );

  assertThrows(
    () =>
      buildMinimumSlicePanelInputFromMobileDraft(
        {
          panelId: 'panel_mobile_4',
          collectedAt: '2026-04-13T09:00:00.000Z',
          apob: 'bad',
          ldl: '152',
          hba1c: '5.8',
          glucose: '104',
        },
        { profileId: 'profile_mobile_4' },
      ),
    'apob must be a valid number.',
  );

  assertThrows(
    () =>
      buildMinimumSlicePanelInputFromMobileDraft(
        {
          panelId: 'panel_mobile_5',
          collectedAt: '2026-04-13T09:00:00.000Z',
          apob: '118',
          ldl: '152',
          hba1c: '5.8',
          glucose: '104',
          lpa: 'oops',
        },
        { profileId: 'profile_mobile_5' },
      ),
    'lpa must be a valid number when provided.',
  );
}
