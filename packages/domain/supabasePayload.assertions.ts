import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1';
import { evaluateMinimumSlice } from './minimumSlice';
import { toInterpretationPersistencePayload } from './contracts';
import { toSupabasePersistenceBundle } from './supabasePayload';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runSupabasePayloadAssertions(): void {
  const evaluation = evaluateMinimumSlice(
    fixturePrimaryLipidWithBoundedModifiers,
    new Date('2026-04-12T21:50:00.000Z'),
  );
  const persistencePayload = toInterpretationPersistencePayload(
    evaluation,
    fixturePrimaryLipidWithBoundedModifiers,
    '2026-04-12T21:50:00.000Z',
  );
  const bundle = toSupabasePersistenceBundle(persistencePayload, {
    labResultId: '11111111-1111-1111-1111-111111111111',
    interpretedEntryLabResultEntryIds: {
      apob: '22222222-2222-2222-2222-222222222222',
    },
    auditTraceId: 'trace_demo_1',
  });

  assert(bundle.interpretationRun.lab_result_id === '11111111-1111-1111-1111-111111111111', 'Supabase bundle should map the lab result id override.');
  assert(bundle.interpretationRun.audit_trace_id === 'trace_demo_1', 'Supabase bundle should carry audit trace ids when provided.');
  assert(bundle.interpretedEntries.length === persistencePayload.entries.length, 'All interpreted entries should map into the Supabase bundle.');
  assert(
    bundle.interpretedEntries.some(
      (entry) => entry.marker_key === 'apob' && entry.lab_result_entry_id === '22222222-2222-2222-2222-222222222222',
    ),
    'Supabase bundle should support mapping interpreted entries back to raw lab result entries.',
  );
  assert(
    bundle.recommendations.some((recommendation) => recommendation.anchor_source_id != null),
    'Supabase recommendations should preserve anchor source ids when available.',
  );
}
