// All values are demo data. isDemo: true = not real user data.

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
  panelNote?: string;
  isDemo: boolean;
};

export type BloodPanel = {
  id: string;
  label: string;
  dateLabel: string;
  markerCount: number;
  isDemo: boolean;
};

export type ReadinessSegment = {
  label: string;
  value: number; // 0-100
};

export type CoachingStep = {
  title: string;
  body: string;
  priority: 'primary' | 'supporting' | 'context';
};

export type ConnectedSource = {
  id: string;
  label: string;
  status: 'connected' | 'not_connected' | 'prototype_only';
  statusLabel: string;
  actionLabel: string;
  note?: string;
};

export type ProfileField = {
  key: string;
  label: string;
  value: string;
  source: 'manual' | 'connected' | 'derived' | 'planned';
  editable: boolean;
};

// --- Training signals ---------------------------------------------------
export const trainingSignals: TrainingSignal[] = [
  { label: 'Resting heart rate', value: '51', unit: 'bpm', status: 'available', isDemo: true },
  { label: 'HRV trend', value: 'Lower than baseline', status: 'needs_attention', isDemo: true },
  { label: 'Sleep duration', value: '6h 42m', status: 'needs_attention', isDemo: true },
];

// --- Readiness segments (3 only, no Mental load) ------------------------
export const readinessSegments: ReadinessSegment[] = [
  { label: 'Recovery', value: 68 },
  { label: 'Training load', value: 74 },
  { label: 'Biomarkers', value: 61 },
];

export const dataCoveragePercent = 72;

// --- Blood panels -------------------------------------------------------
export const bloodPanels: BloodPanel[] = [
  { id: 'panel_2023', label: 'Blood panel 2023', dateLabel: 'Nov 2023', markerCount: 14, isDemo: true },
  { id: 'panel_2025', label: 'Blood panel 2025', dateLabel: 'Apr 2025', markerCount: 18, isDemo: true },
];

export const bloodPanelCount = bloodPanels.length;

// Legacy — kept for potential detail view use, not shown on home
export const bloodMarkers: BloodMarker[] = [
  { label: 'ApoB',      value: '78',  unit: 'mg/dL', status: 'needs_attention', dateLabel: 'Apr 2025', panelNote: 'Only 2025 data available', isDemo: true },
  { label: 'hsCRP',     value: '1.2', unit: 'mg/L',  status: 'available',       dateLabel: 'Apr 2025', panelNote: 'Only 2025 data available', isDemo: true },
  { label: 'Vitamin D', value: '36',  unit: 'ng/mL', status: 'needs_attention', dateLabel: 'Apr 2025', panelNote: 'Only 2025 data available', isDemo: true },
];

// --- Coaching -----------------------------------------------------------
export const coachingSteps: CoachingStep[] = [
  {
    title: 'Keep the next session controlled',
    body: 'Recovery signals look softer than recent training demand. Use this as training context, not medical guidance.',
    priority: 'primary',
  },
  {
    title: 'Check data freshness before decisions',
    body: 'Wearable and biomarker context should stay labelled by source and freshness before it influences planning.',
    priority: 'supporting',
  },
  {
    title: 'Capture notes without scoring them',
    body: 'Use notes for observations and questions only. Free text should not silently affect readiness.',
    priority: 'context',
  },
];

// --- Connected sources --------------------------------------------------
export const connectedSources: ConnectedSource[] = [
  {
    id: 'garmin',
    label: 'Garmin',
    status: 'not_connected',
    statusLabel: 'Not connected',
    actionLabel: 'Connect',
    note: 'Live sync not available in prototype',
  },
  {
    id: 'health_connect',
    label: 'Health Connect',
    status: 'not_connected',
    statusLabel: 'Not connected',
    actionLabel: 'Open setup',
    note: 'Live sync not available in prototype',
  },
  {
    id: 'blood_panels',
    label: 'Blood Panels',
    status: 'prototype_only',
    statusLabel: '2 panels on file',
    actionLabel: 'Upload',
    note: 'Manual import only in prototype',
  },
];

// --- Profile fields -----------------------------------------------------
export const profileFields: ProfileField[] = [
  { key: 'name',       label: 'Name',           value: 'Markus Sommer',      source: 'manual', editable: true },
  { key: 'age',        label: 'Age',            value: '34',                 source: 'manual', editable: true },
  { key: 'gender',     label: 'Gender',         value: 'Male',               source: 'manual', editable: true },
  { key: 'height',     label: 'Height',         value: '182 cm',             source: 'manual', editable: true },
  { key: 'weight',     label: 'Weight',         value: '78 kg',              source: 'manual', editable: true },
  { key: 'goal_race',  label: 'Goal race',      value: 'Brisbane Marathon',  source: 'manual', editable: true },
  { key: 'race_date',  label: 'Race date',      value: 'Jun 07, 2026',       source: 'manual', editable: true },
  { key: 'level',      label: 'Experience',     value: 'Intermediate',       source: 'manual', editable: true },
  { key: 'volume',     label: 'Weekly volume',  value: '55 km / week',       source: 'manual', editable: true },
  { key: 'long_run',   label: 'Long run range', value: 'Up to 32 km',        source: 'manual', editable: true },
  { key: 'train_days', label: 'Training days',  value: 'Mon / Wed / Thu / Sat', source: 'manual', editable: true },
  { key: 'units',      label: 'Units',          value: 'Metric',             source: 'manual', editable: true },
  { key: 'pace_fmt',   label: 'Pace format',    value: 'min/km',             source: 'manual', editable: true },
];
