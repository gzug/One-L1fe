import type { DotStatus } from './dots.ts';

export type OrbitDotKey = 'health' | 'nutrition' | 'mind_sleep' | 'activity';

export type AppScreenKey =
  | 'one_l1fe'
  | OrbitDotKey
  | 'doctor_prep'
  | 'menu'
  | 'profile'
  | 'how_score_works';

export type DotVisibilityStatus = DotStatus;

export type OrbitDisplayState =
  | 'score_available'
  | 'no_score_available'
  | 'coming_soon'
  | 'excluded';

export interface SubDotDefinition {
  key: string;
  title: string;
  description: string;
  status: DotVisibilityStatus;
  affectsScore: boolean;
  kind: 'active' | 'planned' | 'needs_data' | 'coming_soon' | 'context';
}

export interface OrbitDotDefinition {
  key: OrbitDotKey;
  title: string;
  description: string;
  status: DotVisibilityStatus;
  displayState: OrbitDisplayState;
  score: number | null;
  subDots: readonly SubDotDefinition[];
}

export interface MenuEntryDefinition {
  key: AppScreenKey;
  title: string;
  group: 'primary' | 'account' | 'education';
}

export const ORBIT_DOTS: readonly OrbitDotDefinition[] = [
  {
    key: 'health',
    title: 'Health',
    description: 'Biomarkers, documents, measurements, and medical context.',
    status: 'missing',
    displayState: 'no_score_available',
    score: null,
    subDots: [
      {
        key: 'blood_biomarkers',
        title: 'Blood / Biomarkers',
        description: 'Core lab and biomarker panel.',
        status: 'ready',
        affectsScore: true,
        kind: 'active',
      },
      {
        key: 'body_measurements',
        title: 'Body Measurements',
        description: 'Weight, height, waist, and other body metrics.',
        status: 'needs_update',
        affectsScore: true,
        kind: 'needs_data',
      },
      {
        key: 'medical_documents',
        title: 'Medical Documents',
        description: 'Uploads and sourced medical files.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'dna',
        title: 'DNA',
        description: 'Genetic context for later use.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'urine',
        title: 'Urine',
        description: 'Future urinary markers and summaries.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'stool_microbiome',
        title: 'Stool / Microbiome',
        description: 'Microbiome and stool-based signals.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'medication',
        title: 'Medication',
        description: 'Medication context and history.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'supplements',
        title: 'Supplements',
        description: 'Supplement tracking and context.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
    ],
  },
  {
    key: 'nutrition',
    title: 'Nutrition',
    description: 'Meal photo and text-based nutrition estimate prototype.',
    status: 'planned_locked',
    displayState: 'coming_soon',
    score: null,
    subDots: [
      {
        key: 'photo_to_nutrition',
        title: 'Photo to Nutrition',
        description: 'Upload or select a meal image for an approximate future estimate.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
      {
        key: 'nutrition_calculator',
        title: 'Nutrition Calculator',
        description: 'Describe a meal and see an approximate lifestyle estimate.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
      },
    ],
  },
  {
    key: 'mind_sleep',
    title: 'Mind & Sleep',
    description: 'Sleep, stress, energy, and habit context.',
    status: 'missing',
    displayState: 'no_score_available',
    score: null,
    subDots: [
      {
        key: 'check_in',
        title: 'Check-in',
        description: 'Current subjective check-in for energy, stress, and sleep context.',
        status: 'needs_update',
        affectsScore: true,
        kind: 'active',
      },
      {
        key: 'sleep',
        title: 'Sleep',
        description: 'Sleep duration, quality, and recovery context.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
      },
      {
        key: 'stress_energy',
        title: 'Stress & Energy',
        description: 'Mental load, stress, mood, and energy signals.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
      },
      {
        key: 'habits_context',
        title: 'Habits & Context',
        description: 'Habits may explain changes in your data, but do not directly affect your score.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
      },
      {
        key: 'caffeine',
        title: 'Caffeine',
        description: 'Caffeine timing and intake context.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
      },
      {
        key: 'alcohol',
        title: 'Alcohol',
        description: 'Alcohol context and moderation tracking.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
      },
      {
        key: 'recovery_illness',
        title: 'Recovery / Illness',
        description: 'Recovery or illness context and interruption tracking.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
      },
    ],
  },
  {
    key: 'activity',
    title: 'Activity',
    description: 'Movement, wearable sync, and recovery signals.',
    status: 'missing',
    displayState: 'no_score_available',
    score: null,
    subDots: [
      { key: 'steps', title: 'Steps', description: 'Daily step volume and trend.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'workouts', title: 'Workouts', description: 'Structured exercise sessions.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'active_minutes', title: 'Active Minutes', description: 'Movement intensity across the day.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'resting_heart_rate', title: 'Resting Heart Rate', description: 'Resting recovery and strain signal.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'hrv', title: 'HRV', description: 'Autonomic recovery signal.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'distance', title: 'Distance', description: 'Distance and movement volume.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'calories', title: 'Calories', description: 'Energy expenditure estimate.', status: 'missing', affectsScore: true, kind: 'needs_data' },
      { key: 'wearable_sync', title: 'Wearable Sync', description: 'Android-first Health Connect / Garmin sync path.', status: 'ready', affectsScore: false, kind: 'active' },
    ],
  },
] as const;

export const MENU_ENTRIES: readonly MenuEntryDefinition[] = [
  { key: 'one_l1fe', title: 'One L1fe', group: 'primary' },
  { key: 'health', title: 'Health', group: 'primary' },
  { key: 'nutrition', title: 'Nutrition', group: 'primary' },
  { key: 'mind_sleep', title: 'Mind & Sleep', group: 'primary' },
  { key: 'activity', title: 'Activity', group: 'primary' },
  { key: 'doctor_prep', title: 'Doctor Prep', group: 'primary' },
  { key: 'profile', title: 'Profile', group: 'account' },
  { key: 'how_score_works', title: 'How the One L1fe Score Works', group: 'education' },
] as const;

export function getOrbitDot(key: OrbitDotKey): OrbitDotDefinition {
  const dot = ORBIT_DOTS.find((candidate) => candidate.key === key);
  if (!dot) {
    throw new Error(`Unknown orbit dot: ${key}`);
  }
  return dot;
}

export function getSubDotsForOrbitDot(key: OrbitDotKey): readonly SubDotDefinition[] {
  return getOrbitDot(key).subDots;
}

export function getOrbitDotDisplayLabel(dot: OrbitDotDefinition): string {
  if (dot.displayState === 'score_available' && dot.score !== null) {
    return `Score ${Math.round(dot.score)}`;
  }

  if (dot.displayState === 'coming_soon') return 'Coming Soon';
  if (dot.displayState === 'excluded') return 'Excluded';
  return 'No Score available';
}

export function affectsScoreForStatus(status: DotVisibilityStatus): boolean {
  return status !== 'planned_locked' && status !== 'excluded';
}
