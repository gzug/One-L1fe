import {
  dataCoveragePercent,
  readinessSegments,
  scoreDeltas,
  scoreTrend30D,
  scoreTrend7D,
  scoreTrend90D,
  scoreTrendMax,
  trainingSignals,
  type Period,
  type ScoreTrendDay,
} from '../../../v1-marathon/src/data/demoData';
import type { BloodPanel } from '../../../v1-marathon/src/data/bloodStorage';
import type { CustomRange, TimeRange } from '../types/timeRange';
import type {
  HomeChartPoint,
  HomeContributorInput,
  HomeDataMode,
  HomeDisplayData,
  HomeTrendMetric,
  HomeTrendMetricKey,
} from './homeTypes';

type BloodSummary = {
  panelLabel: string;
  markerCount: number;
};

type AdapterInput = {
  mode: HomeDataMode;
  timeRange: TimeRange;
  customRange: CustomRange;
  bloodPanels: BloodPanel[];
};

const SLEEP_VALUES = [61, 68, 63, 71, 64, 76, 66];
const HRV_VALUES = [66, 58, 55, 62, 57, 64, 58];
const RESTING_HR_VALUES = [72, 69, 70, 73, 71, 74, 72];
const STEPS_VALUES = [6200, 8100, 5400, 9400, 7600, 11800, 7000];
const TRAINING_VALUES = [42, 64, 36, 72, 48, 82, 30];
const CALORIE_VALUES = [390, 520, 340, 610, 470, 760, 430];

const EMPTY_CHART: HomeChartPoint[] = [];

export function getHomeDisplayData({
  mode,
  timeRange,
  customRange,
  bloodPanels,
}: AdapterInput): HomeDisplayData {
  const isDemo = mode === 'demo';
  const trendData = isDemo ? trendForRange(timeRange, customRange) : [];
  const period = rangeToPeriod(timeRange, customRange);
  const deltas = scoreDeltas[period];
  const bloodSummary = summarizeBloodPanels(bloodPanels);

  const overallScore = isDemo ? getLatestScore(trendData) : null;
  const recoveryScore = isDemo ? getSegmentValue('Recovery') : null;
  const activityScore = isDemo ? getSegmentValue('Training load') : null;
  const bloodMarkersScore = isDemo ? getSegmentValue('Biomarkers') : null;

  const sleepSignal = trainingSignals.find((signal) => signal.label === 'Sleep duration')?.value ?? '6h 42m';
  const hrvSignal = trainingSignals.find((signal) => signal.label === 'HRV trend')?.value ?? 'Below baseline';
  const restingHrSignal = trainingSignals.find((signal) => signal.label === 'Resting heart rate');
  const chartLabels = trendData.map((point) => point.label);

  return {
    mode,
    timeRange,
    customRange,
    isDemo,
    score: {
      contextLabel: isDemo ? 'Demo context' : 'User Data',
      coverageLabel: isDemo ? `${dataCoveragePercent}% coverage` : 'No score yet',
      overall: overallScore,
      recovery: recoveryScore,
      activity: activityScore,
      bloodMarkers: bloodMarkersScore,
      delta: isDemo ? deltas.score : null,
      dataCoverage: isDemo ? dataCoveragePercent : null,
    },
    contributors: {
      recovery: {
        id: 'recovery',
        label: 'Recovery',
        value: recoveryScore,
        delta: isDemo ? deltas.recovery ?? 3 : null,
        colorKey: 'recovery',
        inputs: [
          { label: 'Sleep', value: isDemo ? 66 : null, delta: isDemo ? 2 : null, colorKey: 'sleep' },
          { label: 'HRV', value: isDemo ? 58 : null, delta: isDemo ? -1 : null, colorKey: 'hrv' },
          { label: 'Resting HR', value: isDemo ? 72 : null, delta: isDemo ? 1 : null, colorKey: 'restingHr' },
        ],
      },
      activity: {
        id: 'activity',
        label: 'Activity',
        value: activityScore,
        delta: isDemo ? 7 : null,
        colorKey: 'activity',
        inputs: [
          { label: 'Steps', value: isDemo ? 73 : null, delta: isDemo ? 2 : null, colorKey: 'steps' },
          { label: 'Training', value: isDemo ? 69 : null, delta: isDemo ? -1 : null, colorKey: 'training' },
          { label: 'Calories', value: isDemo ? 71 : null, delta: isDemo ? 1 : null, colorKey: 'calories' },
        ],
      },
      bloodMarkers: {
        id: 'bloodMarkers',
        label: 'Test Results',
        value: bloodMarkersScore,
        delta: null,
        colorKey: 'blood',
        inputs: buildTestResultInputs({ isDemo, bloodMarkersScore, bloodSummary }),
      },
      future: [
        { label: 'DNA Insights' },
        { label: 'Stool Test' },
        { label: 'Urine Test' },
      ],
    },
    scoreTrend: createScoreTrend(isDemo, trendData),
    recoveryMetrics: createRecoveryMetrics({
      isDemo,
      trendData,
      chartLabels,
      range: timeRange,
      deltas,
      sleepSignal,
      hrvSignal,
      restingHrSignal: restingHrSignal ? `${restingHrSignal.value} ${restingHrSignal.unit}` : '51 bpm',
    }),
    activityMetrics: createActivityMetrics({
      isDemo,
      trendData,
      chartLabels,
      range: timeRange,
      deltas,
    }),
    healthInputs: [
      {
        id: 'bloodMarkers',
        title: 'Blood Markers',
        subtitle: bloodSummary.markerCount > 0
          ? `${bloodSummary.markerCount} markers · ${bloodSummary.panelLabel}`
          : 'Blood panel',
        icon: 'blood',
        state: 'active',
        action: 'bloodResults',
      },
      { id: 'dnaInsights', title: 'DNA Insights', subtitle: 'Coming soon', icon: 'dna', state: 'comingSoon', action: null },
      { id: 'stoolTest', title: 'Stool Test', subtitle: 'Coming soon', icon: 'stool', state: 'comingSoon', action: null },
      { id: 'urineTest', title: 'Urine Test', subtitle: 'Coming soon', icon: 'urine', state: 'comingSoon', action: null },
    ],
    nutritionHub: {
      title: 'Nutrition Hub',
      subtitle: 'Tracking · Planning · Supplements',
      stateLabel: 'Coming soon',
      disabled: true,
    },
  };
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function getSegmentValue(label: string): number {
  return readinessSegments.find((seg) => seg.label.toLowerCase() === label.toLowerCase())?.value ?? 0;
}

function getLatestScore(data: ScoreTrendDay[]) {
  const latest = data[data.length - 1]?.score;
  if (typeof latest === 'number') return latest;
  return clamp(readinessSegments.reduce((sum, seg) => sum + seg.value, 0) / readinessSegments.length);
}

function rangeToPeriod(range: TimeRange, customRange: CustomRange): Period {
  if (range === '1d' || range === '7d') return '7D';
  if (range === '1m') return '30D';
  if (range === '3m' || range === '6m') return '90D';
  if (range === 'custom') {
    const days = customRange.start && customRange.end ? daysBetween(customRange.start, customRange.end) + 1 : 7;
    if (days <= 7) return '7D';
    if (days <= 35) return '30D';
    if (days <= 120) return '90D';
    return 'Max';
  }
  return 'Max';
}

function trendForRange(range: TimeRange, customRange: CustomRange): ScoreTrendDay[] {
  if (range === '1d') return scoreTrend7D.slice(-1);
  if (range === '7d') return scoreTrend7D;
  if (range === '1m') return scoreTrend30D;
  if (range === '3m' || range === '6m') return scoreTrend90D;
  if (range === 'custom') {
    const period = rangeToPeriod(range, customRange);
    if (period === '7D') return scoreTrend7D;
    if (period === '30D') return scoreTrend30D;
    if (period === '90D') return scoreTrend90D;
  }
  return scoreTrendMax;
}

function trendToChart(data: ScoreTrendDay[], key: 'score' | 'recovery' | 'trainingLoad'): HomeChartPoint[] {
  return data.map((point) => ({ label: point.label, value: point[key] }));
}

function arrayToChart(values: number[], labels: string[]): HomeChartPoint[] {
  return values.map((value, index) => ({
    label: labels[index] ?? `${index + 1}`,
    value,
  }));
}

function scaledSeries(base: number[], range: TimeRange): number[] {
  if (range === '1d') return base.slice(-1);
  if (range === '1m') return [base[1], base[3], base[5], base[6]];
  if (range === '3m' || range === '6m') return [base[2], base[4], base[6]];
  if (range === 'max') return [base[0], base[2], base[4], base[6]];
  return base;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date) {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function createScoreTrend(isDemo: boolean, trendData: ScoreTrendDay[]): HomeDisplayData['scoreTrend'] {
  if (!isDemo || trendData.length === 0) {
    return {
      isEmpty: true,
      emptyText: 'No score trend available for User Data yet.',
      series: [],
    };
  }

  return {
    isEmpty: false,
    emptyText: '',
    series: [
      { label: 'Score', colorKey: 'score', data: trendToChart(trendData, 'score') },
      { label: 'Recovery', colorKey: 'recovery', data: trendToChart(trendData, 'recovery') },
      { label: 'Activity', colorKey: 'activity', data: trendToChart(trendData, 'trainingLoad') },
    ],
  };
}

function createRecoveryMetrics({
  isDemo,
  trendData,
  chartLabels,
  range,
  deltas,
  sleepSignal,
  hrvSignal,
  restingHrSignal,
}: {
  isDemo: boolean;
  trendData: ScoreTrendDay[];
  chartLabels: string[];
  range: TimeRange;
  deltas: { recovery: number | null };
  sleepSignal: string;
  hrvSignal: string;
  restingHrSignal: string;
}): Record<HomeTrendMetricKey, HomeTrendMetric> {
  const labels = chartLabels.length ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const series = (values: number[]) => arrayToChart(scaledSeries(values, range), labels);
  return {
    recovery: {
      key: 'recovery',
      label: 'Recovery',
      title: 'Recovery score',
      subtitle: 'Wearable-derived recovery context',
      value: isDemo ? `${getSegmentValue('Recovery')}%` : 'No user data',
      delta: isDemo ? deltas.recovery : null,
      chartType: 'line',
      data: isDemo ? trendToChart(trendData, 'recovery') : EMPTY_CHART,
      colorKey: 'recovery',
      emptyText: 'No recovery data available for User Data yet.',
    },
    sleep: {
      key: 'sleep',
      label: 'Sleep',
      title: 'Sleep',
      subtitle: 'Last night and recent pattern',
      value: isDemo ? sleepSignal : 'No user data',
      delta: isDemo ? 2 : null,
      chartType: 'bar',
      data: isDemo ? series(SLEEP_VALUES) : EMPTY_CHART,
      colorKey: 'sleep',
      emptyText: 'No sleep data available for this range.',
    },
    hrv: {
      key: 'hrv',
      label: 'HRV',
      title: 'HRV',
      subtitle: 'Relative trend, not a diagnosis',
      value: isDemo ? hrvSignal : 'No user data',
      delta: isDemo ? -1 : null,
      chartType: 'line',
      data: isDemo ? series(HRV_VALUES) : EMPTY_CHART,
      colorKey: 'hrv',
      emptyText: 'No HRV data available for this range.',
    },
    restingHr: {
      key: 'restingHr',
      label: 'Resting HR',
      title: 'Resting heart rate',
      subtitle: 'Recent resting pulse context',
      value: isDemo ? restingHrSignal : 'No user data',
      delta: isDemo ? 1 : null,
      chartType: 'line',
      data: isDemo ? series(RESTING_HR_VALUES) : EMPTY_CHART,
      colorKey: 'restingHr',
      emptyText: 'No resting heart rate data available for this range.',
    },
    activity: blankMetric('activity'),
    steps: blankMetric('steps'),
    training: blankMetric('training'),
    calories: blankMetric('calories'),
  };
}

function createActivityMetrics({
  isDemo,
  trendData,
  chartLabels,
  range,
  deltas,
}: {
  isDemo: boolean;
  trendData: ScoreTrendDay[];
  chartLabels: string[];
  range: TimeRange;
  deltas: { trainingLoad: number | null };
}): Record<HomeTrendMetricKey, HomeTrendMetric> {
  const labels = chartLabels.length ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const series = (values: number[]) => arrayToChart(scaledSeries(values, range), labels);
  return {
    activity: {
      key: 'activity',
      label: 'Activity',
      title: 'Activity score',
      subtitle: 'Training load and movement context',
      value: isDemo ? `${getSegmentValue('Training load')}%` : 'No user data',
      delta: isDemo ? deltas.trainingLoad : null,
      chartType: 'line',
      data: isDemo ? trendToChart(trendData, 'trainingLoad') : EMPTY_CHART,
      colorKey: 'activity',
      emptyText: 'No activity data available for User Data yet.',
    },
    steps: {
      key: 'steps',
      label: 'Steps',
      title: 'Steps',
      subtitle: 'Daily movement volume',
      value: isDemo ? '7,000 today' : 'No user data',
      delta: isDemo ? 2 : null,
      chartType: 'bar',
      data: isDemo ? series(STEPS_VALUES) : EMPTY_CHART,
      colorKey: 'steps',
      emptyText: 'No step data available for this range.',
    },
    training: {
      key: 'training',
      label: 'Training',
      title: 'Training',
      subtitle: 'Session load pattern',
      value: isDemo ? 'Controlled' : 'No user data',
      delta: isDemo ? -1 : null,
      chartType: 'bar',
      data: isDemo ? series(TRAINING_VALUES) : EMPTY_CHART,
      colorKey: 'training',
      emptyText: 'No training sessions available for this range.',
    },
    calories: {
      key: 'calories',
      label: 'Calories',
      title: 'Calories',
      subtitle: 'Active calorie estimate',
      value: isDemo ? '430 kcal' : 'No user data',
      delta: isDemo ? 1 : null,
      chartType: 'bar',
      data: isDemo ? series(CALORIE_VALUES) : EMPTY_CHART,
      colorKey: 'calories',
      emptyText: 'No calorie data available for this range.',
    },
    recovery: blankMetric('recovery'),
    sleep: blankMetric('sleep'),
    hrv: blankMetric('hrv'),
    restingHr: blankMetric('restingHr'),
  };
}

function blankMetric(key: HomeTrendMetricKey): HomeTrendMetric {
  return {
    key,
    label: key,
    title: key,
    subtitle: '',
    value: '',
    delta: null,
    chartType: 'line',
    data: [],
    colorKey: 'recovery',
    emptyText: 'No data available.',
  };
}

function buildTestResultInputs({
  isDemo,
  bloodMarkersScore,
  bloodSummary,
}: {
  isDemo: boolean;
  bloodMarkersScore: number | null;
  bloodSummary: BloodSummary;
}): HomeContributorInput[] {
  const hasBloodPanel = bloodSummary.markerCount > 0;
  const bloodDisplay = hasBloodPanel
    ? `${bloodSummary.markerCount} markers`
    : isDemo && bloodMarkersScore !== null
      ? `${clamp(bloodMarkersScore)}%`
      : 'No panel yet';
  const bloodContext = hasBloodPanel
    ? `${bloodSummary.panelLabel} · Blood marker panel`
    : 'Blood marker panel';

  return [
    {
      label: 'Blood Markers',
      value: isDemo ? bloodMarkersScore : null,
      delta: null,
      colorKey: 'blood',
      displayValue: bloodDisplay,
      refContext: bloodContext,
    },
    {
      label: 'DNA Insights',
      value: null,
      delta: null,
      colorKey: 'future',
      displayValue: 'Coming soon',
      refContext: 'Future test integration',
    },
    {
      label: 'Stool Test',
      value: null,
      delta: null,
      colorKey: 'future',
      displayValue: 'Coming soon',
      refContext: 'Future test integration',
    },
    {
      label: 'Urine Test',
      value: null,
      delta: null,
      colorKey: 'future',
      displayValue: 'Coming soon',
      refContext: 'Future test integration',
    },
  ];
}

function summarizeBloodPanels(panels: BloodPanel[]): BloodSummary {
  const latest = panels[panels.length - 1];
  if (!latest) {
    return { panelLabel: 'Latest panel', markerCount: 0 };
  }
  const markers = latest.markers.filter((m) => m.enabled && m.value.trim() !== '');
  return {
    panelLabel: latest.label,
    markerCount: markers.length,
  };
}
