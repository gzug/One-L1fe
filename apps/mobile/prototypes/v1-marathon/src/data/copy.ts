export const prototypeCopy = {
  // Identity
  appName: 'One L1fe',
  prototypeName: 'Prototype V1 \u2014 Marathon',

  // Demo mode
  demoData: 'Demo data',
  demoModeBanner: 'Running with demo data \u2014 connect real sources to see your numbers.',

  // Status labels
  available: 'Available',
  notAvailable: 'Not available',
  needsAttention: 'Needs attention',
  planned: 'Planned',

  // Header
  greeting: 'Good morning',
  readinessLabel: 'Readiness context',

  // Readiness interpretation
  // In production this will be derived from signals. Demo value here.
  readinessInterpretation: 'Build carefully today.',
  readinessInterpretationSub: 'Recovery signals are softer than recent load. Use as context for planning, not a medical assessment.',
  readinessScoreContext: 'context score',

  // Section eyebrows
  sectionSignals: 'Training signals',
  sectionBlood: 'Blood context',
  sectionCoaching: 'Suggested focus',
  sectionNutrition: 'Nutrition',

  // Signal glyphs (emoji safe on Android)
  signalGlyphs: {
    available: '\u25cf',
    needs_attention: '\u25cf',
    not_available: '\u25e6',
  } as Record<string, string>,

  // Nutrition
  nutritionTitle: 'Nutrition context',
  nutritionBody: 'Tracking planned. Not included in readiness scoring yet.',
  nutritionLockNote: 'Coming in a future release.',

  // Coaching
  coachingTitle: 'Suggested focus',

  // Safety
  safetyNote:
    'This prototype organises training and health context. It does not diagnose, treat, or replace professional care.',
} as const;
