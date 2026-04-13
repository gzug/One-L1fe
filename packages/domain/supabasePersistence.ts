import {
  SupabaseInterpretedEntryInsert,
  SupabaseInterpretationRunInsert,
  SupabasePersistenceBundle,
  SupabaseRecommendationInsert,
} from './supabasePayload';

export interface SupabaseWriteError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SupabaseWriteResponse<Row> {
  data: Row[] | null;
  error: SupabaseWriteError | null;
}

export interface SupabaseSelectBuilder<Row> {
  select(columns: string): Promise<SupabaseWriteResponse<Row>>;
}

export interface SupabaseTableClient<InsertRow, Row> {
  upsert(values: InsertRow | InsertRow[], options: { onConflict: string }): SupabaseSelectBuilder<Row>;
}

export interface SupabasePersistenceClient {
  from<InsertRow, Row>(table: string): SupabaseTableClient<InsertRow, Row>;
}

interface InterpretationRunRowRef {
  id: string;
  external_run_id: string;
}

interface InterpretedEntryRowRef {
  id: string;
  external_entry_id: string;
}

interface RecommendationRowRef {
  id: string;
  external_recommendation_id: string;
}

export interface PersistInterpretationResult {
  interpretationRunId: string;
  externalRunId: string;
  interpretedEntryIds: string[];
  externalEntryIds: string[];
  recommendationIds: string[];
  externalRecommendationIds: string[];
}

function formatError(error: SupabaseWriteError): string {
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(' | ');
}

async function upsertAndSelect<InsertRow, Row>(
  client: SupabasePersistenceClient,
  table: string,
  values: InsertRow | InsertRow[],
  onConflict: string,
  selectColumns: string,
): Promise<Row[]> {
  const response = await client
    .from<InsertRow, Row>(table)
    .upsert(values, { onConflict })
    .select(selectColumns);

  if (response.error) {
    throw new Error(`Supabase upsert failed for ${table}: ${formatError(response.error)}`);
  }

  if (!response.data) {
    throw new Error(`Supabase upsert for ${table} returned no data.`);
  }

  return response.data;
}

export async function persistInterpretationBundle(
  client: SupabasePersistenceClient,
  bundle: SupabasePersistenceBundle,
): Promise<PersistInterpretationResult> {
  const interpretationRuns = await upsertAndSelect<SupabaseInterpretationRunInsert, InterpretationRunRowRef>(
    client,
    'interpretation_runs',
    bundle.interpretationRun,
    'external_run_id',
    'id, external_run_id',
  );

  const interpretationRun = interpretationRuns[0];

  if (!interpretationRun) {
    throw new Error('Supabase upsert for interpretation_runs returned an empty row set.');
  }

  const interpretedEntriesPayload: SupabaseInterpretedEntryInsert[] = bundle.interpretedEntries.map((entry) => ({
    ...entry,
    interpretation_run_id: interpretationRun.id,
  }));

  const recommendationsPayload: SupabaseRecommendationInsert[] = bundle.recommendations.map((recommendation) => ({
    ...recommendation,
    interpretation_run_id: interpretationRun.id,
  }));

  const interpretedEntries = interpretedEntriesPayload.length
    ? await upsertAndSelect<SupabaseInterpretedEntryInsert, InterpretedEntryRowRef>(
        client,
        'interpreted_entries',
        interpretedEntriesPayload,
        'external_entry_id',
        'id, external_entry_id',
      )
    : [];

  const recommendations = recommendationsPayload.length
    ? await upsertAndSelect<SupabaseRecommendationInsert, RecommendationRowRef>(
        client,
        'recommendations',
        recommendationsPayload,
        'external_recommendation_id',
        'id, external_recommendation_id',
      )
    : [];

  return {
    interpretationRunId: interpretationRun.id,
    externalRunId: interpretationRun.external_run_id,
    interpretedEntryIds: interpretedEntries.map((entry) => entry.id),
    externalEntryIds: interpretedEntries.map((entry) => entry.external_entry_id),
    recommendationIds: recommendations.map((recommendation) => recommendation.id),
    externalRecommendationIds: recommendations.map((recommendation) => recommendation.external_recommendation_id),
  };
}
