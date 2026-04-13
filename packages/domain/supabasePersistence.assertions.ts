import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import { evaluateMinimumSlice } from './minimumSlice.ts';
import { toInterpretationPersistencePayload } from './contracts.ts';
import { toSupabasePersistenceBundle } from './supabasePayload.ts';
import {
  PersistInterpretationResult,
  SupabasePersistenceClient,
  SupabaseSelectBuilder,
  SupabaseTableClient,
  persistInterpretationBundle,
} from './supabasePersistence.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

interface CapturedCall {
  table: string;
  values: unknown;
  onConflict: string;
  selectColumns: string;
}

class FakeSelectBuilder<Row> implements SupabaseSelectBuilder<Row> {
  constructor(
    private readonly call: Omit<CapturedCall, 'selectColumns'>,
    private readonly calls: CapturedCall[],
    private readonly rows: Row[],
  ) {}

  async select(columns: string): Promise<{ data: Row[]; error: null }> {
    this.calls.push({
      ...this.call,
      selectColumns: columns,
    });

    return {
      data: this.rows,
      error: null,
    };
  }
}

class FakeTableClient<InsertRow, Row> implements SupabaseTableClient<InsertRow, Row> {
  constructor(
    private readonly table: string,
    private readonly calls: CapturedCall[],
    private readonly rows: Row[],
  ) {}

  upsert(values: InsertRow | InsertRow[], options: { onConflict: string }): SupabaseSelectBuilder<Row> {
    return new FakeSelectBuilder<Row>(
      {
        table: this.table,
        values,
        onConflict: options.onConflict,
      },
      this.calls,
      this.rows,
    );
  }
}

class FakeSupabaseClient implements SupabasePersistenceClient {
  public readonly calls: CapturedCall[] = [];

  from<InsertRow, Row>(table: string): SupabaseTableClient<InsertRow, Row> {
    if (table === 'interpretation_runs') {
      return new FakeTableClient<InsertRow, Row>(
        table,
        this.calls,
        [{ id: 'run_row_1', external_run_id: 'irun_panel_primary_v1-draft-implementation-bridge' } as Row],
      );
    }

    if (table === 'interpreted_entries') {
      return new FakeTableClient<InsertRow, Row>(
        table,
        this.calls,
        [
          { id: 'entry_row_1', external_entry_id: 'ientry_panel_primary_apob' } as Row,
          { id: 'entry_row_2', external_entry_id: 'ientry_panel_primary_hba1c' } as Row,
        ],
      );
    }

    if (table === 'recommendations') {
      return new FakeTableClient<InsertRow, Row>(
        table,
        this.calls,
        [{ id: 'rec_row_1', external_recommendation_id: 'rec_panel_primary_1_LIP-001' } as Row],
      );
    }

    throw new Error(`Unexpected table: ${table}`);
  }
}

async function runFakePersistence(): Promise<{ client: FakeSupabaseClient; result: PersistInterpretationResult }> {
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
    auditTraceId: 'trace_demo_2',
  });

  const client = new FakeSupabaseClient();
  const result = await persistInterpretationBundle(client, bundle);

  return { client, result };
}

export async function runSupabasePersistenceAssertions(): Promise<void> {
  const { client, result } = await runFakePersistence();

  assert(result.interpretationRunId === 'run_row_1', 'Persistence result should return the resolved interpretation run row id.');
  assert(result.externalRunId === 'irun_panel_primary_v1-draft-implementation-bridge', 'Persistence result should return the external run id.');
  assert(result.interpretedEntryIds.length === 2, 'Persistence result should return interpreted entry row ids.');
  assert(result.recommendationIds.length === 1, 'Persistence result should return recommendation row ids.');

  assert(client.calls.length === 3, 'Persistence should perform three ordered upserts.');
  assert(client.calls[0]?.table === 'interpretation_runs', 'Persistence should upsert interpretation_runs first.');
  assert(client.calls[0]?.onConflict === 'external_run_id', 'Interpretation runs should upsert by external_run_id.');
  assert(client.calls[1]?.table === 'interpreted_entries', 'Persistence should upsert interpreted_entries second.');
  assert(client.calls[1]?.onConflict === 'external_entry_id', 'Interpreted entries should upsert by external_entry_id.');
  assert(client.calls[2]?.table === 'recommendations', 'Persistence should upsert recommendations third.');
  assert(client.calls[2]?.onConflict === 'external_recommendation_id', 'Recommendations should upsert by external_recommendation_id.');

  const interpretedEntryRows = client.calls[1]?.values as Array<{ interpretation_run_id?: string }>;
  const recommendationRows = client.calls[2]?.values as Array<{ interpretation_run_id?: string }>;

  assert(
    interpretedEntryRows.every((row) => row.interpretation_run_id === 'run_row_1'),
    'Interpreted entry writes should be backfilled with the resolved interpretation run id.',
  );
  assert(
    recommendationRows.every((row) => row.interpretation_run_id === 'run_row_1'),
    'Recommendation writes should be backfilled with the resolved interpretation run id.',
  );
}
