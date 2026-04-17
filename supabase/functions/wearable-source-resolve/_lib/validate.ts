import type { WearableSourceResolveRequest } from './types.ts';

const VALID_SOURCE_KINDS = [
  'apple_health',
  'health_connect',
  'vendor_api',
  'manual_import',
] as const;

function normalizeOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new Error('Optional source identifier fields must be strings, null, or omitted.');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateWearableSourceResolveRequest(
  raw: unknown,
): WearableSourceResolveRequest {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Request body must be a JSON object.');
  }

  const body = raw as Record<string, unknown>;
  const sourceKind = body.source_kind;
  if (!VALID_SOURCE_KINDS.includes(sourceKind as never)) {
    throw new Error(
      `source_kind must be one of: ${VALID_SOURCE_KINDS.join(', ')}.`,
    );
  }

  if (typeof body.vendor_name !== 'string' || body.vendor_name.trim().length === 0) {
    throw new Error('vendor_name is required (non-empty string).');
  }

  const appInstallId = normalizeOptionalString(body.app_install_id);
  const deviceHardwareId = normalizeOptionalString(body.device_hardware_id);
  const sourceAppId = normalizeOptionalString(body.source_app_id);

  if (!appInstallId && !deviceHardwareId) {
    throw new Error(
      'At least one instance-level identifier is required: app_install_id or device_hardware_id.',
    );
  }

  return {
    source_kind: sourceKind as WearableSourceResolveRequest['source_kind'],
    vendor_name: body.vendor_name.trim().toLowerCase(),
    app_install_id: appInstallId,
    device_hardware_id: deviceHardwareId,
    source_app_id: sourceAppId,
    source_app_name: normalizeOptionalString(body.source_app_name),
    device_label: normalizeOptionalString(body.device_label),
  };
}
