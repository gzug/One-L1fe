export const prototypeCopy = {
  // Identity
  appName: 'One L1fe',
  prototypeSub: 'V1 \u2014 Marathon',

  // Demo mode
  demoData: 'Demo data',
  demoModeBanner: 'Running with demo data \u2014 connect real sources to see your numbers.',

  // Status labels
  available: 'Available',
  notAvailable: 'Not available',
  needsAttention: 'Review',
  planned: 'Planned',

  // Readiness
  readinessLabel: 'Readiness context',
  readinessInterpretation: 'Build carefully today.',
  readinessInterpretationSub:
    'Recovery signals are softer than recent load. Use as context for planning \u2014 not a medical assessment.',
  readinessScoreContext: 'context score',
  dataCoverageLabel: 'Data coverage',

  // Sections
  sectionSignals: 'Training signals',
  sectionBlood: 'Blood context',
  sectionCoaching: 'Suggested focus',
  sectionNutrition: 'Nutrition',
  sectionSources: 'Connected sources',

  // Signal status glyphs
  signalGlyphs: {
    available: '\u25cf',
    needs_attention: '\u25cf',
    not_available: '\u25e6',
  } as Record<string, string>,

  // Blood
  bloodPanelCount: (n: number) => `${n} panel${n === 1 ? '' : 's'} on file`,

  // Nutrition
  nutritionBody: 'Tracking planned. Not included in readiness scoring yet.',
  nutritionLockNote: 'Coming in a future release.',

  // Safety
  safetyNote:
    'This prototype organises training and health context. It does not diagnose, treat, or replace professional care.',
} as const;
