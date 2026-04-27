// All values are demo data. isDemo: true = not real user data.
//
// Daily-update status:
//   This module is static. There is no daily refresh, no Health Connect read,
//   no recommendation regeneration. Score, trend, deltas, todaySignals,
//   readinessSegments, nextActions are constants. Restarting the app shows
//   the same values. Notes and Blood Panels persist via AsyncStorage in
//   their own modules — they are independent of this file.
//
//   When wearable ingestion is wired, the wearable-derived display values
//   (recovery / training load / today's signals) may be replaced by computed
//   values; blood markers must remain in bloodStorage.ts and never be
//   overwritten from Health Connect.
//
//   TODO(v1-engine): deriveRecommendationsFromSignals() — planned, not active.

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

export type NextAction = {
  id: string;
  iconKey: 'moon' | 'speedometer' | 'sync' | 'flask';
  title: string;        // direct recommendation
  sourceChip: string;   // evidence source
  reason: string;       // evidence summary (one sentence)
  action: string;       // bounded next step
  scope: string;        // explicit scope — e.g. "Weekly planning context"
  impact: string;       // chip label (Recovery / Training load / Biomarkers)
  impactKey: 'recovery' | 'training' | 'data';
};

export type ActivityDay = {
  day: string;
  value: number;
};

/** One day of score trend — three parallel lines */
export type ScoreTrendDay = {
  label: string;
  score: number;
  recovery: number;
  trainingLoad: number;
};

/**
 * Period delta — point change vs previous comparable period.
 * null = no comparable data available for that metric in this period.
 * Biomarkers delta is only non-null when panel comparison is available.
 */
export type PeriodDelta = {
  score: number | null;
  recovery: number | null;
  trainingLoad: number | null;
  biomarkers: number | null;
  dataCoverage: number | null;
};

export type Period = '7D' | '30D' | '90D' | 'Max';

/**
 * Demo deltas — illustrative only.
 * Values are point differences (not percentages).
 * Positive = higher than previous comparable period.
 * Biomarkers null for Max (no prior panel context beyond available demo data).
 */
export const scoreDeltas: Record<Period, PeriodDelta> = {
  '7D': {
    score:        +3,
    recovery:     +2,
    trainingLoad: -1,
    biomarkers:    0,
    dataCoverage: +1,
  },
  '30D': {
    score:        -2,
    recovery:     -3,
    trainingLoad: +4,
    biomarkers:   null, // only one panel in this window
    dataCoverage: +5,
  },
  '90D': {
    score:        +5,
    recovery:     +6,
    trainingLoad: -2,
    biomarkers:   +3, // 2023 vs 2025 comparison available
    dataCoverage: +8,
  },
  'Max': {
    score:        +8,
    recovery:     +7,
    trainingLoad: +3,
    biomarkers:   null, // no prior baseline beyond demo
    dataCoverage: null,
  },
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

// --- Today's signals (compact chips on Home) ----------------------------
export type TodaySignal = {
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'muted';
};

export const todaySignals: TodaySignal[] = [
  { label: 'Recovery',      value: '68%', status: 'warn'  },
  { label: 'Training Load', value: '74%', status: 'ok'    },
  { label: 'Biomarkers',    value: '61%', status: 'warn'  },
  { label: 'Data coverage', value: '72%', status: 'muted' },
];

// --- Readiness segments (3 only) ----------------------------------------
export const readinessSegments: ReadinessSegment[] = [
  { label: 'Recovery',      value: 68 },
  { label: 'Training load', value: 74 },
  { label: 'Biomarkers',    value: 61 },
];

export const dataCoveragePercent = 72;

// --- Recommendations ----------------------------------------------------
// Each card maps to the V1 Recommendation Contract:
//   title  → direct recommendation
//   source → evidence source
//   reason → evidence summary (one sentence, no diagnosis)
//   action → bounded next step (no medical claim, no must)
//   scope  → explicit scope statement
export const nextActions: NextAction[] = [
  {
    id: 'recovery',
    iconKey: 'moon',
    title: 'Prioritize recovery tonight',
    sourceChip: 'Garmin · HRV · demo',
    reason: 'HRV is below baseline.',
    action: 'Earlier sleep window or lower-intensity session.',
    scope: 'Weekly planning context',
    impact: 'Recovery',
    impactKey: 'recovery',
  },
  {
    id: 'training',
    iconKey: 'speedometer',
    title: 'Keep today controlled',
    sourceChip: 'Garmin · Training · demo',
    reason: 'Load is ahead of recovery context.',
    action: 'Choose easy Zone 2 or mobility instead of intensity.',
    scope: 'Training adjustment context',
    impact: 'Training load',
    impactKey: 'training',
  },
  {
    id: 'data',
    iconKey: 'flask',
    title: 'Review blood context',
    sourceChip: 'Blood Panels',
    reason: '2023 and 2025 panels are available.',
    action: 'Use Full View to compare markers and follow-up questions.',
    scope: 'Clinician discussion support',
    impact: 'Biomarkers',
    impactKey: 'data',
  },
];

// --- Score trend demo data ----------------------------------------------
export const scoreTrend7D: ScoreTrendDay[] = [
  { label: 'Mon', score: 70, recovery: 72, trainingLoad: 68 },
  { label: 'Tue', score: 66, recovery: 64, trainingLoad: 76 },
  { label: 'Wed', score: 62, recovery: 60, trainingLoad: 80 },
  { label: 'Thu', score: 68, recovery: 68, trainingLoad: 74 },
  { label: 'Fri', score: 65, recovery: 63, trainingLoad: 77 },
  { label: 'Sat', score: 72, recovery: 74, trainingLoad: 70 },
  { label: 'Sun', score: 68, recovery: 68, trainingLoad: 74 },
];

export const scoreTrend30D: ScoreTrendDay[] = [
  { label: 'W1', score: 74, recovery: 76, trainingLoad: 68 },
  { label: 'W2', score: 69, recovery: 67, trainingLoad: 74 },
  { label: 'W3', score: 63, recovery: 61, trainingLoad: 79 },
  { label: 'W4', score: 68, recovery: 68, trainingLoad: 74 },
];

export const scoreTrend90D: ScoreTrendDay[] = [
  { label: 'Feb', score: 72, recovery: 74, trainingLoad: 66 },
  { label: 'Mar', score: 67, recovery: 65, trainingLoad: 75 },
  { label: 'Apr', score: 68, recovery: 68, trainingLoad: 74 },
];

export const scoreTrendMax: ScoreTrendDay[] = [
  { label: 'Nov', score: 65, recovery: 66, trainingLoad: 62 },
  { label: 'Dec', score: 60, recovery: 58, trainingLoad: 68 },
  { label: 'Jan', score: 70, recovery: 72, trainingLoad: 64 },
  { label: 'Feb', score: 72, recovery: 74, trainingLoad: 66 },
  { label: 'Mar', score: 67, recovery: 65, trainingLoad: 75 },
  { label: 'Apr', score: 68, recovery: 68, trainingLoad: 74 },
];

// --- Activity trend (kept for reference, replaced on home) --------------
export const activityTrend: ActivityDay[] = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 45 },
  { day: 'Thu', value: 88 },
  { day: 'Fri', value: 55 },
  { day: 'Sat', value: 91 },
  { day: 'Sun', value: 38 },
];

// --- Blood panels -------------------------------------------------------
export const bloodPanels: BloodPanel[] = [
  { id: 'panel_2023', label: 'Blood panel 2023', dateLabel: '2023', markerCount: 14, isDemo: true },
  { id: 'panel_2025', label: 'Blood panel 2025', dateLabel: '2025', markerCount: 18, isDemo: true },
];

export const bloodPanelCount = bloodPanels.length;

export const bloodMarkers: BloodMarker[] = [
  { label: 'ApoB',      value: '78',  unit: 'mg/dL', status: 'needs_attention', dateLabel: '2025', panelNote: 'Only 2025 data available', isDemo: true },
  { label: 'hsCRP',     value: '1.2', unit: 'mg/L',  status: 'available',       dateLabel: '2025', panelNote: 'Only 2025 data available', isDemo: true },
  { label: 'Vitamin D', value: '36',  unit: 'ng/mL', status: 'needs_attention', dateLabel: '2025', panelNote: 'Only 2025 data available', isDemo: true },
];

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

export const connectedSources: ConnectedSource[] = [
  {
    id: 'health_connect',
    label: 'Health Connect',
    status: 'not_connected',
    statusLabel: 'Not connected',
    actionLabel: 'Connect',
    note: 'Android-only. Sleep, HR, HRV, steps, workouts.',
  },
  {
    id: 'garmin',
    label: 'Garmin',
    status: 'not_connected',
    statusLabel: 'Via Health Connect',
    actionLabel: 'Open Garmin',
    note: 'No direct API. Connect through Health Connect if your Garmin app shares data there.',
  },
  {
    id: 'strava',
    label: 'Strava',
    status: 'not_connected',
    statusLabel: 'Planned',
    actionLabel: 'Planned',
    note: 'Direct Strava integration is not in V1.',
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

export const profileFields: ProfileField[] = [
  { key: 'name',       label: 'Name',           value: 'Markus Sommer',         source: 'manual', editable: true },
  { key: 'age',        label: 'Age',            value: '34',                    source: 'manual', editable: true },
  { key: 'gender',     label: 'Gender',         value: 'Male',                  source: 'manual', editable: true },
  { key: 'height',     label: 'Height',         value: '182 cm',                source: 'manual', editable: true },
  { key: 'weight',     label: 'Weight',         value: '78 kg',                 source: 'manual', editable: true },
  { key: 'goal_race',  label: 'Goal race',      value: 'Brisbane Marathon',     source: 'manual', editable: true },
  { key: 'race_date',  label: 'Race date',      value: 'Jun 07, 2026',          source: 'manual', editable: true },
  { key: 'level',      label: 'Experience',     value: 'Intermediate',          source: 'manual', editable: true },
  { key: 'volume',     label: 'Weekly volume',  value: '55 km / week',          source: 'manual', editable: true },
  { key: 'long_run',   label: 'Long run range', value: 'Up to 32 km',           source: 'manual', editable: true },
  { key: 'train_days', label: 'Training days',  value: 'Mon / Wed / Thu / Sat', source: 'manual', editable: true },
  { key: 'units',      label: 'Units',          value: 'Metric',                source: 'manual', editable: true },
  { key: 'pace_fmt',   label: 'Pace format',    value: 'min/km',                source: 'manual', editable: true },
];
