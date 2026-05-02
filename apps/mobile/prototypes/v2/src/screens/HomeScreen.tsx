import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { IdeasNotesCard } from '../components/IdeasNotesCard';
import { prototypeCopy } from '../data/copy';
import { getHomeDisplayData } from '../data/homeDataAdapter';
import type {
  HomeChartPoint,
  HomeDataMode,
  HomeDisplayData,
  HomeHealthInputCard,
  HomeHealthInputIcon,
  HomeMetricColorKey,
  HomeTrendMetric,
  HomeTrendMetricKey,
} from '../data/homeTypes';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { SCORE_CARD_SPLIT_WIDTH } from '../theme/v2Tokens';
import {
  type CustomRange,
  type TimeRange,
} from '../types/timeRange';
import { checkHealthConnect } from '../../../v1-marathon/src/data/healthConnect';
import type { HealthConnectStatus } from '../../../v1-marathon/src/data/healthConnect';
import { loadPanels } from '../../../v1-marathon/src/data/bloodStorage';
import type { BloodPanel } from '../../../v1-marathon/src/data/bloodStorage';

type HomeScreenProps = {
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
  onViewBloodPanels: () => void;
  onManageSources: () => void;
  dataMode: HomeDataMode;
  timeRange: TimeRange;
  customRange: CustomRange;
  onTimeRangeSelect: (range: TimeRange) => void;
  onCustomRangeChange: (range: CustomRange) => void;
};

const SCORE_RING_SIZE = 160;
const OUTER_RING_STROKE = 12;
const INNER_RING_STROKE = 8;
const SOFT_NEGATIVE = '#C97872';
const CALENDAR_DAYS = 35;

const RECOVERY_KEYS: HomeTrendMetricKey[] = ['recovery', 'sleep', 'hrv', 'restingHr'];
const ACTIVITY_KEYS: HomeTrendMetricKey[] = ['activity', 'steps', 'training', 'calories'];

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function formatSignedDelta(d: number | null): string {
  if (d === null) return '';
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : `${d}`;
}

function formatPeriodDelta(d: number | null): string {
  if (d === null) return 'No prior comparison';
  if (d === 0) return 'Flat vs previous period';
  return d > 0 ? `+${d} vs previous period` : `${d} vs previous period`;
}

function healthStatusLabel(status: HealthConnectStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'available_no_permissions':
      return 'Ready, permissions needed';
    case 'provider_update_required':
      return 'Update needed';
    case 'unavailable':
      return 'Not available on this device';
    case 'error':
      return 'Status unavailable';
    default:
      return 'Checking source status';
  }
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return dateKey(a) === dateKey(b);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function daysBetween(start: Date, end: Date) {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function isBetween(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = startOfDay(date).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

function formatShortDate(date: Date | null) {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function createCalendarDays() {
  const today = startOfDay(new Date());
  const first = addDays(today, -(CALENDAR_DAYS - 1));
  return Array.from({ length: CALENDAR_DAYS }, (_, index) => addDays(first, index));
}

function scoreTone(score: number | null, colors: ThemeColors) {
  if (score === null) return colors.textSubtle;
  if (score >= 70) return colors.brandGreen;
  if (score >= 50) return colors.scoreSoft;
  return colors.scoreLow;
}

function softMint(colors: ThemeColors) {
  return colors.brandGreenSoft;
}

function colorForKey(key: HomeMetricColorKey, colors: ThemeColors, score: number | null = null) {
  switch (key) {
    case 'score':
      return scoreTone(score, colors);
    case 'recovery':
      return colors.recovery;
    case 'activity':
      return colors.activity;
    case 'blood':
      return colors.testResults;
    case 'future':
      return colors.disabled;
    // recovery sub-metrics: lighter shades of recovery green
    case 'sleep':
      return '#72D4A2';
    case 'hrv':
      return '#36B078';
    case 'restingHr':
      return '#1FA367';
    // activity sub-metrics: lighter shades of activity amber
    case 'steps':
      return '#F5B85A';
    case 'training':
      return '#E8882A';
    case 'calories':
      return '#D46A18';
    default:
      return colors.brandGreen;
  }
}

export function HomeScreen({
  onProfilePress,
  onDemoInfoPress,
  onViewBloodPanels,
  onManageSources,
  dataMode,
  timeRange,
  customRange,
  onTimeRangeSelect,
  onCustomRangeChange,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const s = createHomeStyles(colors);

  const [customOpen, setCustomOpen] = useState(false);
  const [recoveryMetric, setRecoveryMetric] = useState<HomeTrendMetricKey>('recovery');
  const [activityMetric, setActivityMetric] = useState<HomeTrendMetricKey>('activity');
  const [hcStatus, setHcStatus] = useState<HealthConnectStatus>('unavailable');
  const [bloodPanels, setBloodPanels] = useState<BloodPanel[]>([]);

  useEffect(() => {
    if (timeRange === 'custom') {
      setCustomOpen(true);
    } else {
      setCustomOpen(false);
    }
  }, [timeRange]);

  useEffect(() => {
    let cancelled = false;
    checkHealthConnect().then((status) => {
      if (!cancelled) setHcStatus(status.status);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPanels().then((panels) => {
      if (cancelled) return;
      setBloodPanels(panels);
    });
    return () => { cancelled = true; };
  }, []);

  const homeData = useMemo(
    () => getHomeDisplayData({
      mode: dataMode,
      timeRange,
      customRange,
      bloodPanels,
    }),
    [bloodPanels, customRange, dataMode, timeRange],
  );

  function selectCustomDate(date: Date) {
    const prev = customRange;
    let next: CustomRange;
    if (!prev.start || prev.end) {
      next = { start: date, end: null };
    } else if (date.getTime() < prev.start.getTime()) {
      next = { start: date, end: null };
    } else {
      next = { start: prev.start, end: date };
    }
    onTimeRangeSelect('custom');
    onCustomRangeChange(next);
  }

  return (
    <>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={s.container}>
          {customOpen ? (
            <CustomRangePicker
              range={customRange}
              onSelectDate={selectCustomDate}
              colors={colors}
            />
          ) : null}

          <ScoreCard
            score={homeData.score}
            contributors={homeData.contributors}
            colors={colors}
          />

          <ScoreTrendMiniChart score={homeData.score.overall} trend={homeData.scoreTrend} colors={colors} />

          <TrendCard
            title="Recovery"
            subtitle="Recovery · Sleep · HRV · Resting HR"
            metricKeys={RECOVERY_KEYS}
            selectedMetric={recoveryMetric}
            onSelectMetric={setRecoveryMetric}
            metrics={homeData.recoveryMetrics}
          />

          <TrendCard
            title="Activity"
            subtitle="Activity · Steps · Training · Calories"
            metricKeys={ACTIVITY_KEYS}
            selectedMetric={activityMetric}
            onSelectMetric={setActivityMetric}
            metrics={homeData.activityMetrics}
          />

          <HealthInputsSection
            cards={homeData.healthInputs}
            onViewBloodPanels={onViewBloodPanels}
            colors={colors}
          />

          <NutritionHub data={homeData.nutritionHub} colors={colors} />

          <IdeasNotesCard />

          <SourceStatusCard
            hcStatus={hcStatus}
            onManageSources={onManageSources}
            colors={colors}
          />

          <Text style={s.safetyNote}>{prototypeCopy.safetyNote}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function CustomRangePicker({
  range,
  onSelectDate,
  colors,
}: {
  range: CustomRange;
  onSelectDate: (date: Date) => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const days = useMemo(createCalendarDays, []);

  return (
    <View style={s.calendarCard}>
      <View style={s.calendarHeader}>
        <View>
          <Text style={s.calendarTitle}>Custom range</Text>
          <Text style={s.calendarSubtitle}>
            {range.start && range.end
              ? `${formatShortDate(range.start)} to ${formatShortDate(range.end)}`
              : range.start
                ? `${formatShortDate(range.start)} to select end`
                : 'Choose a start and end date'}
          </Text>
        </View>
      </View>
      <View style={s.calendarGrid}>
        {days.map((day) => {
          const isStart = sameDay(day, range.start);
          const isEnd = sameDay(day, range.end);
          const inRange = isBetween(day, range.start, range.end);
          return (
            <Pressable
              key={dateKey(day)}
              onPress={() => onSelectDate(day)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${formatShortDate(day)}`}
              style={[
                s.calendarDay,
                inRange && { backgroundColor: softMint(colors) },
                (isStart || isEnd) && { backgroundColor: colors.scoreStrong, borderColor: colors.scoreStrong },
              ]}
            >
              <Text style={[s.calendarDayText, (isStart || isEnd) && { color: colors.background, fontWeight: '800' }]}>
                {day.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ScoreCard({
  score,
  contributors,
  colors,
}: {
  score: HomeDisplayData['score'];
  contributors: HomeDisplayData['contributors'];
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const { width } = useWindowDimensions();
  const isWide = width >= SCORE_CARD_SPLIT_WIDTH;
  return (
    <View style={s.scoreCard}>
      <View style={s.scoreHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardEyebrow}>{score.contextLabel}</Text>
          <Text style={s.scoreTitle}>
            One L<Text style={{ color: colors.brandGreen }}>1</Text>fe Score
          </Text>
        </View>
        <View style={[s.coveragePill, { borderColor: colors.borderSubtle }]}>
          <Text style={s.coverageText}>{score.coverageLabel}</Text>
        </View>
      </View>

      <View style={[s.scoreBodyRow, isWide && s.scoreBodyRowWide]}>
        <MultiRingScore
          score={score.overall}
          recoveryScore={score.recovery}
          activityScore={score.activity}
          colors={colors}
        />

        <ContributorLegend
          contributors={contributors}
          colors={colors}
          flex={isWide}
        />
      </View>
    </View>
  );
}

function MultiRingScore({
  score,
  recoveryScore,
  activityScore,
  colors,
}: {
  score: number | null;
  recoveryScore: number | null;
  activityScore: number | null;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const centerColor = score === null ? colors.textSubtle : colors.brandGreen;
  return (
    <View style={s.scoreRingWrap}>
      <Svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}>
        <ProgressCircle
          value={score}
          radius={72}
          strokeWidth={OUTER_RING_STROKE}
          color={scoreTone(score, colors)}
          trackColor={colors.ringTrack}
        />
        <ProgressCircle
          value={recoveryScore}
          radius={54}
          strokeWidth={INNER_RING_STROKE}
          color={colors.recovery}
          trackColor={colors.progressTrack}
        />
        <ProgressCircle
          value={activityScore}
          radius={40}
          strokeWidth={INNER_RING_STROKE}
          color={colors.activity}
          trackColor={colors.progressTrack}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, s.scoreRingCenter]}>
        <Text style={[s.scoreValue, { color: centerColor }]}>
          {score === null ? '--' : `${clamp(score)}%`}
        </Text>
        <Text style={s.scoreLabel}>ONE L1FE SCORE</Text>
      </View>
    </View>
  );
}

function ProgressCircle({
  value,
  radius,
  strokeWidth,
  color,
  trackColor,
}: {
  value: number | null;
  radius: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
}) {
  const circumference = 2 * Math.PI * radius;
  const progress = value === null ? 0 : clamp(value) / 100;
  return (
    <>
      <Circle
        cx={SCORE_RING_SIZE / 2}
        cy={SCORE_RING_SIZE / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={SCORE_RING_SIZE / 2}
        cy={SCORE_RING_SIZE / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        opacity={value === null ? 0.28 : 1}
        strokeDasharray={`${circumference * progress} ${circumference}`}
        rotation={-90}
        origin={`${SCORE_RING_SIZE / 2}, ${SCORE_RING_SIZE / 2}`}
      />
    </>
  );
}

function ScoreTrendMiniChart({
  score,
  trend,
  colors,
}: {
  score: number | null;
  trend: HomeDisplayData['scoreTrend'];
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  if (trend.isEmpty || trend.series.length === 0) {
    return (
      <View style={s.scoreTrendCard}>
        <View style={s.scoreTrendHeader}>
          <Text style={s.scoreTrendTitle}>Score trend</Text>
          <Text style={s.scoreTrendCaption}>Waiting for connected data</Text>
        </View>
        <View style={s.scoreTrendEmpty}>
          <Text style={s.emptyChartText}>{trend.emptyText}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.scoreTrendCard}>
      <View style={s.scoreTrendHeader}>
        <Text style={s.scoreTrendTitle}>Score trend</Text>
        <View style={s.scoreTrendLegend}>
          {trend.series.map((item) => (
            <View key={item.label} style={s.scoreTrendLegendItem}>
              <View style={[s.scoreTrendDot, { backgroundColor: colorForKey(item.colorKey, colors, score) }]} />
              <Text style={s.scoreTrendLegendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Svg width="100%" height={76} viewBox="0 0 300 76">
        {[0, 1].map((line) => (
          <Path
            key={line}
            d={`M 8 ${24 + line * 26} L 292 ${24 + line * 26}`}
            stroke={colors.borderSubtle}
            strokeWidth={1}
            fill="none"
          />
        ))}
        {trend.series.map((item) => (
          <MiniLineSeries
            key={item.label}
            data={item.data}
            color={colorForKey(item.colorKey, colors, score)}
          />
        ))}
      </Svg>
    </View>
  );
}

function MiniLineSeries({ data, color }: { data: HomeChartPoint[]; color: string }) {
  const width = 300;
  const height = 68;
  const paddingX = 12;
  const paddingY = 10;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = data.map((point, index) => {
    const x = data.length === 1 ? width / 2 : paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = paddingY + (1 - (point.value - min) / span) * (height - paddingY * 2);
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');

  return (
    <>
      {points.length > 1 ? (
        <Path d={path} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : null}
      {points.map((point, index) => (
        <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r={2.4} fill={color} />
      ))}
    </>
  );
}

function ContributorLegend({
  contributors,
  colors,
  flex,
}: {
  contributors: HomeDisplayData['contributors'];
  colors: ThemeColors;
  flex?: boolean;
}) {
  const s = createHomeStyles(colors);
  const [recoveryOpen, setRecoveryOpen] = React.useState(true);
  const [activityOpen, setActivityOpen] = React.useState(false);
  return (
    <View style={[s.legendCard, flex && s.legendCardFlex]}>
      {/* Recovery — accordion */}
      <Pressable
        onPress={() => setRecoveryOpen((o) => !o)}
        style={s.accordionHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: recoveryOpen }}
      >
        <View style={[s.contributorDot, { backgroundColor: colors.recovery }]} />
        <Text style={[s.contributorLabel, { fontWeight: '800' }]}>{contributors.recovery.label}</Text>
        <Text style={s.contributorValue}>
          {contributors.recovery.value === null ? '--' : `${clamp(contributors.recovery.value)}%`}
        </Text>
        <Text style={[s.accordionChevron, { color: colors.textSubtle }]}>
          {recoveryOpen ? '▾' : '▸'}
        </Text>
      </Pressable>
      {recoveryOpen && contributors.recovery.inputs?.map((item) => (
        <ContributorRow key={item.label} item={item} colors={colors} sub />
      ))}

      <View style={s.legendDivider} />

      {/* Activity — accordion */}
      <Pressable
        onPress={() => setActivityOpen((o) => !o)}
        style={s.accordionHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: activityOpen }}
      >
        <View style={[s.contributorDot, { backgroundColor: colors.activity }]} />
        <Text style={[s.contributorLabel, { fontWeight: '800' }]}>{contributors.activity.label}</Text>
        <Text style={s.contributorValue}>
          {contributors.activity.value === null ? '--' : `${clamp(contributors.activity.value)}%`}
        </Text>
        <Text style={[s.accordionChevron, { color: colors.textSubtle }]}>
          {activityOpen ? '▾' : '▸'}
        </Text>
      </Pressable>
      {activityOpen && contributors.activity.inputs?.map((item) => (
        <ContributorRow key={item.label} item={item} colors={colors} sub />
      ))}

      <View style={s.legendDivider} />

      {/* Test Results — single static row, no chevron */}
      <ContributorRow item={contributors.bloodMarkers} colors={colors} />

      <View style={s.legendDivider} />

      {/* Nutrition — disabled / coming soon */}
      <View style={[s.contributorRow, { opacity: 0.5 }]}>
        <View style={[s.contributorDot, { backgroundColor: colors.disabled }]} />
        <Text style={[s.contributorLabel, { color: colors.textSubtle }]}>Nutrition</Text>
        <View style={s.comingSoonPill}>
          <Text style={s.comingSoonText}>Soon</Text>
        </View>
      </View>
    </View>
  );
}

function ContributorRow({
  item,
  colors,
  sub,
}: {
  item: {
    label: string;
    value: number | null;
    delta: number | null;
    colorKey: HomeMetricColorKey;
  };
  colors: ThemeColors;
  sub?: boolean;
}) {
  const s = createHomeStyles(colors);
  const color = colorForKey(item.colorKey, colors);
  return (
    <View style={[s.contributorRow, sub && s.contributorSubRow]}>
      <View style={[s.contributorDot, { backgroundColor: color, opacity: item.value === null ? 0.35 : 1 }]} />
      <Text style={[s.contributorLabel, sub && s.contributorSubLabel]}>{item.label}</Text>
      <Text style={s.contributorValue}>{item.value === null ? '--' : `${clamp(item.value)}%`}</Text>
      {item.delta !== null ? (
        <Text style={[s.contributorDelta, { color: item.delta < 0 ? SOFT_NEGATIVE : colors.positive }]}>
          {formatSignedDelta(item.delta)}
        </Text>
      ) : (
        <View style={s.deltaSpacer} />
      )}
    </View>
  );
}


function TrendCard({
  title,
  subtitle,
  metricKeys,
  selectedMetric,
  onSelectMetric,
  metrics,
}: {
  title: string;
  subtitle: string;
  metricKeys: HomeTrendMetricKey[];
  selectedMetric: HomeTrendMetricKey;
  onSelectMetric: (metric: HomeTrendMetricKey) => void;
  metrics: Record<HomeTrendMetricKey, HomeTrendMetric>;
}) {
  const { colors } = useTheme();
  const s = createHomeStyles(colors);
  const metric = metrics[selectedMetric];
  const metricColor = colorForKey(metric.colorKey, colors);
  return (
    <View style={s.trendCard}>
      <View style={s.trendHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={s.metricValueBlock}>
          <Text style={[s.metricValue, { color: metricColor }]}>{metric.value}</Text>
          <Text style={s.metricDelta}>{formatPeriodDelta(metric.delta)}</Text>
        </View>
      </View>

      <View style={s.chartHeader}>
        <Text style={s.chartTitle}>{metric.title}</Text>
        <Text style={s.chartSubtitle}>{metric.subtitle}</Text>
      </View>

      <MetricChart metric={metric} color={metricColor} colors={colors} />

      <View style={s.metricToggleRow}>
        {metricKeys.map((key) => {
          const active = selectedMetric === key;
          return (
            <Pressable
              key={key}
              onPress={() => onSelectMetric(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                s.metricToggle,
                active && { backgroundColor: softMint(colors), borderColor: metricColor },
              ]}
            >
              <Text style={[s.metricToggleText, { color: active ? colors.text : colors.textSubtle }]}>
                {metrics[key].label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MetricChart({
  metric,
  color,
  colors,
}: {
  metric: HomeTrendMetric;
  color: string;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  if (!metric.data.length) {
    return (
      <View style={s.emptyChart}>
        <Text style={s.emptyChartText}>{metric.emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={s.chartWrap}>
      <Svg width="100%" height={98} viewBox="0 0 300 98">
        {metric.chartType === 'line' ? (
          <LineChart data={metric.data} color={color} colors={colors} />
        ) : (
          <BarChart data={metric.data} color={color} colors={colors} />
        )}
      </Svg>
      <View style={s.chartLabels}>
        {metric.data.map((point) => (
          <Text key={point.label} style={s.chartLabel}>{point.label}</Text>
        ))}
      </View>
    </View>
  );
}

function LineChart({ data, color, colors }: { data: HomeChartPoint[]; color: string; colors: ThemeColors }) {
  const width = 300;
  const height = 82;
  const paddingX = 12;
  const paddingY = 12;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = data.map((point, index) => {
    const x = data.length === 1 ? width / 2 : paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = paddingY + (1 - (point.value - min) / span) * (height - paddingY * 2);
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');

  return (
    <>
      {[0, 1, 2].map((line) => (
        <Path
          key={line}
          d={`M 8 ${18 + line * 26} L 292 ${18 + line * 26}`}
          stroke={colors.borderSubtle}
          strokeWidth={1}
          fill="none"
        />
      ))}
      {points.length > 1 ? <Path d={path} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {points.map((point, index) => (
        <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r={3.5} fill={color} />
      ))}
    </>
  );
}

function BarChart({ data, color, colors }: { data: HomeChartPoint[]; color: string; colors: ThemeColors }) {
  const width = 300;
  const height = 82;
  const paddingX = 14;
  const max = Math.max(...data.map((point) => point.value), 1);
  const slot = (width - paddingX * 2) / data.length;
  const barWidth = Math.max(10, Math.min(28, slot * 0.58));
  return (
    <>
      {[0, 1, 2].map((line) => (
        <Path
          key={line}
          d={`M 8 ${18 + line * 26} L 292 ${18 + line * 26}`}
          stroke={colors.borderSubtle}
          strokeWidth={1}
          fill="none"
        />
      ))}
      {data.map((point, index) => {
        const barHeight = Math.max(8, (point.value / max) * 62);
        const x = paddingX + index * slot + (slot - barWidth) / 2;
        const y = height - barHeight - 4;
        return (
          <Rect
            key={`${point.label}-${point.value}`}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={barWidth / 2}
            fill={color}
            opacity={0.88}
          />
        );
      })}
    </>
  );
}

function HealthInputsSection({
  cards,
  onViewBloodPanels,
  colors,
}: {
  cards: HomeHealthInputCard[];
  onViewBloodPanels: () => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  return (
    <View style={s.sectionBlock}>
      <View style={s.sectionHeader}>
        <Text style={s.cardTitle}>Health Inputs</Text>
        <Text style={s.cardSubtitle}>Periodic uploads that refine your score over time.</Text>
      </View>
      <View style={s.inputGrid}>
        {cards.map((card) => (
          <HealthInputCard
            key={card.id}
            card={card}
            onPress={card.action === 'bloodResults' ? onViewBloodPanels : undefined}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

function HealthInputCard({
  card,
  onPress,
  colors,
}: {
  card: HomeHealthInputCard;
  onPress?: () => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const active = card.state === 'active';
  const content = (
    <>
      <View style={[s.inputIcon, active ? { backgroundColor: softMint(colors) } : s.inputIconDisabled]}>
        <HealthInputGlyph
          name={card.icon}
          color={active ? colors.scoreStrong : colors.textSubtle}
        />
      </View>
      <Text style={[s.inputTitle, !active && { color: colors.textMuted }]}>{card.title}</Text>
      <Text style={s.inputSubtitle}>{card.subtitle}</Text>
      {!active ? (
        <View style={s.comingSoonPill}>
          <Text style={s.comingSoonText}>Coming soon</Text>
        </View>
      ) : null}
    </>
  );

  if (!active || !onPress) {
    return <View style={[s.inputCard, s.inputCardDisabled]}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Open Blood Results"
      style={({ pressed }) => [s.inputCard, pressed && { opacity: 0.72 }]}
    >
      {content}
      <Text style={s.activeInputCta}>Open →</Text>
    </Pressable>
  );
}

function NutritionHub({
  data,
  colors,
}: {
  data: HomeDisplayData['nutritionHub'];
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  return (
    <View style={s.nutritionCard}>
      <View style={s.nutritionIcon}>
        <HealthInputGlyph name="nutrition" color={colors.textSubtle} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{data.title}</Text>
        <Text style={s.cardSubtitle}>{data.subtitle}</Text>
      </View>
      <View style={s.comingSoonPill}>
        <Text style={s.comingSoonText}>{data.stateLabel}</Text>
      </View>
    </View>
  );
}

function HealthInputGlyph({ name, color }: { name: HomeHealthInputIcon; color: string }) {
  if (name === 'blood') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M9 3 H16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M11 4 V10.8 L7.7 16.8 C6.6 18.8 8 21 10.3 21 H14.7 C17 21 18.4 18.8 17.3 16.8 L14 10.8 V4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M9.1 16 H15.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={0.75} />
      </Svg>
    );
  }
  if (name === 'dna') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M8 4 C16 7 16 17 8 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M16 4 C8 7 8 17 16 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M9.5 8 H14.5 M9 12 H15 M9.5 16 H14.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.72} />
      </Svg>
    );
  }
  if (name === 'urine') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M7 7 H17 L15.8 20 H8.2 L7 7 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
        <Path d="M8.2 14 H15.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={0.72} />
        <Path d="M9 4 H15" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'nutrition') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M13 7 C16.8 5.8 20 8.4 19.4 12.4 C18.9 16 16.4 20 13.8 20 C12.9 20 12.3 19.6 11.7 19.6 C11.1 19.6 10.5 20 9.6 20 C7 20 4.5 16 4 12.4 C3.4 8.4 6.6 5.8 10.4 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M12 7 C12 4.8 13.3 3.4 15.4 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M8 4 H16 M10 5 V11 L7.8 16.2 C7 18.2 8.4 20 10.5 20 H13.5 C15.6 20 17 18.2 16.2 16.2 L14 11 V5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={12} cy={16} r={1.4} fill={color} opacity={0.72} />
    </Svg>
  );
}

function SourceStatusCard({
  hcStatus,
  onManageSources,
  colors,
}: {
  hcStatus: HealthConnectStatus;
  onManageSources: () => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const isConnected = hcStatus === 'connected';
  const dotColor = isConnected ? colors.positive : hcStatus === 'unavailable' ? colors.textSubtle : colors.warning;

  return (
    <View style={s.sourceCard}>
      <View style={s.sourceHeader}>
        <View style={s.sourceIcon}>
          <PathIcon color={colors.textSubtle} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.sourceTitle}>Sources</Text>
          <Text style={s.sourceSubtitle}>Health Connect is display-only in this prototype.</Text>
        </View>
      </View>
      <View style={s.sourceFooter}>
        <View style={s.statusInline}>
          <View style={[s.statusDot, { backgroundColor: dotColor }]} />
          <Text style={s.statusInlineText}>{healthStatusLabel(hcStatus)}</Text>
        </View>
        <Pressable onPress={onManageSources} hitSlop={8} style={s.sourceButton} accessibilityLabel="Manage sources">
          <Text style={s.sourceButtonText}>Manage sources →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PathIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d="M4 9.2 C4 6.3 6.3 4 9.2 4 L14 4 M14 4 L11.4 1.8 M14 4 L11.4 6.2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 8.8 C14 11.7 11.7 14 8.8 14 L4 14 M4 14 L6.6 11.8 M4 14 L6.6 16.2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scroll: {
      alignItems: 'center',
      paddingTop: spacing.md,
      paddingBottom: 100,
    },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.lg,
    },
    calendarCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    calendarTitle: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '800',
    },
    calendarSubtitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      marginTop: 1,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.sm,
    },
    calendarDay: {
      width: '13%',
      aspectRatio: 1,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    calendarDayText: {
      color: colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    scoreCard: {
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.md,
    },
    scoreHeader: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    cardEyebrow: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    scoreTitle: {
      color: colors.text,
      fontSize: typography.heroName,
      lineHeight: 31,
      fontWeight: '800',
      letterSpacing: 0,
      marginTop: 1,
    },
    coveragePill: {
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    coverageText: {
      color: colors.textMuted,
      fontSize: typography.micro,
      fontWeight: '800',
    },
    scoreBodyRow: {
      alignSelf: 'stretch',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.sm,
    },
    scoreBodyRowWide: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    scoreRingWrap: {
      width: SCORE_RING_SIZE,
      height: SCORE_RING_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreRingCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreValue: {
      fontSize: 42,
      lineHeight: 48,
      fontWeight: '900',
      letterSpacing: -1,
    },
    scoreLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    scoreTrendCard: {
      alignSelf: 'stretch',
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.xs,
    },
    scoreTrendHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    scoreTrendTitle: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '800',
    },
    scoreTrendCaption: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    scoreTrendLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      flex: 1,
    },
    scoreTrendLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    scoreTrendDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    scoreTrendLegendText: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '800',
    },
    scoreTrendEmpty: {
      minHeight: 76,
      alignItems: 'center',
      justifyContent: 'center',
    },
    legendCard: {
      alignSelf: 'stretch',
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surfaceSoft,
      padding: spacing.sm,
      gap: 2,
    },
    legendCardFlex: {
      flex: 1,
      minWidth: 0,
      alignSelf: 'auto',
    },
    legendDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderSubtle,
      marginVertical: spacing.xs,
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 26,
      gap: spacing.xs,
    },
    accordionChevron: {
      fontSize: typography.caption,
      fontWeight: '800',
      marginLeft: 2,
    },
    futureSection: {
      opacity: 0.55,
    },
    contributorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 22,
      gap: spacing.xs,
    },
    contributorSubRow: {
      marginLeft: 4,
      paddingLeft: spacing.lg,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.borderSubtle,
    },
    contributorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    contributorLabel: {
      flex: 1,
      color: colors.text,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    contributorSubLabel: {
      color: colors.textMuted,
      fontWeight: '600',
    },
    contributorValue: {
      width: 34,
      color: colors.text,
      fontSize: typography.micro,
      fontWeight: '800',
      textAlign: 'right',
    },
    contributorDelta: {
      width: 24,
      fontSize: typography.micro,
      fontWeight: '800',
      textAlign: 'right',
    },
    deltaSpacer: {
      width: 24,
    },
    futureValue: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '700',
    },
    trendCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    trendHeader: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    cardTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
      letterSpacing: 0,
    },
    cardSubtitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      marginTop: 1,
    },
    metricValueBlock: {
      alignItems: 'flex-end',
      maxWidth: 132,
    },
    metricValue: {
      fontSize: typography.bodySmall,
      fontWeight: '800',
      textAlign: 'right',
    },
    metricDelta: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'right',
    },
    chartHeader: {
      gap: 1,
    },
    chartTitle: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '800',
    },
    chartSubtitle: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    chartWrap: {
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.xs,
      gap: spacing.xs,
    },
    chartLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    chartLabel: {
      flex: 1,
      color: colors.textSubtle,
      fontSize: typography.micro,
      textAlign: 'center',
      fontWeight: '700',
    },
    emptyChart: {
      minHeight: 122,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    emptyChartText: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
    },
    metricToggleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    metricToggle: {
      minHeight: 40,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricToggleText: {
      fontSize: typography.caption,
      fontWeight: '800',
    },
    sectionBlock: {
      gap: spacing.md,
    },
    sectionHeader: {
      paddingHorizontal: spacing.xs,
    },
    inputGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    inputCard: {
      width: '48.8%',
      minHeight: 136,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
    },
    inputCardDisabled: {
      opacity: 0.78,
      backgroundColor: colors.surface,
      borderColor: colors.borderSubtle,
    },
    inputIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    inputIconDisabled: {
      backgroundColor: colors.surfaceElevated,
    },
    inputTitle: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '800',
    },
    inputSubtitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    activeInputCta: {
      color: colors.accent,
      fontSize: typography.caption,
      fontWeight: '800',
      marginTop: 'auto',
    },
    comingSoonPill: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginTop: spacing.xs,
    },
    comingSoonText: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      fontWeight: '800',
    },
    nutritionCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      opacity: 0.9,
    },
    nutritionIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceElevated,
    },
    sourceCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      gap: spacing.md,
    },
    sourceHeader: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center',
    },
    sourceIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
    },
    sourceTitle: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '800',
    },
    sourceSubtitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      marginTop: 1,
    },
    sourceFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    statusInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 1,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    statusInlineText: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      flex: 1,
    },
    sourceButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: spacing.xs,
      paddingLeft: spacing.sm,
    },
    sourceButtonText: {
      color: colors.accent,
      fontSize: typography.caption,
      fontWeight: '800',
    },
    safetyNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
    },
  });
}
