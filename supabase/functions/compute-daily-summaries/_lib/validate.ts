import type { ComputeDailySummariesRequest } from './types.ts';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_WINDOW_DAYS = 31;

export function validateComputeRequest(raw: unknown): ComputeDailySummariesRequest {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('VALIDATION: Request body must be a JSON object.');
  }

  const body = raw as Record<string, unknown>;

  if (typeof body['wearable_source_id'] !== 'string' || !body['wearable_source_id'].trim()) {
    throw new Error('VALIDATION: wearable_source_id must be a non-empty string.');
  }

  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = body['date_from'] !== undefined ? body['date_from'] : today;
  const dateTo = body['date_to'] !== undefined ? body['date_to'] : dateFrom;

  if (typeof dateFrom !== 'string' || !ISO_DATE_RE.test(dateFrom)) {
    throw new Error('VALIDATION: date_from must be in YYYY-MM-DD format.');
  }
  if (typeof dateTo !== 'string' || !ISO_DATE_RE.test(dateTo)) {
    throw new Error('VALIDATION: date_to must be in YYYY-MM-DD format.');
  }
  if (dateFrom > dateTo) {
    throw new Error('VALIDATION: date_from must be <= date_to.');
  }

  const msPerDay = 86_400_000;
  const windowDays =
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / msPerDay + 1;
  if (windowDays > MAX_WINDOW_DAYS) {
    throw new Error(`VALIDATION: Date window must not exceed ${MAX_WINDOW_DAYS} days.`);
  }

  return {
    wearable_source_id: body['wearable_source_id'].trim(),
    date_from: dateFrom,
    date_to: dateTo,
  };
}
