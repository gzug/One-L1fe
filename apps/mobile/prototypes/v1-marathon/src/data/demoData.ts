export type PrototypeDataMode = 'demo' | 'real';

export type ReadinessSegment = {
  label: string;
  value: number; // 0–100
  isDemo: boolean;
};

export type TrainingSignal = {
  label: string;
  value: string;
  unit?: string;
  status: 'available' | 'needs_attention' | 'not_available';
  isDemo: boolean;
};

export type BloodMarker = {
  label: string;
  value: string;
  unit?: string;
  status: 'available' | 'needs_attention' | 'not_available';
  dateLabel: string;
  isDemo: boolean;
};

export type CoachingStep = {
  title: string;
  body: string;
  priority: 'primary' | 'supporting' | 'context';
  isDemo: boolean;
};

export const prototypeMode: PrototypeDataMode = 'demo';

export const readinessSegments: ReadinessSegment[] = [
  { label: 'Recovery', value: 68, isDemo: true },
  { label: 'Training load', value: 74, isDemo: true },
  { label: 'Biomarker context', value: 61, isDemo: true },
  { label: 'Data coverage', value: 72, isDemo: true },
];

export const trainingSignals: TrainingSignal[] = [
  {
    label: 'Resting heart rate',
    value: '51',
    unit: 'bpm',
    status: 'available',
    isDemo: true,
  },
  {
    label: 'HRV trend',
    value: 'Lower than baseline',
    status: 'needs_attention',
    isDemo: true,
  },
  {
    label: 'Sleep duration',
    value: '6h 42m',
    status: 'needs_attention',
    isDemo: true,
  },
];

export const bloodMarkers: BloodMarker[] = [
  {
    label: 'ApoB',
    value: '78',
    unit: 'mg/dL',
    status: 'needs_attention',
    dateLabel: 'Apr 2025 panel',
    isDemo: true,
  },
  {
    label: 'hsCRP',
    value: '1.2',
    unit: 'mg/L',
    status: 'available',
    dateLabel: 'Apr 2025 panel',
    isDemo: true,
  },
  {
    label: 'Vitamin D',
    value: '36',
    unit: 'ng/mL',
    status: 'needs_attention',
    dateLabel: 'Apr 2025 panel',
    isDemo: true,
  },
];

export const coachingSteps: CoachingStep[] = [
  {
    title: 'Keep the next session controlled',
    body: 'Recovery signals look softer than recent training demand. Use this as training context, not medical guidance.',
    priority: 'primary',
    isDemo: true,
  },
  {
    title: 'Check data freshness before decisions',
    body: 'Wearable and biomarker context should stay labelled by source and freshness before it influences planning.',
    priority: 'supporting',
    isDemo: true,
  },
  {
    title: 'Capture notes without scoring them',
    body: 'Use notes for observations and questions only. Free text should not silently affect readiness.',
    priority: 'context',
    isDemo: true,
  },
];
