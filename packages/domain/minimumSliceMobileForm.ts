import { MinimumSlicePanelInput } from './minimumSlice.ts';

/** Default source label for manually entered panels via the mobile form. */
export const MOBILE_MANUAL_ENTRY_SOURCE = 'mobile-manual-entry';

export interface MinimumSliceMobileFormDraft {
  panelId: string;
  collectedAt: string;
  apob: string;
  ldl: string;
  hba1c: string;
  glucose: string;
  lpa?: string;
  crp?: string;
  fastingContext?: boolean;
  source?: string;
}

export interface BuildMinimumSlicePanelFromDraftOptions {
  profileId: string;
  defaultSource?: string;
}

function requireNonEmptyString(value: string, field: string): string {
  if (value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value.trim();
}

function requireIsoString(value: string, field: string): string {
  const iso = requireNonEmptyString(value, field);

  if (Number.isNaN(new Date(iso).getTime())) {
    throw new Error(`${field} must be a valid ISO timestamp.`);
  }

  return iso;
}

function parseRequiredNumber(value: string, field: string): number {
  const normalized = requireNonEmptyString(value, field);
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid number.`);
  }

  return parsed;
}

function parseOptionalNumber(value: string | undefined, field: string): number | undefined {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(value.trim());

  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid number when provided.`);
  }

  return parsed;
}

export function createMinimumSliceMobileFormDraft(): MinimumSliceMobileFormDraft {
  return {
    panelId: '',
    collectedAt: '',
    apob: '',
    ldl: '',
    hba1c: '',
    glucose: '',
    lpa: '',
    crp: '',
    fastingContext: true,
    source: MOBILE_MANUAL_ENTRY_SOURCE,
  };
}

export function buildMinimumSlicePanelInputFromMobileDraft(
  draft: MinimumSliceMobileFormDraft,
  options: BuildMinimumSlicePanelFromDraftOptions,
): MinimumSlicePanelInput {
  const panelId = requireNonEmptyString(draft.panelId, 'panelId');
  const collectedAt = requireIsoString(draft.collectedAt, 'collectedAt');
  const profileId = requireNonEmptyString(options.profileId, 'profileId');

  const glucoseEntry: MinimumSlicePanelInput['entries'][number] = {
    marker: 'glucose',
    value: parseRequiredNumber(draft.glucose, 'glucose'),
    unit: 'mg/dL',
  };

  if (draft.fastingContext !== undefined) {
    glucoseEntry.fastingContext = draft.fastingContext;
  }

  const input: MinimumSlicePanelInput = {
    profileId,
    panelId,
    collectedAt,
    source: draft.source?.trim().length ? draft.source.trim() : options.defaultSource ?? MOBILE_MANUAL_ENTRY_SOURCE,
    entries: [
      { marker: 'apob', value: parseRequiredNumber(draft.apob, 'apob'), unit: 'mg/dL' },
      { marker: 'ldl', value: parseRequiredNumber(draft.ldl, 'ldl'), unit: 'mg/dL' },
      { marker: 'hba1c', value: parseRequiredNumber(draft.hba1c, 'hba1c'), unit: '%' },
      glucoseEntry,
    ],
  };

  const lpa = parseOptionalNumber(draft.lpa, 'lpa');
  if (lpa !== undefined) {
    input.entries.push({ marker: 'lpa', value: lpa, unit: 'mg/dL' });
  }

  const crp = parseOptionalNumber(draft.crp, 'crp');
  if (crp !== undefined) {
    input.entries.push({ marker: 'crp', value: crp, unit: 'mg/L' });
  }

  return input;
}
