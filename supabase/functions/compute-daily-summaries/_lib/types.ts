/**
 * Types for compute-daily-summaries edge function.
 *
 * Kept local to this function — not shared with mobile.
 * The response shape is stable and suitable for the mobile layer to consume
 * after a wearables-sync call.
 */

export interface ComputeDailySummariesRequest {
  /** Source to compute summaries for. Must belong to the authenticated user. */
  wearable_source_id: string;
  /**
   * Inclusive start date in YYYY-MM-DD format.
   * Defaults to today in UTC if omitted.
   */
  date_from?: string;
  /**
   * Inclusive end date in YYYY-MM-DD format.
   * Defaults to date_from (i.e. single day) if omitted.
   * Maximum window: 31 days to prevent runaway queries.
   */
  date_to?: string;
}

export interface DailySummaryRow {
  summary_key: string;
  summary_date: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  quality_flag: 'good' | 'partial' | 'uncertain' | 'insufficient';
  derived_from: string[];
}

export interface ComputeDailySummariesResponse {
  wearable_source_id: string;
  date_from: string;
  date_to: string;
  summaries_written: number;
  computation_version: string;
  error_summary: string | null;
}
