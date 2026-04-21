import { MetricKey } from './metricDefinitions';

export type AppleHealthRecordType =
  | 'HKQuantityTypeIdentifierStepCount'
  | 'HKQuantityTypeIdentifierHeight'
  | 'HKQuantityTypeIdentifierBodyMass';

export function mapAppleHealthRecordTypeToMetricKey(
  recordType: string,
): MetricKey | null {
  switch (recordType as AppleHealthRecordType) {
    case 'HKQuantityTypeIdentifierStepCount':
      return 'steps';
    case 'HKQuantityTypeIdentifierHeight':
      return 'height_cm';
    case 'HKQuantityTypeIdentifierBodyMass':
      return 'weight_kg';
    default:
      return null;
  }
}

export interface MetricAvailabilitySnapshot {
  source: 'apple_health_export' | 'healthkit' | 'health_connect' | 'manual_only';
  countsByMetricKey: Partial<Record<MetricKey, number>>;
}

