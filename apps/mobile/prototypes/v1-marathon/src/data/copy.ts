export const prototypeCopy = {
  // Identity
  appName: 'One L1fe',
  prototypeSub: 'V1 — Marathon',

  // Demo mode
  demoData: 'Demo data',
  demoModeBanner: 'Running with demo data — connect real sources to see your numbers.',

  // Status labels
  available: 'Available',
  notAvailable: 'Not available',
  needsAttention: 'Review',
  planned: 'Planned',

  // Readiness
  readinessLabel: 'Readiness context',
  readinessInterpretation: 'Build carefully today.',
  readinessInterpretationSub:
    'Recovery signals are softer than recent load. Use as context for planning — not a medical assessment.',
  readinessScoreContext: 'context score',
  dataCoverageLabel: 'Data coverage',

  // Sections
  sectionSignals: 'Training signals',
  sectionBlood: 'Blood context',
  sectionCoaching: 'Suggested focus',
  sectionNotes: 'Ideas & Notes',
  sectionSources: 'Connected sources',

  // Signal status glyphs (plain ASCII-safe)
  signalGlyphs: {
    available: '•',
    needs_attention: '•',
    not_available: '◦',
  } as Record<string, string>,

  // Blood
  bloodPanelCount: (n: number) => `${n} panel${n === 1 ? '' : 's'} on file`,

  // Notes
  notesPlaceholder: 'Add a thought, observation, or question…',
  notesSaveLabel: 'Save',
  notesDiscardLabel: 'Discard',

  // Safety
  safetyNote:
    'This prototype organises training and health context. It does not diagnose, treat, or replace professional care.',
} as const;
