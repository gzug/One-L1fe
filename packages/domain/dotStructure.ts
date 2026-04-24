// UI view model for the One L1fe Home surface.
//
// This file describes the *visible* Orbit/Sub-Dot hierarchy shown to the user.
// It is intentionally separate from the domain/score catalog in `dots.ts`:
//
// - `dots.ts` is the canonical Domain/Score catalog. It defines DotKeys, base
//   weights, score contribution, and parent hierarchy used by the score
//   aggregation pipeline.
// - `dotStructure.ts` is a UI view model. It may group or split domain Dots
//   differently (e.g. collapsing `sleep_duration` + `sleep_quality` into a
//   single "Sleep" sub-dot, or presenting "Check-in" as a mixed entry point).
//
// Drift protection: every sub-dot that claims a domain binding via
// `domainDotKeys` must reference a real DotKey in `dots.ts`. The assertion
// suite (`dotStructure.assertions.ts`) enforces this.
//
// DECISION: the Orbit only shows score-capable domains
// (Health, Nutrition, Mind & Sleep, Activity). Doctor Prep, Menu, Profile and
// score education are Home actions, not Orbit dots. See MEMORY.md.

import type { DotKey, DotScore, DotStatus } from './dots.ts';
import { getDotDefinition } from './dots.ts';

export type OrbitDotKey = 'health' | 'nutrition' | 'mind_and_sleep' | 'activity';

export type AppScreenKey =
  | 'one_l1fe'
  | 'ask_one_l1fe'
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
  kind: 'active' | 'needs_data' | 'coming_soon' | 'context';
  /**
   * Domain Dot(s) this UI sub-dot represents. Used to bind the UI view model
   * to the score catalog in `dots.ts`. Omit for pure UI entry points that
   * do not correspond to a scoreable domain dot (e.g. wearable connection
   * gateways, composite check-in surfaces with no 1:1 domain mapping).
   */
  domainDotKeys?: readonly DotKey[];
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

/**
 * Runtime display snapshot for a single Orbit dot. Produced by
 * `deriveOrbitDisplayState` from user Dot scores; consumed by the Home
 * surface to avoid rendering the structural `ORBIT_DOTS` catalog directly.
 */
export interface OrbitDotDisplay {
  key: OrbitDotKey;
  title: string;
  description: string;
  status: DotVisibilityStatus;
  displayState: OrbitDisplayState;
  score: number | null;
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
        domainDotKeys: ['blood_biomarkers'],
      },
      {
        key: 'body_measurements',
        title: 'Body Measurements',
        description: 'Weight, height, waist, and other body metrics.',
        status: 'needs_update',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['body_measurements'],
      },
      {
        key: 'medical_documents',
        title: 'Medical Documents',
        description: 'Uploads and sourced medical files.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['medical_documents'],
      },
      {
        key: 'dna',
        title: 'DNA',
        description: 'Genetic context for later use.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['dna'],
      },
      {
        key: 'urine',
        title: 'Urine',
        description: 'Future urinary markers and summaries.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['urine'],
      },
      {
        key: 'stool_microbiome',
        title: 'Stool / Microbiome',
        description: 'Microbiome and stool-based signals.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['microbiome'],
      },
      {
        key: 'medication',
        title: 'Medication',
        description: 'Medication context and history.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['medication'],
      },
      {
        key: 'supplements',
        title: 'Supplements',
        description: 'Supplement tracking and context.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['supplements'],
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
        domainDotKeys: ['nutrition'],
      },
      {
        key: 'nutrition_calculator',
        title: 'Nutrition Calculator',
        description: 'Describe a meal and see an approximate lifestyle estimate.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'coming_soon',
        domainDotKeys: ['nutrition'],
      },
    ],
  },
  {
    key: 'mind_and_sleep',
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
        domainDotKeys: ['energy', 'stress', 'sleep_quality'],
      },
      {
        key: 'sleep',
        title: 'Sleep',
        description: 'Sleep duration, quality, and recovery context.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['sleep_duration', 'sleep_quality'],
      },
      {
        key: 'stress_energy',
        title: 'Stress & Energy',
        description: 'Mental load, stress, mood, and energy signals.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['stress', 'energy', 'mood', 'mental_load'],
      },
      {
        key: 'habits_context',
        title: 'Habits & Context',
        description: 'Habits may explain outliers, positive trends, or negative trends across sleep, activity, recovery, and energy. They do not directly affect your score.',
        status: 'ready',
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
        domainDotKeys: ['caffeine'],
      },
      {
        key: 'alcohol',
        title: 'Alcohol',
        description: 'Alcohol context and moderation tracking.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
        domainDotKeys: ['alcohol'],
      },
      {
        key: 'recovery_illness',
        title: 'Recovery / Illness',
        description: 'Recovery or illness context and interruption tracking.',
        status: 'planned_locked',
        affectsScore: false,
        kind: 'context',
        domainDotKeys: ['recovery'],
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
      {
        key: 'steps',
        title: 'Steps',
        description: 'Daily step volume and trend.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['steps'],
      },
      {
        key: 'workouts',
        title: 'Workouts',
        description: 'Structured exercise sessions.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['workouts'],
      },
      {
        key: 'active_minutes',
        title: 'Active Minutes',
        description: 'Movement intensity across the day.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['active_minutes'],
      },
      {
        key: 'resting_heart_rate',
        title: 'Resting Heart Rate',
        description: 'Resting recovery and strain signal.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['resting_heart_rate'],
      },
      {
        key: 'hrv',
        title: 'HRV',
        description: 'Autonomic recovery signal.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['hrv'],
      },
      {
        key: 'distance',
        title: 'Distance',
        description: 'Distance and movement volume.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['distance'],
      },
      {
        key: 'calories',
        title: 'Calories',
        description: 'Energy expenditure estimate.',
        status: 'missing',
        affectsScore: true,
        kind: 'needs_data',
        domainDotKeys: ['calories'],
      },
      {
        key: 'wearable_sync',
        title: 'Wearable Sync',
        description: 'Android-first Health Connect / Garmin sync path.',
        status: 'ready',
        affectsScore: false,
        kind: 'active',
      },
    ],
  },
] as const;

export const MENU_ENTRIES: readonly MenuEntryDefinition[] = [
  { key: 'one_l1fe', title: 'One L1fe', group: 'primary' },
  { key: 'health', title: 'Health', group: 'primary' },
  { key: 'nutrition', title: 'Nutrition', group: 'primary' },
  { key: 'mind_and_sleep', title: 'Mind & Sleep', group: 'primary' },
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

export function getOrbitDotDisplayLabel(
  dot: { displayState: OrbitDisplayState; score: number | null },
): string {
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

/**
 * Resolve the domain Dot definitions referenced by a UI sub-dot. Throws if
 * any referenced DotKey is not in the `dots.ts` catalog — protects against
 * silent drift between the UI view model and the domain catalog.
 */
export function resolveDomainDotsForSubDot(subDot: SubDotDefinition) {
  if (!subDot.domainDotKeys) return [];
  return subDot.domainDotKeys.map((key) => getDotDefinition(key));
}

/**
 * Runtime mapper from user Dot scores to the Orbit display snapshot.
 *
 * V1 fallback: the score pipeline is not wired yet, so this currently
 * returns a static "no data" snapshot (Nutrition stays Coming Soon).
 * The API is in place so callers can switch to real aggregation without
 * touching the UI layer.
 *
 * Future: aggregate `userDotScores` along each orbit's sub-dot
 * `domainDotKeys`, produce a weighted per-orbit score, and flip
 * `displayState` to `score_available` once confidence/coverage are met.
 */
export function deriveOrbitDisplayState(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userDotScores: Partial<Record<DotKey, DotScore>>,
): readonly OrbitDotDisplay[] {
  return ORBIT_DOTS.map((dot) => {
    if (dot.key === 'nutrition') {
      return {
        key: dot.key,
        title: dot.title,
        description: dot.description,
        status: dot.status,
        displayState: 'coming_soon',
        score: null,
      };
    }

    return {
      key: dot.key,
      title: dot.title,
      description: dot.description,
      status: dot.status,
      displayState: 'no_score_available',
      score: null,
    };
  });
}
