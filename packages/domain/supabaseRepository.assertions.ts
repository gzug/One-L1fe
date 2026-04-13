import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import { MinimumSlicePanelInput } from './minimumSlice.ts';
import {
  SupabasePersistenceClient,
  SupabaseSelectBuilder,
  SupabaseTableClient,
} from './supabasePersistence.ts';
import { saveMinimumSliceInterpretation } from './supabaseRepository.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

type RowRecord = Record<string, unknown>;

interface TableState {
  rowsByConflictKey: Map<string, RowRecord>;
  rowsById: Map<string, RowRecord>;
  nextId: number;
}

function cloneRow<Row extends RowRecord>(row: Row): Row {
  return JSON.parse(JSON.stringify(row)) as Row;
}

function normalizeValues<InsertRow>(values: InsertRow | InsertRow[]): InsertRow[] {
  return Array.isArray(values) ? values : [values];
}

class StatefulSelectBuilder<Row extends RowRecord> implements SupabaseSelectBuilder<Row> {
  constructor(
    private readonly tableState: TableState,
    private readonly values: Row[],
    private readonly onConflict: string,
  ) {}

  async select(columns: string): Promise<{ data: Row[]; error: null }> {
    const requestedColumns = columns
      .split(',')
      .map((column) => column.trim())
      .filter(Boolean);

    const rows = this.values.map((value) => {
      const conflictValue = String(value[this.onConflict]);
      const existingRow = this.tableState.rowsByConflictKey.get(conflictValue);
      const id = existingRow?.id ?? `${this.onConflict}_row_${this.tableState.nextId++}`;
      const mergedRow = {
        ...(existingRow ?? {}),
        ...cloneRow(value),
        id,
      };

      this.tableState.rowsByConflictKey.set(conflictValue, mergedRow);
      this.tableState.rowsById.set(String(id), mergedRow);

      const selectedRow: RowRecord = {};

      for (const column of requestedColumns) {
        selectedRow[column] = mergedRow[column];
      }

      return selectedRow as Row;
    });

    return {
      data: rows,
      error: null,
    };
  }
}

class StatefulTableClient<InsertRow extends RowRecord, Row extends RowRecord>
  implements SupabaseTableClient<InsertRow, Row>
{
  constructor(
    private readonly tableState: TableState,
  ) {}

  upsert(values: InsertRow | InsertRow[], options: { onConflict: string }): SupabaseSelectBuilder<Row> {
    return new StatefulSelectBuilder<Row>(
      this.tableState,
      normalizeValues(values) as unknown as Row[],
      options.onConflict,
    );
  }
}

class StatefulFakeSupabaseClient implements SupabasePersistenceClient {
  private readonly tables = new Map<string, TableState>();

  from<InsertRow, Row>(table: string): SupabaseTableClient<InsertRow, Row> {
    const tableState = this.tables.get(table) ?? {
      rowsByConflictKey: new Map<string, RowRecord>(),
      rowsById: new Map<string, RowRecord>(),
      nextId: 1,
    };

    this.tables.set(table, tableState);

    return new StatefulTableClient<InsertRow & RowRecord, Row & RowRecord>(tableState) as SupabaseTableClient<InsertRow, Row>;
  }

  getStoredRow(table: string, key: string): RowRecord | undefined {
    return this.tables.get(table)?.rowsByConflictKey.get(key);
  }

  getStoredRowCount(table: string): number {
    return this.tables.get(table)?.rowsByConflictKey.size ?? 0;
  }
}

function cloneFixtureWithChangedApoB(apobValue: number): MinimumSlicePanelInput {
  return {
    ...fixturePrimaryLipidWithBoundedModifiers,
    entries: fixturePrimaryLipidWithBoundedModifiers.entries.map((entry) =>
      entry.marker === 'apob'
        ? {
            ...entry,
            value: apobValue,
          }
        : { ...entry },
    ),
  };
}

export async function runSupabaseRepositoryAssertions(): Promise<void> {
  const client = new StatefulFakeSupabaseClient();
  const baseNow = new Date('2026-04-12T21:50:00.000Z');

  const firstRun = await saveMinimumSliceInterpretation(client, fixturePrimaryLipidWithBoundedModifiers, {
    now: baseNow,
    createdAt: '2026-04-12T21:50:00.000Z',
    labResultId: '11111111-1111-1111-1111-111111111111',
    interpretedEntryLabResultEntryIds: {
      apob: 'entry_apob_1',
      hba1c: 'entry_hba1c_1',
    },
    derivedInsightId: 'derived_insight_1',
    auditTraceId: 'trace_repo_1',
  });

  const secondRun = await saveMinimumSliceInterpretation(client, cloneFixtureWithChangedApoB(130), {
    now: baseNow,
    createdAt: '2026-04-13T06:20:00.000Z',
    labResultId: '11111111-1111-1111-1111-111111111111',
    interpretedEntryLabResultEntryIds: {
      apob: 'entry_apob_1',
      hba1c: 'entry_hba1c_1',
    },
    derivedInsightId: 'derived_insight_2',
    auditTraceId: 'trace_repo_2',
  });

  assert(firstRun.persistence.interpretationRunId === secondRun.persistence.interpretationRunId, 'Repeated saves should resolve the same interpretation run row id.');
  assert(firstRun.persistence.externalRunId === secondRun.persistence.externalRunId, 'Repeated saves should keep the same external run id.');
  assert(firstRun.persistence.interpretedEntryIds.join(',') === secondRun.persistence.interpretedEntryIds.join(','), 'Repeated saves should rewrite the same interpreted entry rows.');
  assert(firstRun.persistence.recommendationIds.join(',') === secondRun.persistence.recommendationIds.join(','), 'Repeated saves should rewrite the same recommendation rows.');

  assert(client.getStoredRowCount('interpretation_runs') === 1, 'Repeated saves should not create duplicate interpretation runs.');
  assert(client.getStoredRowCount('interpreted_entries') === firstRun.evaluation.entries.length, 'Repeated saves should keep interpreted entry row count stable.');
  assert(client.getStoredRowCount('recommendations') === firstRun.evaluation.recommendations.length, 'Repeated saves should keep recommendation row count stable.');

  const storedRun = client.getStoredRow('interpretation_runs', secondRun.persistence.externalRunId);
  assert(storedRun?.audit_trace_id === 'trace_repo_2', 'Repeated saves should update interpretation run fields on conflict.');
  assert(storedRun?.lab_result_id === '11111111-1111-1111-1111-111111111111', 'The repository should persist lab result linkage.');

  const storedApoBEntry = client.getStoredRow('interpreted_entries', 'ientry_panel_demo_1_apob');
  assert(storedApoBEntry?.raw_value === 130, 'Repeated saves should update interpreted entry payload fields in place.');
  assert(storedApoBEntry?.lab_result_entry_id === 'entry_apob_1', 'The repository should persist lab result entry linkage when provided.');

  const storedRecommendation = client.getStoredRow('recommendations', 'rec_panel_demo_1_1_LIP-001');
  assert(storedRecommendation?.derived_insight_id === 'derived_insight_2', 'Repeated saves should update recommendation linkage fields on conflict.');
  assert(storedRecommendation?.profile_id === fixturePrimaryLipidWithBoundedModifiers.profileId, 'The repository should persist recommendation profile linkage.');
}
