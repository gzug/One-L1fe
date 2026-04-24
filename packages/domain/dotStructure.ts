import type { DotStatus, TabKey } from './dots.ts';

export type DotVisibilityStatus = DotStatus;

export interface SubDotDefinition {
  key: string;
  title: string;
  description: string;
  status: DotVisibilityStatus;
  affectsScore: boolean;
  tabKey: TabKey;
  kind: 'active' | 'planned' | 'needs_data' | 'coming_soon';
}

export interface MainDotDefinition {
  key: TabKey;
  title: string;
  description: string;
  status: DotVisibilityStatus;
  subDots: readonly SubDotDefinition[];
}

export const MAIN_DOT_STRUCTURE: readonly MainDotDefinition[] = [
  {
    key: 'one_l1fe',
    title: 'One L1fe',
    description: 'Your score, update, freshness, and AI entry point.',
    status: 'ready',
    subDots: [
      {
        key: 'one_l1fe_score',
        title: 'One L1fe Score',
        description: 'Read-only summary of the current prototype score output.',
        status: 'ready',
        affectsScore: true,
        tabKey: 'one_l1fe',
        kind: 'active',
      },
      {
        key: 'current_update',
        title: 'Current Update',
        description: 'A brief snapshot of what changed most recently.',
        status: 'needs_update',
        affectsScore: false,
        tabKey: 'one_l1fe',
        kind: 'needs_data',
      },
      {
        key: 'data_freshness',
        title: 'Data Freshness',
        description: 'Shows which areas are current, stale, or missing.',
        status: 'ready',
        affectsScore: true,
        tabKey: 'one_l1fe',
        kind: 'active',
      },
      {
        key: 'ask_one_l1fe',
        title: 'Ask One L1fe',
        description: 'Prototype prompt surface for later assistant workflows.',
        status: 'planned_locked',
        affectsScore: false,
        tabKey: 'one_l1fe',
        kind: 'coming_soon',
      },
      {
        key: 'dot_overview',
        title: 'Dot Overview',
        description: 'Navigate the complete structure from one place.',
        status: 'ready',
        affectsScore: false,
        tabKey: 'one_l1fe',
        kind: 'active',
      },
      {
        key: 'confidence_coverage',
        title: 'Confidence / Coverage',
        description: 'Explains how complete and reliable the current view is.',
        status: 'needs_update',
        affectsScore: true,
        tabKey: 'one_l1fe',
        kind: 'needs_data',
      },
    ],
  },
  {
    key: 'doctor_prep',
    title: 'Doctor Prep',
    description: 'Visit prep, questions, and export.',
    status: 'ready',
    subDots: [
      {
        key: 'doctor_summary',
        title: 'Doctor Summary',
        description: 'Short summary for a clinical visit.',
        status: 'ready',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'active',
      },
      {
        key: 'what_to_show_your_doctor',
        title: 'What to Show Your Doctor',
        description: 'Curated signals to bring to the visit.',
        status: 'planned_locked',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'coming_soon',
      },
      {
        key: 'questions_to_ask',
        title: 'Questions to Ask',
        description: 'Conversation prompts for the appointment.',
        status: 'ready',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'active',
      },
      {
        key: 'tests_to_discuss',
        title: 'Tests to Discuss',
        description: 'Potential follow-up labs or measurements.',
        status: 'planned_locked',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'coming_soon',
      },
      {
        key: 'sources_and_dates',
        title: 'Sources & Dates',
        description: 'Traceability for all visible information.',
        status: 'ready',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'active',
      },
      {
        key: 'export',
        title: 'Export',
        description: 'Generate a visit-ready summary export.',
        status: 'planned_locked',
        affectsScore: false,
        tabKey: 'doctor_prep',
        kind: 'coming_soon',
      },
    ],
  },
  {
    key: 'health_data',
    title: 'Health Data',
    description: 'Biomarkers, documents, body, and materials.',
    status: 'ready',
    subDots: [
      { key: 'blood_biomarkers', title: 'Blood / Biomarkers', description: 'Core lab and biomarker panel.', status: 'ready', affectsScore: true, tabKey: 'health_data', kind: 'active' },
      { key: 'medical_documents', title: 'Medical Documents', description: 'Uploads and sourced medical files.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'dna', title: 'DNA', description: 'Genetic context for later use.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'urine', title: 'Urine', description: 'Future urinary markers and summaries.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'stool_microbiome', title: 'Stool / Microbiome', description: 'Microbiome and stool-based signals.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'medication', title: 'Medication', description: 'Medication context and history.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'supplements', title: 'Supplements', description: 'Supplement tracking and context.', status: 'planned_locked', affectsScore: false, tabKey: 'health_data', kind: 'coming_soon' },
      { key: 'body_measurements', title: 'Body Measurements', description: 'Weight, size, and body metrics.', status: 'needs_update', affectsScore: true, tabKey: 'health_data', kind: 'needs_data' },
    ],
  },
  {
    key: 'lifestyle',
    title: 'Lifestyle',
    description: 'Habits, recovery, and nutrition.',
    status: 'ready',
    subDots: [
      { key: 'nutrition', title: 'Nutrition', description: 'Meal photo or description with approximate estimate.', status: 'ready', affectsScore: false, tabKey: 'lifestyle', kind: 'active' },
      { key: 'mind_and_sleep', title: 'Mind & Sleep', description: 'Mental load, sleep, energy, and stress context.', status: 'ready', affectsScore: true, tabKey: 'lifestyle', kind: 'active' },
      { key: 'recovery_illness', title: 'Recovery / Illness', description: 'Recovery or illness context and interruption tracking.', status: 'planned_locked', affectsScore: false, tabKey: 'lifestyle', kind: 'coming_soon' },
      { key: 'hydration', title: 'Hydration', description: 'Daily fluid context and notes.', status: 'planned_locked', affectsScore: false, tabKey: 'lifestyle', kind: 'coming_soon' },
      { key: 'caffeine', title: 'Caffeine', description: 'Caffeine timing and intake context.', status: 'planned_locked', affectsScore: false, tabKey: 'lifestyle', kind: 'coming_soon' },
      { key: 'alcohol', title: 'Alcohol', description: 'Alcohol context and moderation tracking.', status: 'planned_locked', affectsScore: false, tabKey: 'lifestyle', kind: 'coming_soon' },
      { key: 'habits', title: 'Habits', description: 'Habit-level behavior and consistency.', status: 'planned_locked', affectsScore: false, tabKey: 'lifestyle', kind: 'coming_soon' },
    ],
  },
  {
    key: 'activity',
    title: 'Activity',
    description: 'Movement, wearable sync, and recovery signals.',
    status: 'ready',
    subDots: [
      { key: 'steps', title: 'Steps', description: 'Daily step volume and trend.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'workouts', title: 'Workouts', description: 'Structured exercise sessions.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'active_minutes', title: 'Active Minutes', description: 'Movement intensity across the day.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'resting_heart_rate', title: 'Resting Heart Rate', description: 'Resting recovery and strain signal.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'hrv', title: 'HRV', description: 'Autonomic recovery signal.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'distance', title: 'Distance', description: 'Distance and movement volume.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'calories', title: 'Calories', description: 'Energy expenditure estimate.', status: 'missing', affectsScore: true, tabKey: 'activity', kind: 'needs_data' },
      { key: 'wearable_sync', title: 'Wearable Sync', description: 'Android-first Health Connect / Garmin sync path.', status: 'ready', affectsScore: false, tabKey: 'activity', kind: 'active' },
    ],
  },
] as const;

export function getMainDotStructure(tabKey: TabKey): MainDotDefinition {
  const dot = MAIN_DOT_STRUCTURE.find((candidate) => candidate.key === tabKey);
  if (!dot) {
    throw new Error(`Unknown main dot tab: ${tabKey}`);
  }
  return dot;
}

export function getSubDotsForTab(tabKey: TabKey): readonly SubDotDefinition[] {
  return getMainDotStructure(tabKey).subDots;
}

