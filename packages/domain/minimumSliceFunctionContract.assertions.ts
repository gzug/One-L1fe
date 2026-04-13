import { parseMinimumSliceFunctionRequestBody, parseOptionalDateFromIso } from './minimumSliceFunctionContract.ts';

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

export function runMinimumSliceFunctionContractAssertions(): void {
  const parsed = parseMinimumSliceFunctionRequestBody({
    panel: {
      panelId: 'panel_demo_1',
      collectedAt: '2026-04-10T08:00:00.000Z',
      source: 'manual',
      entries: [
        { marker: 'apob', value: 118, unit: 'mg/dL' },
        { marker: 'glucose', value: 104, unit: 'mg/dL', fastingContext: true },
      ],
    },
    persistence: {
      labResultId: '11111111-1111-1111-1111-111111111111',
      interpretedEntryLabResultEntryIds: {
        apob: 'entry_apob_1',
      },
      derivedInsightId: 'derived_1',
      auditTraceId: 'trace_1',
    },
    execution: {
      now: '2026-04-13T02:50:00.000Z',
      createdAt: '2026-04-13T02:50:00.000Z',
    },
  });

  assert(parsed.panel.panelId === 'panel_demo_1', 'Parsed contract should keep panel ids.');
  assert(parsed.panel.entries.length === 2, 'Parsed contract should keep entry count.');
  assert(parsed.persistence?.interpretedEntryLabResultEntryIds?.apob === 'entry_apob_1', 'Parsed contract should keep entry linkage maps.');
  assert(parseOptionalDateFromIso(parsed.execution?.now, 'execution.now')?.toISOString() === '2026-04-13T02:50:00.000Z', 'ISO execution timestamps should convert into Date values.');

  assertThrows(() => parseMinimumSliceFunctionRequestBody(null), 'Request body must be a JSON object.');
  assertThrows(() => parseMinimumSliceFunctionRequestBody({ panel: 'bad' }), 'panel must be an object.');
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: '2026-04-10T08:00:00.000Z', entries: [] } }),
    'panel.entries must be a non-empty array.',
  );
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: 'not-a-date', entries: [{ marker: 'apob' }] } }),
    'panel.collectedAt must be a valid ISO timestamp.',
  );
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: '2026-04-10T08:00:00.000Z', entries: [{ marker: 'apob', value: '118' }] } }),
    'panel.entries[0].value must be a number or null.',
  );
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: '2026-04-10T08:00:00.000Z', entries: [{ marker: 'apob', fastingContext: 'yes' }] } }),
    'panel.entries[0].fastingContext must be a boolean or null.',
  );
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: '2026-04-10T08:00:00.000Z', entries: [{ marker: 'apob', collectedAt: 'bad-date' }] } }),
    'panel.entries[0].collectedAt must be a valid ISO timestamp.',
  );
  assertThrows(
    () => parseMinimumSliceFunctionRequestBody({ panel: { panelId: 'x', collectedAt: '2026-04-10T08:00:00.000Z', entries: [{ marker: 'apob' }] }, execution: { now: 'not-a-date' } }),
    'execution.now must be a valid ISO timestamp.',
  );
}
