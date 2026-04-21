export type MetricKey =
  | 'steps'
  | 'height_cm'
  | 'weight_kg'
  | 'workout_run_minutes'
  | 'sleep_minutes'
  | 'resting_heart_rate_bpm'
  | 'hrv_rmssd_ms'
  | 'active_energy_kcal'
  | 'mood'
  | 'stress'
  | 'subjective_energy';

export type MetricValueType = 'number' | 'text';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  unit?: string;
  valueType: MetricValueType;
  category: 'Body' | 'Activity' | 'Recovery' | 'Mind';
  description?: string;
}

export const METRICS: ReadonlyArray<MetricDefinition> = [
  {
    key: 'steps',
    label: 'Steps',
    unit: 'count',
    valueType: 'number',
    category: 'Activity',
  },
  {
    key: 'workout_run_minutes',
    label: 'Running (workout minutes)',
    unit: 'min',
    valueType: 'number',
    category: 'Activity',
  },
  {
    key: 'active_energy_kcal',
    label: 'Active energy',
    unit: 'kcal',
    valueType: 'number',
    category: 'Activity',
  },
  {
    key: 'sleep_minutes',
    label: 'Sleep duration',
    unit: 'min',
    valueType: 'number',
    category: 'Recovery',
  },
  {
    key: 'resting_heart_rate_bpm',
    label: 'Resting heart rate',
    unit: 'bpm',
    valueType: 'number',
    category: 'Recovery',
  },
  {
    key: 'hrv_rmssd_ms',
    label: 'HRV (RMSSD)',
    unit: 'ms',
    valueType: 'number',
    category: 'Recovery',
    description: 'Method matters: don’t compare RMSSD vs SDNN without tagging.',
  },
  {
    key: 'height_cm',
    label: 'Height',
    unit: 'cm',
    valueType: 'number',
    category: 'Body',
  },
  {
    key: 'weight_kg',
    label: 'Weight',
    unit: 'kg',
    valueType: 'number',
    category: 'Body',
  },
  {
    key: 'mood',
    label: 'Mood',
    valueType: 'text',
    category: 'Mind',
  },
  {
    key: 'stress',
    label: 'Stress',
    valueType: 'text',
    category: 'Mind',
  },
  {
    key: 'subjective_energy',
    label: 'Subjective energy',
    valueType: 'text',
    category: 'Mind',
  },
] as const;

