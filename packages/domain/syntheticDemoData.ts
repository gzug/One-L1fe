import type { AskOneL1feContext } from './askOneL1fe.ts';

export type DemoTrendDirection = 'improving' | 'stable' | 'worse';

export interface SyntheticDemoMetric {
  key: string;
  label: string;
  value: string;
  trend: DemoTrendDirection;
  sourceId: string;
  observedAt: string;
  note: string;
}

export interface SyntheticDemoHabitLink {
  habit: string;
  linkedAreas: readonly string[];
  direction: DemoTrendDirection;
  observation: string;
  scoreEffect: 'context_only';
}

export interface SyntheticDemoSnapshot {
  isSynthetic: true;
  periodLabel: string;
  oneL1feScore: number;
  orbitScores: {
    health: number;
    mindSleep: number;
    activity: number;
    nutrition: null;
  };
  metrics: readonly SyntheticDemoMetric[];
  habitLinks: readonly SyntheticDemoHabitLink[];
  currentUpdate: string;
}

export const SYNTHETIC_DEMO_SNAPSHOT: SyntheticDemoSnapshot = {
  isSynthetic: true,
  periodLabel: 'Synthetic 90-day presentation data',
  oneL1feScore: 70,
  orbitScores: {
    health: 74,
    mindSleep: 66,
    activity: 71,
    nutrition: null,
  },
  metrics: [
    {
      key: 'apob',
      label: 'ApoB',
      value: '118 -> 104 mg/dL across 3 synthetic panels',
      trend: 'improving',
      sourceId: 'synthetic_biomarkers',
      observedAt: '2026-04-20T08:15:00.000Z',
      note: 'Fictional biomarker trend for presentation only.',
    },
    {
      key: 'hba1c',
      label: 'HbA1c',
      value: '5.8% -> 5.6%',
      trend: 'improving',
      sourceId: 'synthetic_biomarkers',
      observedAt: '2026-04-20T08:15:00.000Z',
      note: 'Shows how a fresh panel can support a Health trend without implying diagnosis.',
    },
    {
      key: 'steps',
      label: 'Steps',
      value: '7,850/day average; 9 of last 14 days above 8,000',
      trend: 'improving',
      sourceId: 'synthetic_wearables',
      observedAt: '2026-04-23T22:00:00.000Z',
      note: 'Fictional wearable summary over the demo window.',
    },
    {
      key: 'sleep',
      label: 'Sleep',
      value: '6h 35m average; lower on late-caffeine days',
      trend: 'stable',
      sourceId: 'synthetic_mind_sleep',
      observedAt: '2026-04-23T22:00:00.000Z',
      note: 'Used for awareness only, not a diagnosis.',
    },
    {
      key: 'hrv',
      label: 'HRV',
      value: '42 ms average; dips after alcohol and short sleep',
      trend: 'stable',
      sourceId: 'synthetic_wearables',
      observedAt: '2026-04-23T22:00:00.000Z',
      note: 'Contextual recovery signal in the synthetic demo.',
    },
  ],
  habitLinks: [
    {
      habit: 'Late caffeine',
      linkedAreas: ['Sleep', 'HRV', 'Energy'],
      direction: 'worse',
      observation: 'On synthetic days with caffeine after 16:00, sleep duration is lower and next-day energy is less consistent.',
      scoreEffect: 'context_only',
    },
    {
      habit: 'Consistent walking',
      linkedAreas: ['Steps', 'Resting Heart Rate', 'Stress'],
      direction: 'improving',
      observation: 'Weeks with more consistent walking show better activity coverage and a slightly calmer resting heart-rate pattern.',
      scoreEffect: 'context_only',
    },
    {
      habit: 'Alcohol close to bedtime',
      linkedAreas: ['Sleep', 'HRV', 'Recovery'],
      direction: 'worse',
      observation: 'Synthetic recovery markers are less favorable after evenings with alcohol close to bedtime.',
      scoreEffect: 'context_only',
    },
  ],
  currentUpdate:
    'Synthetic 90-day data shows improving Health and Activity signals, while Mind & Sleep is held back by sleep consistency and recovery context. Habits explain possible patterns but do not directly change the score.',
};

export function createSyntheticDemoAskOneL1feContext(): AskOneL1feContext {
  return {
    sources: [
      {
        id: 'synthetic_biomarkers',
        title: 'Synthetic Biomarker Panels',
        kind: 'lab_result',
        status: 'available',
        updatedAt: '2026-04-20T08:15:00.000Z',
        summary: 'Three fictional panels across 90 days for demo presentation.',
      },
      {
        id: 'synthetic_wearables',
        title: 'Synthetic Wearable Summary',
        kind: 'wearable_sync',
        status: 'available',
        updatedAt: '2026-04-23T22:00:00.000Z',
        summary: 'Fictional steps, HRV, resting heart rate, distance, and active-minute trends.',
      },
      {
        id: 'synthetic_mind_sleep',
        title: 'Synthetic Mind & Sleep Check-ins',
        kind: 'manual_entry',
        status: 'available',
        updatedAt: '2026-04-23T22:00:00.000Z',
        summary: 'Fictional sleep, stress, energy, caffeine, alcohol, and habit context.',
      },
      {
        id: 'nutrition_prototype',
        title: 'Nutrition Prototype',
        kind: 'nutrition_estimate',
        status: 'planned_locked',
        updatedAt: null,
        summary: 'Nutrition remains Coming Soon and does not affect the One L1fe Score.',
      },
    ],
    facts: [
      ...SYNTHETIC_DEMO_SNAPSHOT.metrics.map((metric) => ({
        id: `synthetic_${metric.key}`,
        label: metric.label,
        valueSummary: `${metric.value}. ${metric.note}`,
        sourceId: metric.sourceId,
        observedAt: metric.observedAt,
        freshness: 'current' as const,
        medicalInterpretationAllowed: true,
      })),
      ...SYNTHETIC_DEMO_SNAPSHOT.habitLinks.map((link, index) => ({
        id: `synthetic_habit_${index + 1}`,
        label: link.habit,
        valueSummary: `${link.observation} Habits are context only and do not directly affect the score.`,
        sourceId: 'synthetic_mind_sleep',
        observedAt: '2026-04-23T22:00:00.000Z',
        freshness: 'current' as const,
        medicalInterpretationAllowed: true,
      })),
    ],
  };
}
