import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricKey, MetricValueType } from './metricDefinitions';

export type ManualMetricValue = { type: MetricValueType; value: number | string };
export type ManualMetricsByKey = Partial<Record<MetricKey, ManualMetricValue>>;

const STORAGE_PREFIX = 'one-l1fe.manual-metrics.v1.';

export function getISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function loadManualMetricsForDate(isoDate: string): Promise<ManualMetricsByKey> {
  const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}${isoDate}`);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ManualMetricsByKey;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function saveManualMetricForDate(
  isoDate: string,
  key: MetricKey,
  metricValue: ManualMetricValue | null,
): Promise<void> {
  const current = await loadManualMetricsForDate(isoDate);
  const next: ManualMetricsByKey = { ...current };
  if (metricValue === null) {
    delete next[key];
  } else {
    next[key] = metricValue;
  }
  await AsyncStorage.setItem(`${STORAGE_PREFIX}${isoDate}`, JSON.stringify(next));
}

