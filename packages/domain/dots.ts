// Dot/Score architecture — static catalog and types.
//
// The Dot catalog is the source of truth for navigation, aggregation, and
// locked-UI rendering. Runtime DotScore values are computed elsewhere and
// combined with DotDefinition at render / aggregation time.
//
// DECISION: catalog is a static TS array (not a Supabase table) — keeps V1
// sideload-simple and versioned with code; DB-backed catalog deferred to V1.5.
// DECISION: Mind & Sleep is modeled as an intermediate group under Lifestyle
// (tabKey = 'lifestyle') — 5-tab navigation is a hard product constraint;
// Mind & Sleep surfaces as its own prominent section inside the Lifestyle tab.
// DECISION: Doctor Prep leaves carry scoreContribution: 'output' — they
// aggregate from other dots and must never enter the One L1fe score formula.

export type DotStatus =
  | 'ready'
  | 'needs_update'
  | 'missing'
  | 'excluded'
  | 'planned_locked';

export type DotConfidence = 'low' | 'medium' | 'high';

export type DotScoreContribution = 'input' | 'output';

export type TabKey =
  | 'one_l1fe'
  | 'doctor_prep'
  | 'health_data'
  | 'lifestyle'
  | 'activity';

export type DotKey =
  // Root
  | 'one_l1fe'
  // Doctor Prep
  | 'doctor_prep'
  | 'doctor_summary'
  | 'doctor_questions'
  | 'doctor_tests'
  | 'doctor_sources'
  | 'doctor_export'
  // Health Data
  | 'health_data'
  | 'blood_biomarkers'
  | 'body_measurements'
  | 'medical_documents'
  | 'dna'
  | 'urine'
  | 'microbiome'
  | 'medication'
  | 'supplements'
  // Lifestyle (with Mind & Sleep folded as sub-group)
  | 'lifestyle'
  | 'nutrition'
  | 'hydration'
  | 'caffeine'
  | 'alcohol'
  | 'recovery'
  | 'mind_and_sleep'
  | 'sleep_duration'
  | 'sleep_quality'
  | 'energy'
  | 'stress'
  | 'mood'
  | 'mental_load'
  | 'symptoms'
  // Activity
  | 'activity'
  | 'steps'
  | 'workouts'
  | 'active_minutes'
  | 'resting_heart_rate'
  | 'hrv'
  | 'distance'
  | 'calories'
  | 'vo2_max';

/**
 * Runtime score for a single Dot. Computed per session by adapter logic,
 * then passed into aggregation. `score` is null when the dot has no usable
 * data — display layer must never render raw 0 for missing data.
 */
export interface DotScore {
  /** Normalized 0–100. null = not enough data. */
  score: number | null;
  /** 0.0–1.0. Fraction of this dot's required inputs that are present. */
  coverage: number;
  /** 0.0–1.0. Derived from freshness-policy on underlying field timestamps. */
  freshness: number;
  confidence: DotConfidence;
  status: DotStatus;
}

export interface DotDefinition {
  key: DotKey;
  /** null for the root one_l1fe node, otherwise the immediate group parent. */
  parentKey: DotKey | null;
  title: string;
  description?: string;
  /** Leaves are the only nodes that enter score aggregation. Groups are display rollups. */
  isLeaf: boolean;
  /** Base weight used in score aggregation. Groups and output dots effectively unused → 0. */
  baseWeight: number;
  /** Initial catalog-level status. Runtime DotScore.status overrides this. */
  defaultStatus: DotStatus;
  /** 'input' counts toward One L1fe score. 'output' is display-only (e.g. Doctor Prep). */
  scoreContribution: DotScoreContribution;
  /** Which of the 5 tabs this dot lives in. */
  tabKey: TabKey;
}

// DECISION: baseWeight values are first-pass calibration — tune after first
// real-user run. Tuning is a single-file edit here; no migration required.
// Rationale per leaf is in inline comments.

const CATALOG: DotDefinition[] = [
  {
    key: 'one_l1fe',
    parentKey: null,
    title: 'One L1fe',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'one_l1fe',
  },

  // ---------------------------------------------------------------------
  // Doctor Prep — output-only. Leaves aggregate from other dots.
  // ---------------------------------------------------------------------
  {
    key: 'doctor_prep',
    parentKey: 'one_l1fe',
    title: 'Doctor Prep',
    description: 'Rollup of your current data prepared for a clinical visit.',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },
  {
    key: 'doctor_summary',
    parentKey: 'doctor_prep',
    title: 'Doctor Summary',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },
  {
    key: 'doctor_questions',
    parentKey: 'doctor_prep',
    title: 'Questions to Ask',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },
  {
    key: 'doctor_tests',
    parentKey: 'doctor_prep',
    title: 'Tests to Discuss',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },
  {
    key: 'doctor_sources',
    parentKey: 'doctor_prep',
    title: 'Sources & Dates',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },
  {
    key: 'doctor_export',
    parentKey: 'doctor_prep',
    title: 'Export',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'output',
    tabKey: 'doctor_prep',
  },

  // ---------------------------------------------------------------------
  // Health Data
  // ---------------------------------------------------------------------
  {
    key: 'health_data',
    parentKey: 'one_l1fe',
    title: 'Health Data',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    // Highest leaf weight — core medical signal via existing biomarker engine.
    key: 'blood_biomarkers',
    parentKey: 'health_data',
    title: 'Blood / Biomarkers',
    isLeaf: true,
    baseWeight: 3.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'body_measurements',
    parentKey: 'health_data',
    title: 'Body Measurements',
    isLeaf: true,
    baseWeight: 0.5,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'medical_documents',
    parentKey: 'health_data',
    title: 'Medical Documents',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'dna',
    parentKey: 'health_data',
    title: 'DNA',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'urine',
    parentKey: 'health_data',
    title: 'Urine',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'microbiome',
    parentKey: 'health_data',
    title: 'Stool / Microbiome',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'medication',
    parentKey: 'health_data',
    title: 'Medication',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },
  {
    key: 'supplements',
    parentKey: 'health_data',
    title: 'Supplements',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'health_data',
  },

  // ---------------------------------------------------------------------
  // Lifestyle (incl. Mind & Sleep folded as sub-group)
  // ---------------------------------------------------------------------
  {
    key: 'lifestyle',
    parentKey: 'one_l1fe',
    title: 'Lifestyle',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'nutrition',
    parentKey: 'lifestyle',
    title: 'Nutrition',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'hydration',
    parentKey: 'lifestyle',
    title: 'Hydration',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'caffeine',
    parentKey: 'lifestyle',
    title: 'Caffeine',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'alcohol',
    parentKey: 'lifestyle',
    title: 'Alcohol',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'recovery',
    parentKey: 'lifestyle',
    title: 'Recovery',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },

  // Mind & Sleep sub-group (prominent section inside Lifestyle tab).
  {
    key: 'mind_and_sleep',
    parentKey: 'lifestyle',
    title: 'Mind & Sleep',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'sleep_duration',
    parentKey: 'mind_and_sleep',
    title: 'Sleep duration',
    isLeaf: true,
    baseWeight: 2.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'sleep_quality',
    parentKey: 'mind_and_sleep',
    title: 'Sleep quality',
    isLeaf: true,
    baseWeight: 1.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'energy',
    parentKey: 'mind_and_sleep',
    title: 'Energy',
    isLeaf: true,
    baseWeight: 1.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'stress',
    parentKey: 'mind_and_sleep',
    title: 'Stress',
    isLeaf: true,
    baseWeight: 1.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'mood',
    parentKey: 'mind_and_sleep',
    title: 'Mood',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    key: 'mental_load',
    parentKey: 'mind_and_sleep',
    title: 'Mental load',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'lifestyle',
  },
  {
    // Captured under Mind & Sleep but feeds Doctor Prep only — no score input.
    key: 'symptoms',
    parentKey: 'mind_and_sleep',
    title: 'Symptoms',
    description: 'Captured here, surfaced in Doctor Prep context only.',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'output',
    tabKey: 'lifestyle',
  },

  // ---------------------------------------------------------------------
  // Activity
  // ---------------------------------------------------------------------
  {
    key: 'activity',
    parentKey: 'one_l1fe',
    title: 'Activity',
    isLeaf: false,
    baseWeight: 0,
    defaultStatus: 'ready',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'steps',
    parentKey: 'activity',
    title: 'Steps',
    isLeaf: true,
    baseWeight: 1.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'workouts',
    parentKey: 'activity',
    title: 'Workouts',
    isLeaf: true,
    baseWeight: 1.5,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'active_minutes',
    parentKey: 'activity',
    title: 'Active minutes',
    isLeaf: true,
    baseWeight: 1.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'resting_heart_rate',
    parentKey: 'activity',
    title: 'Resting heart rate',
    isLeaf: true,
    baseWeight: 1.5,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'hrv',
    parentKey: 'activity',
    title: 'HRV',
    isLeaf: true,
    baseWeight: 2.0,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'distance',
    parentKey: 'activity',
    title: 'Distance',
    isLeaf: true,
    baseWeight: 0.5,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'calories',
    parentKey: 'activity',
    title: 'Calories',
    isLeaf: true,
    baseWeight: 0.5,
    defaultStatus: 'missing',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
  {
    key: 'vo2_max',
    parentKey: 'activity',
    title: 'VO2 max',
    isLeaf: true,
    baseWeight: 0,
    defaultStatus: 'planned_locked',
    scoreContribution: 'input',
    tabKey: 'activity',
  },
];

export const dotCatalog: readonly DotDefinition[] = Object.freeze(CATALOG);

const CATALOG_BY_KEY: Record<DotKey, DotDefinition> = CATALOG.reduce(
  (acc, dot) => {
    acc[dot.key] = dot;
    return acc;
  },
  {} as Record<DotKey, DotDefinition>,
);

export function getDotDefinition(key: DotKey): DotDefinition {
  const def = CATALOG_BY_KEY[key];
  if (!def) {
    throw new Error(`Unknown dot key: ${key}`);
  }
  return def;
}

export function getChildDots(parentKey: DotKey | null): DotDefinition[] {
  return CATALOG.filter((d) => d.parentKey === parentKey);
}

export function getDotsByTab(tabKey: TabKey): DotDefinition[] {
  return CATALOG.filter((d) => d.tabKey === tabKey);
}

export function getLeafDots(): DotDefinition[] {
  return CATALOG.filter((d) => d.isLeaf);
}

export function getScoreInputLeaves(): DotDefinition[] {
  return CATALOG.filter((d) => d.isLeaf && d.scoreContribution === 'input');
}

export const TAB_ORDER: ReadonlyArray<TabKey> = [
  'one_l1fe',
  'doctor_prep',
  'health_data',
  'lifestyle',
  'activity',
];
