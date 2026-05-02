export type TimeRange = '1d' | '7d' | '1m' | '3m' | '6m' | 'max' | 'custom';

export type CustomRange = {
  start: Date | null;
  end: Date | null;
};

export const TIME_RANGE_OPTIONS: TimeRange[] = ['1d', '7d', '1m', '3m', '6m', 'max', 'custom'];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '1d': '1D',
  '7d': '1W',
  '1m': '1M',
  '3m': '3M',
  '6m': '6M',
  'max': 'Max',
  'custom': 'Custom',
};

export const DEFAULT_TIME_RANGE: TimeRange = '7d';
