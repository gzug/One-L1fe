import {
  AskOneL1feContext,
  buildAskOneL1feAnswer,
  createPrototypeAskOneL1feContext,
} from './askOneL1fe.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runAskOneL1feAssertions(): void {
  const prototype = createPrototypeAskOneL1feContext();
  const noDataAnswer = buildAskOneL1feAnswer('What does my current data say?', prototype);

  assert(noDataAnswer.kind === 'insufficient_data', 'Prototype Ask should refuse health answers without sourced facts.');
  assert(noDataAnswer.canAnswerWithAvailableData === false, 'No sourced facts must not be answerable.');
  assert(!noDataAnswer.answer.includes('Score 0'), 'Ask answer must not turn missing data into score 0.');
  assert(noDataAnswer.safetyNotes.some((note) => note.includes('does not provide medical advice')), 'Ask answer needs medical safety note.');

  const sourceOverview = buildAskOneL1feAnswer('Welche Datenquellen sind verfügbar?', prototype);
  assert(sourceOverview.kind === 'source_overview', 'Source questions should return source overview.');
  assert(sourceOverview.sourcesUsed.length > 0, 'Source overview should cite visible source areas.');
  assert(sourceOverview.sourcesUsed.every((source) => source.status !== 'excluded'), 'Excluded sources should not be cited.');

  const contextWithFact: AskOneL1feContext = {
    sources: [
      {
        id: 'manual_biomarkers',
        title: 'Manual Blood / Biomarkers',
        kind: 'manual_entry',
        status: 'available',
        updatedAt: '2026-04-24T10:00:00.000Z',
        summary: 'Manual biomarker values entered by the user.',
      },
      {
        id: 'excluded_source',
        title: 'Excluded Source',
        kind: 'prototype',
        status: 'excluded',
        updatedAt: null,
        summary: 'This source is intentionally excluded.',
      },
    ],
    facts: [
      {
        id: 'apob_summary',
        label: 'ApoB',
        valueSummary: 'available from manual entry',
        sourceId: 'manual_biomarkers',
        observedAt: '2026-04-24T10:00:00.000Z',
        freshness: 'current',
        medicalInterpretationAllowed: true,
      },
    ],
  };

  const dataSummary = buildAskOneL1feAnswer('Summarize my biomarkers', contextWithFact);
  assert(dataSummary.kind === 'data_summary', 'Available sourced facts should allow a data summary.');
  assert(dataSummary.sourcesUsed.length === 1, 'Data summary should cite only the source used.');
  assert(dataSummary.sourcesUsed[0]?.id === 'manual_biomarkers', 'Data summary should cite the fact source.');
  assert(
    dataSummary.estimateConfidencePercent >= 0 && dataSummary.estimateConfidencePercent <= 100,
    'Ask confidence must be bounded 0-100.',
  );
  assert(!dataSummary.answer.toLowerCase().includes('you have'), 'Ask should not produce diagnosis claims.');
}
