import type { CustomRange, TimeRange } from '../types/timeRange';

export type HomeDataMode = 'user' | 'demo';

export type HomeChartType = 'line' | 'bar';

export type HomeTrendMetricKey =
  | 'recovery'
  | 'sleep'
  | 'hrv'
  | 'restingHr'
  | 'activity'
  | 'steps'
  | 'training'
  | 'calories';

export type HomeMetricColorKey =
  | 'score'
  | 'recovery'
  | 'activity'
  | 'blood'
  | 'future'
  | 'sleep'
  | 'hrv'
  | 'restingHr'
  | 'steps'
  | 'training'
  | 'calories';

export type HomeHealthInputIcon = 'blood' | 'dna' | 'stool' | 'urine' | 'nutrition';

export type HomeChartPoint = {
  label: string;
  value: number;
};

export type HomeTrendMetric = {
  key: HomeTrendMetricKey;
  label: string;
  title: string;
  subtitle: string;
  value: string;
  delta: number | null;
  chartType: HomeChartType;
  data: HomeChartPoint[];
  colorKey: HomeMetricColorKey;
  emptyText: string;
};

export type HomeContributorInput = {
  label: string;
  value: number | null;
  delta: number | null;
  colorKey: HomeMetricColorKey;
  displayValue?: string;  // overrides percentage rendering (e.g. for blood markers)
  refContext?: string;    // neutral reference context (e.g. "Ref 3.9–5.6 mmol/L")
};

export type HomeContributorGroup = HomeContributorInput & {
  id: 'recovery' | 'activity' | 'bloodMarkers';
  inputs?: HomeContributorInput[];
};

export type HomeFutureContributor = {
  label: 'DNA Insights' | 'Stool Test' | 'Urine Test' | 'Nutrition';
};

export type HomeScoreTrendSeries = {
  label: 'Score' | 'Recovery' | 'Activity';
  colorKey: HomeMetricColorKey;
  data: HomeChartPoint[];
};

export type HomeScoreTrend = {
  isEmpty: boolean;
  emptyText: string;
  series: HomeScoreTrendSeries[];
};

export type HomeHealthInputCard = {
  id: 'bloodMarkers' | 'dnaInsights' | 'stoolTest' | 'urineTest';
  title: string;
  subtitle: string;
  icon: HomeHealthInputIcon;
  state: 'active' | 'comingSoon';
  action: 'bloodResults' | null;
};

export type HomeNutritionHub = {
  title: 'Nutrition Hub';
  subtitle: string;
  stateLabel: 'Planned';
  disabled: boolean;
};

export type HomeScoreDisplay = {
  contextLabel: string;
  coverageLabel: string;
  overall: number | null;
  recovery: number | null;
  activity: number | null;
  bloodMarkers: number | null;
  delta: number | null;
  dataCoverage: number | null;
};

export type HomeDisplayData = {
  mode: HomeDataMode;
  timeRange: TimeRange;
  customRange: CustomRange;
  isDemo: boolean;
  score: HomeScoreDisplay;
  contributors: {
    recovery: HomeContributorGroup;
    activity: HomeContributorGroup;
    bloodMarkers: HomeContributorGroup;
    future: HomeFutureContributor[];
  };
  scoreTrend: HomeScoreTrend;
  recoveryMetrics: Record<HomeTrendMetricKey, HomeTrendMetric>;
  activityMetrics: Record<HomeTrendMetricKey, HomeTrendMetric>;
  healthInputs: HomeHealthInputCard[];
  nutritionHub: HomeNutritionHub;
};
