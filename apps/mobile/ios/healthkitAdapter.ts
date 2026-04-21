import { MetricAvailabilitySnapshot } from '../metrics/appleHealthTypeMapping';

export type HealthKitAdapterStatus = 'not_wired' | 'ready';

export function getHealthKitAdapterStatus(): HealthKitAdapterStatus {
  return 'not_wired';
}

export async function fetchHealthKitAvailabilitySnapshot(): Promise<MetricAvailabilitySnapshot | null> {
  return null;
}

