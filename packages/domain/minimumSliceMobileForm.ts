import { FieldState, FieldStateReason, FieldValueSource } from './fieldValueState.ts';
import { MinimumSlicePanelInput } from './minimumSlice.ts';

export interface MinimumSliceMobileFieldMetadata {
  fieldState?: FieldState;
  valueSource?: FieldValueSource;
  stateReason?: FieldStateReason | null;
}

export type OptionalMinimumSliceMarkerKey = 'lpa' | 'crp';

export interface OptionalMinimumSliceMarkerConfig {
  marker: OptionalMinimumSliceMarkerKey;
  fieldKey: OptionalMinimumSliceMarkerKey;
  metadataKey: 'lpaMeta' | 'crpMeta';
  label: string;
  unit: string;
}

export const OPTIONAL_MINIMUM_SLICE_MARKERS: readonly OptionalMinimumSliceMarkerConfig[] = [
  {
    marker: 'lpa',
    fieldKey: 'lpa',
    metadataKey: 'lpaMeta',
    label: 'Lp(a)',
    unit: 'mg/dL',
  },
  {
    marker: 'crp',
    fieldKey: 'crp',
    metadataKey: 'crpMeta',
    label: 'CRP',
    unit: 'mg/L',
  },
] as const;

export interface MinimumSliceMobileFormDraft {
  panelId: string;
  collectedAt: string;
  apob: string;
  ldl: string;
  hba1c: string;
  glucose: string;
  lpa?: string;
  lpaMeta?: MinimumSliceMobileFieldMetadata;
  crp?: string;
  crpMeta?: MinimumSliceMobileFieldMetadata;
  fastingContext?: boolean;
  source?: string;
}

export function createOptionalFieldMetadata(
  fieldState: Extract<FieldState, 'provided' | 'missing' | 'disabled'>,
): MinimumSliceMobileFieldMetadata {
  if (fieldState === 'provided') {
    return { fieldState: 'provided', valueSource: 'manual', stateReason: null };
  }

  if (fieldState === 'disabled') {
    return { fieldState: 'disabled', valueSource: 'manual', stateReason: 'user_disabled' };
  }

  return { fieldState: 'missing', valueSource: 'unknown', stateReason: 'not_available' };
}

export function getOptionalMarkerConfig(marker: OptionalMinimumSliceMarkerKey): OptionalMinimumSliceMarkerConfig {
  const config = OPTIONAL_MINIMUM_SLICE_MARKERS.find((candidate) => candidate.marker === marker);
  if (!config) {
    throw new Error(`Unsupported optional minimum-slice marker: ${marker}`);
  }

  return config;
}

export function getOptionalFieldMetadata(
  draft: MinimumSliceMobileFormDraft,
  marker: OptionalMinimumSliceMarkerKey,
): MinimumSliceMobileFieldMetadata | undefined {
  const config = getOptionalMarkerConfig(marker);
  return draft[config.metadataKey];
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

function hasFieldMetadata(metadata: MinimumSliceMobileFieldMetadata | undefined): boolean {
  return metadata?.fieldState !== undefined || metadata?.valueSource !== undefined || metadata?.stateReason !== undefined;
}

function buildOptionalEntry(
  marker: MinimumSlicePanelInput['entries'][number]['marker'],
  rawValue: string | undefined,
  field: string,
  unit: string,
  metadata: MinimumSliceMobileFieldMetadata | undefined,
): MinimumSlicePanelInput['entries'][number] | undefined {
  const value = parseOptionalNumber(rawValue, field);

  if (value === undefined && !hasFieldMetadata(metadata)) {
    return undefined;
  }

  return {
    marker,
    value: value ?? null,
    unit,
    ...(metadata?.fieldState !== undefined ? { field_state: metadata.fieldState } : {}),
    ...(metadata?.valueSource !== undefined ? { value_source: metadata.valueSource } : {}),
    ...(metadata?.stateReason !== undefined ? { state_reason: metadata.stateReason } : {}),
  };
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
    lpaMeta: createOptionalFieldMetadata('missing'),
    crp: '',
    crpMeta: createOptionalFieldMetadata('missing'),
    fastingContext: true,
    source: 'mobile-manual-entry',
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
    source: draft.source?.trim().length ? draft.source.trim() : options.defaultSource ?? 'mobile-manual-entry',
    entries: [
      { marker: 'apob', value: parseRequiredNumber(draft.apob, 'apob'), unit: 'mg/dL' },
      { marker: 'ldl', value: parseRequiredNumber(draft.ldl, 'ldl'), unit: 'mg/dL' },
      { marker: 'hba1c', value: parseRequiredNumber(draft.hba1c, 'hba1c'), unit: '%' },
      glucoseEntry,
    ],
  };

  for (const config of OPTIONAL_MINIMUM_SLICE_MARKERS) {
    const entry = buildOptionalEntry(
      config.marker,
      draft[config.fieldKey],
      config.fieldKey,
      config.unit,
      draft[config.metadataKey],
    );

    if (entry !== undefined) {
      input.entries.push(entry);
    }
  }

  return input;
}
