import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { IdeasNotesCard } from '../components/IdeasNotesCard';
import {
  InteractiveTrendChartV2,
  QuietBarChartV2,
} from '../components/InteractiveTrendChartV2';
import { prototypeCopy } from '../data/copy';
import { getHomeDisplayData } from '../data/homeDataAdapter';
import type {
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
  onDemoInfoPress: () => void;
  onViewBloodPanels: () => void;
  onManageSources: () => void;
  dataMode: HomeDataMode;
  onDataModeChange: (mode: HomeDataMode) => void;
  timeRange: TimeRange;
  customRange: CustomRange;
  onTimeRangeSelect: (range: TimeRange) => void;
  onCustomRangeChange: (range: CustomRange) => void;
};

const SCORE_RING_SIZE = 188;
const OUTER_RING_STROKE = 12;
const CALENDAR_DAYS = 35;

const RECOVERY_KEYS: HomeTrendMetricKey[] = ['recovery', 'sleep', 'hrv', 'restingHr'];
const ACTIVITY_KEYS: HomeTrendMetricKey[] = ['activity', 'steps', 'training', 'calories'];

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function formatPeriodDelta(d: number | null): string {
  if (d === null) return 'No prior comparison';
  if (d === 0) return 'Flat vs previous period';
  return d > 0 ? `+${d} vs previous period` : `${d} vs previous period`;
}

function statusFromValue(value: number | null) {
  if (value === null) return 'Pending';
  if (value >= 75) return 'Strong';
  if (value >= 60) return 'Stable';
  return 'Watch';
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
    case 'sleep':
      return colors.recoverySub1;
    case 'hrv':
      return colors.recoverySub2;
    case 'restingHr':
      return colors.recoverySub3;
    case 'steps':
      return colors.activitySub1;
    case 'training':
      return colors.activitySub2;
    case 'calories':
      return colors.activitySub3;
    default:
      return colors.brandGreen;
  }
}

export function HomeScreen({
  onViewBloodPanels,
  onManageSources,
  dataMode,
  onDataModeChange,
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
            dataMode={dataMode}
            onDataModeChange={onDataModeChange}
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

          <NextIntegrations colors={colors} />

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
  dataMode,
  onDataModeChange,
  colors,
}: {
  score: HomeDisplayData['score'];
  contributors: HomeDisplayData['contributors'];
  dataMode: HomeDataMode;
  onDataModeChange: (mode: HomeDataMode) => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const { width } = useWindowDimensions();
  const isWide = width >= SCORE_CARD_SPLIT_WIDTH;
  const isCompactWide = isWide && width < 600;
  return (
    <View style={s.scoreCard}>
      <View style={s.scoreTopRow}>
        <View style={s.modeCluster}>
          <View style={s.modeToggle} accessibilityRole="tablist">
            {(['user', 'demo'] as const).map((mode) => {
              const active = dataMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => onDataModeChange(mode)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[s.modeButton, active && s.modeButtonActive]}
                >
                  <Text style={[s.modeButtonText, active && s.modeButtonTextActive]}>
                    {mode === 'user' ? 'User Data' : 'Demo'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={s.balancePill}>
          <View>
            <Text style={s.balanceTitle}>{score.overall === null ? 'No score yet' : 'In balance'}</Text>
            <Text style={s.balanceSub}>{score.overall === null ? 'Connect data' : 'Keep it up!'}</Text>
          </View>
        </View>
      </View>

      <View style={[s.scoreBodyRow, isWide && s.scoreBodyRowWide, isCompactWide && s.scoreBodyRowCompactWide]}>
        <MultiRingScore
          score={score.overall}
          colors={colors}
        />

        <ContributorLegend
          contributors={contributors}
          colors={colors}
          flex={isWide}
          compact={isCompactWide}
        />
      </View>
    </View>
  );
}

function MultiRingScore({ score, colors }: { score: number | null; colors: ThemeColors }) {
  const s = createHomeStyles(colors);
  const centerColor = score === null ? colors.textSubtle : colors.brandGreen;
  return (
    <View style={s.scoreRingWrap}>
      <Svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}>
        <ProgressCircle
          value={score}
          radius={82}
          strokeWidth={OUTER_RING_STROKE}
          color={scoreTone(score, colors)}
          trackColor={colors.ringTrack}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, s.scoreRingCenter]}>
        <Text style={[s.scoreValue, { color: centerColor, fontFamily: 'BrandDisplay' }]}>
          {score === null ? '--' : `${clamp(score)}%`}
        </Text>
        <Text style={s.scoreLabel}>One L1fe Score</Text>
        <Text style={s.scoreStatusLine}>{score === null ? 'Waiting for data' : '● Good'}</Text>
      </View>
      <View style={s.scoreBasisRow}>
        <View style={s.scoreBasisIcon}>
          <ContributorIcon name="shield" color={colors.brandGreen} />
        </View>
        <Text style={s.scoreBasisText}>Your score is based on 4 key pillars of your health.</Text>
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
  const [visible, setVisible] = React.useState({ score: true, recovery: true, activity: true });

  function toggle(key: 'score' | 'recovery' | 'activity') {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (trend.isEmpty || trend.series.length === 0) {
    return (
      <View style={s.scoreTrendCard}>
        <View style={s.scoreTrendHeader}>
          <Text style={s.scoreTrendTitle}>One Health Score Trend</Text>
          <Text style={s.scoreTrendCaption}>Waiting for connected data</Text>
        </View>
        <View style={s.scoreTrendEmpty}>
          <Text style={s.emptyChartText}>{trend.emptyText}</Text>
        </View>
      </View>
    );
  }

  const scoreColor = colorForKey('score', colors, score);

  return (
    <View style={s.scoreTrendCard}>
      <View style={s.scoreTrendHeader}>
        <Text style={s.scoreTrendTitle}>One Health Score Trend</Text>
      </View>
      <InteractiveTrendChartV2
        colors={colors}
        height={164}
        yMin={0}
        yMax={100}
        yTicks={[100, 80, 60, 40, 20, 0]}
        showYAxis={false}
        series={[
          ...(visible.score ? [{ key: 'score', label: 'Score', color: scoreColor, data: trend.series[0]?.data ?? [], style: 'area' as const }] : []),
          ...(visible.recovery ? [{ key: 'recovery', label: 'Recovery', color: colors.recovery, data: trend.series[1]?.data ?? [] }] : []),
          ...(visible.activity ? [{ key: 'activity', label: 'Activity', color: colors.activity, data: trend.series[2]?.data ?? [], style: 'dashed' as const }] : []),
        ]}
      />
      <View style={s.scoreTrendLegend}>
        <TrendLegendPill label="Score" color={scoreColor} on={visible.score} onPress={() => toggle('score')} colors={colors} />
        <TrendLegendPill label="Recovery" color={colors.recovery} on={visible.recovery} onPress={() => toggle('recovery')} colors={colors} />
        <TrendLegendPill label="Activity" color={colors.activity} on={visible.activity} onPress={() => toggle('activity')} colors={colors} />
        <TrendLegendPill label="Test Results" color={colors.testResults} on={false} colors={colors} />
        <TrendLegendPill label="Nutrition" color={colors.disabled} on={false} colors={colors} />
      </View>
    </View>
  );
}

function TrendLegendPill({
  label,
  color,
  on,
  onPress,
  colors,
}: {
  label: string;
  color: string;
  on: boolean;
  onPress?: () => void;
  colors: ThemeColors;
}) {
  const s = createHomeStyles(colors);
  const pill = (
    <View style={[s.scoreLegendPill, on && { backgroundColor: colors.brandGreenSoft, borderColor: colors.accentBorder }]}>
      <View style={[s.scoreTrendDot, { backgroundColor: on ? color : colors.textSubtle }]} />
      <Text style={[s.scoreTrendLegendText, { color: on ? colors.text : colors.textSubtle }]}>{label}</Text>
    </View>
  );
  if (!onPress) return pill;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
      {pill}
    </Pressable>
  );
}

function ContributorLegend({
  contributors,
  colors,
  flex,
  compact,
}: {
  contributors: HomeDisplayData['contributors'];
  colors: ThemeColors;
  flex?: boolean;
  compact?: boolean;
}) {
  const s = createHomeStyles(colors);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    recovery: false,
    activity: false,
    bloodMarkers: false,
  });

  const contributorRows = [
    {
      id: 'recovery',
      label: 'Recovery',
      value: contributors.recovery.value,
      color: colors.recovery,
      icon: 'heart' as const,
      inputs: contributors.recovery.inputs,
    },
    {
      id: 'activity',
      label: 'Activity',
      value: contributors.activity.value,
      color: colors.activity,
      icon: 'activity' as const,
      inputs: contributors.activity.inputs,
    },
    {
      id: 'bloodMarkers',
      label: 'Test Results',
      value: contributors.bloodMarkers.value,
      color: colors.testResults,
      icon: 'flask' as const,
      inputs: contributors.bloodMarkers.inputs,
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      value: null,
      color: colors.disabled,
      icon: 'nutrition' as const,
      comingSoon: true,
    },
  ];

  return (
    <View style={[s.legendCard, flex && s.legendCardFlex]}>
      <View style={s.legendHeader}>
        <Text style={s.legendTitle}>Contributors</Text>
        <Text style={s.legendDetails}>Inputs</Text>
      </View>
      {contributorRows.map((row) => (
        <ContributorScoreRow
          key={row.id}
          label={row.label}
          value={row.value}
          color={row.color}
          icon={row.icon}
          comingSoon={row.comingSoon}
          colors={colors}
          compact={compact}
          inputs={row.inputs}
          expanded={!!expanded[row.id]}
          onToggle={row.inputs?.length ? () => setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] })) : undefined}
        />
      ))}
    </View>
  );
}

function ContributorScoreRow({
  label,
  value,
  color,
  icon,
  comingSoon,
  colors,
  compact,
  inputs,
  expanded,
  onToggle,
}: {
  label: string;
  value: number | null;
  color: string;
  icon: ContributorIconName;
  comingSoon?: boolean;
  colors: ThemeColors;
  compact?: boolean;
  inputs?: HomeDisplayData['contributors']['recovery']['inputs'];
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const s = createHomeStyles(colors);
  const disabled = !!comingSoon;
  const content = (
    <>
      <View
        style={[
          s.contributorIconBubble,
          compact && s.contributorIconBubbleCompact,
          disabled
            ? { borderColor: colors.borderSubtle, backgroundColor: colors.surfaceSoft }
            : { borderColor: `${color}66`, backgroundColor: `${color}14` },
        ]}
      >
        <ContributorIcon name={icon} color={disabled ? colors.disabled : color} />
      </View>
      <View style={s.contributorLabelBlock}>
        <Text
          style={[s.contributorScoreLabel, compact && s.contributorScoreLabelCompact, disabled && { color: colors.textMuted }]}
          numberOfLines={compact ? (comingSoon ? 1 : 2) : 1}
        >
          {label}
        </Text>
        {inputs?.length ? (
          <Text style={s.contributorHint}>{expanded ? 'Hide base inputs' : 'Show base inputs'}</Text>
        ) : null}
      </View>
      {comingSoon ? (
        <Text style={[s.contributorSoon, compact && s.contributorSoonCompact]}>Coming soon</Text>
      ) : (
        <View style={[s.contributorScoreValueBlock, compact && s.contributorScoreValueBlockCompact]}>
          <Text style={[s.contributorScoreValue, compact && s.contributorScoreValueCompact, { color }]}>{value === null ? '--' : `${clamp(value)}%`}</Text>
          <Text style={[s.contributorScoreState, compact && s.contributorScoreStateCompact]}>{statusFromValue(value)}</Text>
        </View>
      )}
      {inputs?.length ? (
        <Text style={[s.contributorArrow, compact && s.contributorArrowCompact]}>{expanded ? '⌃' : '⌄'}</Text>
      ) : null}
    </>
  );

  return (
    <View style={[s.contributorBlock, disabled && s.contributorBlockDisabled]}>
      {onToggle ? (
        <Pressable onPress={onToggle} style={[s.contributorScoreRow, compact && s.contributorScoreRowCompact]}>
          {content}
        </Pressable>
      ) : (
        <View style={[s.contributorScoreRow, compact && s.contributorScoreRowCompact]}>
          {content}
        </View>
      )}
      {expanded && inputs?.length ? (
        <View style={s.contributorInputsWrap}>
          {inputs.map((input) => {
            const inputColor = colorForKey(input.colorKey, colors, input.value);
            return (
              <View key={input.label} style={s.contributorInputRow}>
                <View style={[s.contributorInputDot, { backgroundColor: inputColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.contributorInputLabel}>{input.label}</Text>
                  {input.refContext ? (
                    <Text style={s.contributorInputRef}>{input.refContext}</Text>
                  ) : null}
                </View>
                <Text style={[s.contributorInputValue, { color: inputColor }]}>
                  {input.displayValue ?? (input.value === null ? '--' : `${clamp(input.value)}%`)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

type ContributorIconName = 'activity' | 'balance' | 'flask' | 'heart' | 'nutrition' | 'pulse' | 'shield';

function ContributorIcon({ name, color }: { name: ContributorIconName; color: string }) {
  if (name === 'heart') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Path d="M15 24 C10.4 20.2 6 16.4 6 11.7 C6 8.9 8 7 10.6 7 C12.4 7 13.8 8 15 9.5 C16.2 8 17.6 7 19.4 7 C22 7 24 8.9 24 11.7 C24 16.4 19.6 20.2 15 24 Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'activity') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Circle cx={18.4} cy={7.2} r={2.2} stroke={color} strokeWidth={2} fill="none" />
        <Path d="M12.2 13.6 L16.6 10.9 L20.2 12.9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M16.4 11.2 L14.2 18.1 L9.4 22.4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M18.2 13.1 L21.3 19.3 L25.4 21.1" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'flask') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Path d="M11 5 H19 M13 6 V13 L9.4 21 C8.6 23 10 25 12.2 25 H17.8 C20 25 21.4 23 20.6 21 L17 13 V6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M10.6 20 H19.4" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.75} />
      </Svg>
    );
  }
  if (name === 'nutrition') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Path d="M9.2 6.5 V13.8" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M7 6.5 V10.8 M11.4 6.5 V10.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M9.2 13.8 V23.2" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M18.8 6.5 V13.3 C18.8 14.8 20 16 21.5 16 V23.2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'pulse') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Path d="M5 16 H10 L12.4 11 L16.2 21 L19 15.8 H25" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M8 13 C7.5 8.6 11.7 7 15 10.8 C18.3 7 22.5 8.6 22 13" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
    );
  }
  if (name === 'shield') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M12 3 L19 6 V11 C19 15.4 16.2 18.6 12 21 C7.8 18.6 5 15.4 5 11 V6 L12 3 Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M9 12 L11.2 14.2 L15.5 9.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <Path d="M7 16 C12 15 14 11 14 6 C19 8 23 12 23 18 C23 22 19.8 25 15 25 C10.2 25 7 22 7 18 Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M10 17 C13 19 17 18.5 20 15" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </Svg>
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
      {metric.chartType === 'line' ? (
        <InteractiveTrendChartV2
          colors={colors}
          height={106}
          showYAxis={false}
          series={[{ key: metric.key, label: metric.label, color, data: metric.data }]}
        />
      ) : (
        <QuietBarChartV2 colors={colors} data={metric.data} color={color} height={106} />
      )}
    </View>
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

const NEXT_INTEGRATIONS: { label: string; icon: HomeHealthInputIcon; description: string }[] = [
  { label: 'Nutrition', icon: 'nutrition', description: 'Dietary intake and macro tracking' },
  { label: 'Mental Health', icon: 'dna', description: 'Mood, stress, and cognitive signals' },
  { label: 'DNA Insights', icon: 'dna', description: 'Genetic predispositions and traits' },
  { label: 'Stool Analysis', icon: 'stool', description: 'Gut microbiome and digestive health' },
  { label: 'Urine Analysis', icon: 'urine', description: 'Metabolic and kidney health markers' },
];

function NextIntegrations({ colors }: { colors: ThemeColors }) {
  const s = createHomeStyles(colors);
  return (
    <View style={s.nextIntegrationsSection}>
      <View style={s.nextIntegrationsHeader}>
        <Text style={s.nextIntegrationsTitle}>Next Integrations</Text>
        <Text style={s.nextIntegrationsSubtitle}>Premium data sources in development</Text>
      </View>
      {NEXT_INTEGRATIONS.map((item) => (
        <View key={item.label} style={s.nextIntegrationCard}>
          <View style={s.nextIntegrationIcon}>
            <HealthInputGlyph name={item.icon} color={colors.disabled} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nextIntegrationLabel}>{item.label}</Text>
            <Text style={s.nextIntegrationDescription}>{item.description}</Text>
          </View>
          <View style={s.nextIntegrationBar}>
            <View style={s.nextIntegrationBarFill} />
          </View>
          <View style={s.comingSoonPill}>
            <Text style={s.comingSoonText}>Coming soon</Text>
          </View>
        </View>
      ))}
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
        <Path d="M9 4.5 V10.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M7 4.5 V8.2 M11 4.5 V8.2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        <Path d="M9 10.6 V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M15.4 4.5 V10.4 C15.4 11.7 16.5 12.8 17.8 12.8 V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.lg,
      shadowColor: '#0B1C12',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 22,
      elevation: 3,
    },
    scoreTopRow: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      flexWrap: 'wrap',
    },
    modeCluster: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    modeToggle: {
      minHeight: 34,
      flexDirection: 'row',
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surfaceSoft,
      padding: 2,
      minWidth: 146,
    },
    modeButton: {
      flex: 1,
      minHeight: 28,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    modeButtonActive: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.brandGreen}33`,
    },
    modeButtonText: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '700',
    },
    modeButtonTextActive: {
      color: colors.brandGreenDark,
      fontWeight: '800',
    },
    balancePill: {
      minHeight: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.brandGreenSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.brandGreen}22`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    balanceTitle: {
      color: colors.brandGreenDark,
      fontSize: typography.bodySmall,
      lineHeight: 17,
      fontWeight: '800',
    },
    balanceSub: {
      color: colors.text,
      fontSize: typography.caption,
      lineHeight: 14,
      fontWeight: '600',
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
      gap: spacing.lg,
    },
    scoreBodyRowCompactWide: {
      gap: spacing.sm,
    },
    scoreRingWrap: {
      width: SCORE_RING_SIZE,
      minHeight: SCORE_RING_SIZE + 76,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    scoreRingCenter: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 52,
    },
    scoreValue: {
      fontSize: 56,
      lineHeight: 62,
      fontWeight: '900',
      letterSpacing: 0,
    },
    scoreLabel: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: 0,
    },
    scoreStatusLine: {
      color: colors.brandGreenDark,
      fontSize: typography.bodySmall,
      lineHeight: 22,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    scoreBasisRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    scoreBasisIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.brandGreenSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreBasisText: {
      flex: 1,
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '600',
    },
    scoreTrendCard: {
      alignSelf: 'stretch',
      borderRadius: radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      padding: spacing.lg,
      gap: spacing.md,
      shadowColor: '#0B1C12',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
      elevation: 2,
    },
    scoreTrendHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    scoreTrendTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
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
      justifyContent: 'space-between',
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
    scoreTrendAxisText: {
      flex: 1,
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '600',
      textAlign: 'center',
    },
    scoreLegendPill: {
      minHeight: 34,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    contributorBlock: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    contributorBlockDisabled: {
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      borderStyle: 'dashed',
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: spacing.sm,
    },
    legendCard: {
      alignSelf: 'stretch',
      backgroundColor: 'transparent',
      paddingVertical: spacing.xs,
      gap: 0,
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
    legendHeader: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
      marginBottom: spacing.xs,
    },
    legendTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
    },
    legendDetails: {
      color: colors.textSubtle,
      fontSize: typography.bodySmall,
      fontWeight: '600',
    },
    contributorScoreRow: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    contributorScoreRowCompact: {
      minHeight: 62,
      gap: spacing.xs,
    },
    contributorIconBubble: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contributorIconBubbleCompact: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    contributorLabelBlock: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    contributorScoreLabel: {
      color: colors.text,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      fontWeight: '700',
    },
    contributorHint: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: 13,
      fontWeight: '700',
    },
    contributorScoreLabelCompact: {
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '800',
    },
    contributorScoreValueBlock: {
      alignItems: 'flex-end',
      minWidth: 52,
    },
    contributorScoreValueBlockCompact: {
      minWidth: 38,
    },
    contributorScoreValue: {
      fontSize: typography.subtitle,
      lineHeight: 20,
      fontWeight: '800',
    },
    contributorScoreValueCompact: {
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    contributorScoreState: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '600',
    },
    contributorScoreStateCompact: {
      fontSize: typography.micro,
      lineHeight: 13,
    },
    contributorSoon: {
      color: colors.disabled,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '800',
      minWidth: 82,
      textAlign: 'right',
    },
    contributorSoonCompact: {
      fontSize: typography.micro,
      lineHeight: 13,
      minWidth: 54,
    },
    contributorArrow: {
      color: colors.textSubtle,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '700',
    },
    contributorArrowCompact: {
      fontSize: 16,
      lineHeight: 18,
    },
    contributorInputsWrap: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    contributorInputRow: {
      minHeight: 34,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    contributorInputDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    contributorInputLabel: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '700',
    },
    contributorInputRef: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: 14,
      fontWeight: '500',
    },
    contributorInputValue: {
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '800',
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
      opacity: 0.9,
      backgroundColor: colors.surfaceSoft,
      borderColor: colors.borderSubtle,
      borderStyle: 'dashed',
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
      backgroundColor: colors.surface,
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
      color: colors.disabled,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      fontWeight: '800',
    },
    nextIntegrationsSection: {
      gap: spacing.sm,
    },
    nextIntegrationsHeader: {
      gap: 2,
      paddingHorizontal: spacing.xs,
    },
    nextIntegrationsTitle: {
      fontSize: typography.subtitle,
      fontWeight: '800',
      color: colors.textSubtle,
    },
    nextIntegrationsSubtitle: {
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '600',
      color: colors.textSubtle,
    },
    nextIntegrationCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      borderStyle: 'dashed',
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      opacity: 0.7,
    },
    nextIntegrationIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.surface,
    },
    nextIntegrationLabel: {
      fontSize: typography.bodySmall,
      fontWeight: '800',
      color: colors.textSubtle,
    },
    nextIntegrationDescription: {
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      fontWeight: '500',
      color: colors.disabled,
    },
    nextIntegrationBar: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderSubtle,
      overflow: 'hidden' as const,
    },
    nextIntegrationBarFill: {
      width: 0,
      height: 4,
      backgroundColor: colors.disabled,
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
