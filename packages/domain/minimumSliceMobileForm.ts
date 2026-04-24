import { FieldState, FieldStateReason, FieldValueSource } from './fieldValueState.ts';
import { MinimumSlicePanelInput } from './minimumSlice.ts';

export interface MinimumSliceMobileFieldMetadata {
  fieldState?: FieldState;
  valueSource?: FieldValueSource;
  stateReason?: FieldStateReason | null;
}

export type OptionalMinimumSliceMarkerKey = 'lpa' | 'crp' | 'b12' | 'magnesium';
export type CoreMinimumSliceMarkerKey = 'apob' | 'ldl' | 'hba1c' | 'glucose';
export type MinimumSliceStatusMarkerKey = CoreMinimumSliceMarkerKey | OptionalMinimumSliceMarkerKey;

export interface OptionalMinimumSliceMarkerConfig {
  marker: OptionalMinimumSliceMarkerKey;
  fieldKey: OptionalMinimumSliceMarkerKey;
  metadataKey: 'lpaMeta' | 'crpMeta' | 'b12Meta' | 'magnesiumMeta';
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
  {
    marker: 'b12',
    fieldKey: 'b12',
    metadataKey: 'b12Meta',
    label: 'B12',
    unit: 'pg/mL',
  },
  {
    marker: 'magnesium',
    fieldKey: 'magnesium',
    metadataKey: 'magnesiumMeta',
    label: 'Magnesium',
    unit: 'mg/dL',
  },
] as const;

export interface CoreMinimumSliceMarkerConfig {
  marker: CoreMinimumSliceMarkerKey;
  fieldKey: CoreMinimumSliceMarkerKey;
  metadataKey: 'apobMeta' | 'ldlMeta' | 'hba1cMeta' | 'glucoseMeta';
  unit: string;
}

export const CORE_MINIMUM_SLICE_MARKERS: readonly CoreMinimumSliceMarkerConfig[] = [
  { marker: 'apob', fieldKey: 'apob', metadataKey: 'apobMeta', unit: 'mg/dL' },
  { marker: 'ldl', fieldKey: 'ldl', metadataKey: 'ldlMeta', unit: 'mg/dL' },
  { marker: 'hba1c', fieldKey: 'hba1c', metadataKey: 'hba1cMeta', unit: '%' },
  { marker: 'glucose', fieldKey: 'glucose', metadataKey: 'glucoseMeta', unit: 'mg/dL' },
] as const;

export interface MinimumSliceMobileFormDraft {
  panelId: string;
  collectedAt: string;
  apob: string;
  apobMeta?: MinimumSliceMobileFieldMetadata;
  ldl: string;
  ldlMeta?: MinimumSliceMobileFieldMetadata;
  hba1c: string;
  hba1cMeta?: MinimumSliceMobileFieldMetadata;
  glucose: string;
  glucoseMeta?: MinimumSliceMobileFieldMetadata;
  lpa?: string;
  lpaMeta?: MinimumSliceMobileFieldMetadata;
  crp?: string;
  crpMeta?: MinimumSliceMobileFieldMetadata;
  b12?: string;
  b12Meta?: MinimumSliceMobileFieldMetadata;
  magnesium?: string;
  magnesiumMeta?: MinimumSliceMobileFieldMetadata;
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

export function getStatusMarkerConfig(marker: MinimumSliceStatusMarkerKey): CoreMinimumSliceMarkerConfig | OptionalMinimumSliceMarkerConfig {
  const coreConfig = CORE_MINIMUM_SLICE_MARKERS.find((candidate) => candidate.marker === marker);
  if (coreConfig) {
    return coreConfig;
  }

  return getOptionalMarkerConfig(marker as OptionalMinimumSliceMarkerKey);
}

export function getOptionalFieldMetadata(
  draft: MinimumSliceMobileFormDraft,
  marker: OptionalMinimumSliceMarkerKey,
): MinimumSliceMobileFieldMetadata | undefined {
  const config = getOptionalMarkerConfig(marker);
  return draft[config.metadataKey];
}

export function getStatusFieldMetadata(
  draft: MinimumSliceMobileFormDraft,
  marker: MinimumSliceStatusMarkerKey,
): MinimumSliceMobileFieldMetadata | undefined {
  const coreConfig = CORE_MINIMUM_SLICE_MARKERS.find((candidate) => candidate.marker === marker);
  if (coreConfig) {
    return draft[coreConfig.metadataKey];
  }

  return getOptionalFieldMetadata(draft, marker as OptionalMinimumSliceMarkerKey);
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

function buildStatusEntry(
  marker: MinimumSlicePanelInput['entries'][number]['marker'],
  rawValue: string | undefined,
  field: string,
  unit: string,
  metadata: MinimumSliceMobileFieldMetadata | undefined,
): MinimumSlicePanelInput['entries'][number] {
  const fieldState = metadata?.fieldState ?? 'provided';
  const value = fieldState === 'provided' ? parseRequiredNumber(rawValue ?? '', field) : null;

  return {
    marker,
    value,
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
    apobMeta: createOptionalFieldMetadata('provided'),
    ldl: '',
    ldlMeta: createOptionalFieldMetadata('provided'),
    hba1c: '',
    hba1cMeta: createOptionalFieldMetadata('provided'),
    glucose: '',
    glucoseMeta: createOptionalFieldMetadata('provided'),
    lpa: '',
    lpaMeta: createOptionalFieldMetadata('missing'),
    crp: '',
    crpMeta: createOptionalFieldMetadata('missing'),
    b12: '',
    b12Meta: createOptionalFieldMetadata('missing'),
    magnesium: '',
    magnesiumMeta: createOptionalFieldMetadata('missing'),
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

  const coreEntries = CORE_MINIMUM_SLICE_MARKERS.map((config) =>
    buildStatusEntry(
      config.marker,
      draft[config.fieldKey],
      config.fieldKey,
      config.unit,
      draft[config.metadataKey],
    ),
  );

  const glucoseEntry = coreEntries.find((entry) => entry.marker === 'glucose');

  if (glucoseEntry !== undefined && draft.fastingContext !== undefined) {
    glucoseEntry.fastingContext = draft.fastingContext;
  }

  const input: MinimumSlicePanelInput = {
    profileId,
    panelId,
    collectedAt,
    source: draft.source?.trim().length ? draft.source.trim() : options.defaultSource ?? 'mobile-manual-entry',
    entries: coreEntries,
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
