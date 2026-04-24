export type AskOneL1feSourceKind =
  | 'manual_entry'
  | 'wearable_sync'
  | 'lab_result'
  | 'document'
  | 'nutrition_estimate'
  | 'profile'
  | 'prototype';

export type AskOneL1feSourceStatus = 'available' | 'missing' | 'planned_locked' | 'excluded';

export interface AskOneL1feSource {
  id: string;
  title: string;
  kind: AskOneL1feSourceKind;
  status: AskOneL1feSourceStatus;
  updatedAt?: string | null;
  summary: string;
}

export interface AskOneL1feFact {
  id: string;
  label: string;
  valueSummary: string;
  sourceId: string;
  observedAt?: string | null;
  freshness: 'current' | 'stale' | 'unknown';
  medicalInterpretationAllowed: boolean;
}

export interface AskOneL1feContext {
  sources: AskOneL1feSource[];
  facts: AskOneL1feFact[];
}

export type AskOneL1feAnswerKind =
  | 'empty_question'
  | 'source_overview'
  | 'data_summary'
  | 'insufficient_data';

export interface AskOneL1feAnswer {
  kind: AskOneL1feAnswerKind;
  answer: string;
  estimateConfidencePercent: number;
  sourcesUsed: AskOneL1feSource[];
  missingData: string[];
  safetyNotes: string[];
  canAnswerWithAvailableData: boolean;
}

const MEDICAL_SAFETY_NOTE =
  'One L1fe does not provide medical advice, diagnosis, or treatment. Use this to organize questions for a healthcare professional.';

export function createPrototypeAskOneL1feContext(): AskOneL1feContext {
  return {
    sources: [
      {
        id: 'manual_biomarkers',
        title: 'Manual Blood / Biomarkers',
        kind: 'manual_entry',
        status: 'missing',
        updatedAt: null,
        summary: 'Manual biomarker entry exists, but no sourced values are loaded into Ask One L1fe yet.',
      },
      {
        id: 'nutrition_prototype',
        title: 'Nutrition Prototype',
        kind: 'nutrition_estimate',
        status: 'planned_locked',
        updatedAt: null,
        summary: 'Meal photo/text nutrition is visible as an approximate prototype and does not affect score yet.',
      },
      {
        id: 'wearable_sync',
        title: 'Wearable Sync',
        kind: 'wearable_sync',
        status: 'missing',
        updatedAt: null,
        summary: 'Health Connect / Garmin sync path is present, but no synced observations are loaded into Ask One L1fe yet.',
      },
      {
        id: 'profile_context',
        title: 'Profile Context',
        kind: 'profile',
        status: 'planned_locked',
        updatedAt: null,
        summary: 'Profile preferences and connected source overview are planned and visible, but not active answer inputs yet.',
      },
    ],
    facts: [],
  };
}

export function buildAskOneL1feAnswer(question: string, context: AskOneL1feContext): AskOneL1feAnswer {
  const normalizedQuestion = question.trim();

  if (normalizedQuestion.length === 0) {
    return {
      kind: 'empty_question',
      answer: 'Ask a question about your available One L1fe data. Answers must be based on sourced data.',
      estimateConfidencePercent: 0,
      sourcesUsed: [],
      missingData: ['A specific question is needed.'],
      safetyNotes: [MEDICAL_SAFETY_NOTE],
      canAnswerWithAvailableData: false,
    };
  }

  if (isSourceOverviewQuestion(normalizedQuestion)) {
    const visibleSources = context.sources.filter((source) => source.status !== 'excluded');
    const activeSources = visibleSources.filter((source) => source.status === 'available');
    const plannedSources = visibleSources.filter((source) => source.status === 'planned_locked');
    const missingSources = visibleSources.filter((source) => source.status === 'missing');

    return {
      kind: 'source_overview',
      answer: [
        activeSources.length > 0
          ? `Available sourced areas: ${activeSources.map((source) => source.title).join(', ')}.`
          : 'No sourced health values are available to Ask One L1fe yet.',
        plannedSources.length > 0
          ? `Visible but not active yet: ${plannedSources.map((source) => source.title).join(', ')}.`
          : '',
        missingSources.length > 0
          ? `Needs data before answers can be personalized: ${missingSources.map((source) => source.title).join(', ')}.`
          : '',
      ].filter(Boolean).join(' '),
      estimateConfidencePercent: activeSources.length > 0 ? 70 : 35,
      sourcesUsed: visibleSources,
      missingData: missingSources.map((source) => source.title),
      safetyNotes: [MEDICAL_SAFETY_NOTE],
      canAnswerWithAvailableData: activeSources.length > 0,
    };
  }

  const usableFacts = context.facts.filter((fact) => {
    const source = context.sources.find((candidate) => candidate.id === fact.sourceId);
    return source?.status === 'available';
  });

  if (usableFacts.length === 0) {
    return {
      kind: 'insufficient_data',
      answer:
        'I do not have enough sourced user data to answer this yet. Add or sync data first, then Ask One L1fe can summarize what it used and where it came from.',
      estimateConfidencePercent: 20,
      sourcesUsed: context.sources.filter((source) => source.status !== 'excluded'),
      missingData: collectMissingData(context),
      safetyNotes: [MEDICAL_SAFETY_NOTE, 'No values were inferred or invented.'],
      canAnswerWithAvailableData: false,
    };
  }

  const safeFacts = usableFacts.filter((fact) => fact.medicalInterpretationAllowed);
  const factsToUse = safeFacts.length > 0 ? safeFacts : usableFacts;
  const sourceIds = new Set(factsToUse.map((fact) => fact.sourceId));
  const sourcesUsed = context.sources.filter((source) => sourceIds.has(source.id));

  return {
    kind: 'data_summary',
    answer: `Based on the sourced data currently available, I can summarize: ${factsToUse
      .map((fact) => `${fact.label}: ${fact.valueSummary}`)
      .join('; ')}. This is a data summary, not a diagnosis or treatment recommendation.`,
    estimateConfidencePercent: boundConfidence(55 + factsToUse.length * 8 - countStaleFacts(factsToUse) * 12),
    sourcesUsed,
    missingData: collectMissingData(context),
    safetyNotes: [MEDICAL_SAFETY_NOTE],
    canAnswerWithAvailableData: true,
  };
}

function isSourceOverviewQuestion(question: string): boolean {
  const normalized = question.toLowerCase();
  return (
    normalized.includes('source') ||
    normalized.includes('quelle') ||
    normalized.includes('datenquelle') ||
    normalized.includes('connected') ||
    (normalized.includes('available') && normalized.includes('data')) ||
    (normalized.includes('verfügbar') && normalized.includes('daten')) ||
    normalized.includes('verfügbar')
  );
}

function collectMissingData(context: AskOneL1feContext): string[] {
  const missing = context.sources
    .filter((source) => source.status === 'missing')
    .map((source) => source.title);

  if (missing.length === 0 && context.facts.length === 0) {
    return ['No sourced user facts are loaded.'];
  }

  return missing;
}

function countStaleFacts(facts: AskOneL1feFact[]): number {
  return facts.filter((fact) => fact.freshness === 'stale').length;
}

function boundConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
