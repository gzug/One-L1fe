export const prototypeCopy = {
  // Identity
  appName: 'One L1fe',
  prototypeSub: 'v2',

  // Demo info modal
  demoInfoTitle: 'Demo data',
  demoInfoBody:
    'Preset values are illustrative demo data. Local edits may be stored on this device. Real-source connections are active development work.',
  demoInfoDismiss: 'Got it',
  demoInfoConnectCta: 'Connect a source →',
  demoInfoConnectHelper: 'Manage Health Connect, wearable data, and Blood Panels from Profile.',

  // Status labels
  available: 'Available',
  notAvailable: 'Not available',
  needsAttention: 'Review',
  planned: 'Planned',

  // Score card
  readinessInterpretation: 'One L1fe Score',
  readinessInterpretationSub:
    'Use as planning context, not medical advice. Real-data scoring is not active yet.',
  readinessScoreLabel: 'Score',
  dataCoverageLabel: 'Data coverage',

  // Sections
  sectionSignals: 'Training signals',
  sectionBlood: 'Blood panels',
  sectionCoaching: 'Next Actions',
  sectionTrend: 'One L1fe Score Trend',
  sectionNotes: 'Notes & Ideas',
  sectionTodaySignals: "Today's Signals",
  sectionRecommendations: 'Recommendations',

  // Signal status glyphs
  signalGlyphs: {
    available: '•',
    needs_attention: '•',
    not_available: '◦',
  } as Record<string, string>,

  // Blood panels
  bloodPanelCount: (n: number) => `${n} panel${n === 1 ? '' : 's'} on file`,
  bloodPanelsViewCta: 'View blood panels',
  bloodPanelsUploadPdf: 'Upload PDF',
  bloodPanelsUploadPhoto: 'Upload photo',
  bloodPanelsProtoNote: 'Upload not active yet',

  // Notes
  notesPlaceholder: 'Add a thought, observation, or question…',
  notesSaveLabel: 'Save',
  notesDiscardLabel: 'Discard',
  notesEmptyHint: 'Tap to add an idea, observation, or question.',
  notesEmptyAddLabel: '+ Add note',

  // Safety
  safetyNote:
    'One L1fe organises training and health context. It does not diagnose, treat, or replace professional care.',
} as const;
