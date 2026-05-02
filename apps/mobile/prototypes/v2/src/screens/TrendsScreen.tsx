/**
 * TrendsScreen — v2 MVP
 *
 * Renders trend charts for Score, Recovery, and Activity using existing
 * HomeDisplayData from getHomeDisplayData. No new data sources.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { HomeDisplayData, HomeTrendMetric, HomeChartPoint } from '../data/homeTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_H = 72;
const BAR_MIN_H = 3;

// ---------------------------------------------------------------------------
// Chart helpers
// ---------------------------------------------------------------------------

function normalize(points: HomeChartPoint[]): number[] {
  if (!points.length) return [];
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
}

function BarChart({ data, color }: { data: HomeChartPoint[]; color: string }) {
  const ratios = normalize(data);
  return (
    <View style={chartStyles.root}>
      {ratios.map((ratio, i) => (
        <View key={i} style={chartStyles.barWrap}>
          <View
            style={[
              chartStyles.bar,
              {
                height: Math.max(BAR_MIN_H, ratio * CHART_H),
                backgroundColor: color,
                opacity: 0.72 + ratio * 0.28,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function LineChart({ data, color }: { data: HomeChartPoint[]; color: string }) {
  const ratios = normalize(data);
  return (
    <View style={chartStyles.root}>
      {ratios.map((ratio, i) => (
        <View key={i} style={chartStyles.lineWrap}>
          <View style={{ flex: 1 }} />
          <View
            style={[
              chartStyles.lineDot,
              {
                marginBottom: ratio * (CHART_H - 8),
                backgroundColor: color,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  root: {
    height: CHART_H,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  barWrap: {
    flex: 1,
    height: CHART_H,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
    minHeight: BAR_MIN_H,
  },
  lineWrap: {
    flex: 1,
    height: CHART_H,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

function MetricCard({
  metric,
  accentColor,
}: {
  metric: HomeTrendMetric;
  accentColor: string;
}) {
  const { colors } = useTheme();
  const hasData = metric.data.length > 0;

  return (
    <View
      style={[
        cardStyles.root,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={cardStyles.header}>
        <Text style={[cardStyles.label, { color: colors.textSubtle }]}>{metric.label}</Text>
        {metric.value ? (
          <View style={cardStyles.valueRow}>
            <Text style={[cardStyles.value, { color: colors.text }]}>{metric.value}</Text>
            {metric.delta !== null && (
              <Text
                style={[
                  cardStyles.delta,
                  { color: metric.delta >= 0 ? colors.scoreStrong : colors.textSubtle },
                ]}
              >
                {metric.delta >= 0 ? `+${metric.delta}` : `${metric.delta}`}
              </Text>
            )}
          </View>
        ) : null}
      </View>

      {hasData ? (
        metric.chartType === 'bar' ? (
          <BarChart data={metric.data} color={accentColor} />
        ) : (
          <LineChart data={metric.data} color={accentColor} />
        )
      ) : (
        <View style={cardStyles.empty}>
          <Text style={[cardStyles.emptyText, { color: colors.textSubtle }]}>
            {metric.emptyText || 'No data available.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  delta: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  empty: {
    height: CHART_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    textAlign: 'center',
  },
});

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
});

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[sectionStyles.title, { color: colors.textSubtle }]}>{title}</Text>
  );
}

// ---------------------------------------------------------------------------
// Score trend section
// ---------------------------------------------------------------------------

const scoreTrendStyles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPaddingH,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: layout.screenPaddingH,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: CHART_H + spacing.md * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    fontSize: typography.micro,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    textAlign: 'center',
  },
});

function ScoreTrendSection({ data }: { data: HomeDisplayData }) {
  const { colors } = useTheme();
  const trend = data.scoreTrend;

  if (trend.isEmpty || !trend.series.length) {
    return (
      <View
        style={[
          scoreTrendStyles.emptyCard,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <Text style={[scoreTrendStyles.emptyText, { color: colors.textSubtle }]}>
          {trend.emptyText || 'No score trend available yet.'}
        </Text>
      </View>
    );
  }

  const scoreSeries = trend.series.find((s) => s.label === 'Score');
  if (!scoreSeries || !scoreSeries.data.length) return null;

  return (
    <View
      style={[
        scoreTrendStyles.card,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={scoreTrendStyles.header}>
        <Text style={[scoreTrendStyles.label, { color: colors.textSubtle }]}>One L1fe Score</Text>
        <Text style={[scoreTrendStyles.value, { color: colors.text }]}>
          {data.score.overall !== null ? `${data.score.overall}` : '—'}
        </Text>
      </View>
      <LineChart data={scoreSeries.data} color={colors.brandGreen} />
      <View style={scoreTrendStyles.legend}>
        {trend.series.map((s) => (
          <Text key={s.label} style={[scoreTrendStyles.legendItem, { color: colors.textSubtle }]}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Page-level styles
// ---------------------------------------------------------------------------

const trendsStyles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  grid: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.sm,
  },
});

// ---------------------------------------------------------------------------
// TrendsScreen
// ---------------------------------------------------------------------------

export function TrendsScreen({ data }: { data: HomeDisplayData }) {
  const { colors } = useTheme();
  const rec = data.recoveryMetrics;
  const act = data.activityMetrics;

  const accentRecover = colors.recovery;
  const accentActivity = colors.activity;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={trendsStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Score */}
      <SectionHeader title="Score" />
      <ScoreTrendSection data={data} />

      {/* Recovery */}
      <SectionHeader title="Recovery" />
      <View style={trendsStyles.grid}>
        <MetricCard metric={rec.recovery}  accentColor={accentRecover} />
        <MetricCard metric={rec.sleep}     accentColor={accentRecover} />
        <MetricCard metric={rec.hrv}       accentColor={accentRecover} />
        <MetricCard metric={rec.restingHr} accentColor={accentRecover} />
      </View>

      {/* Activity */}
      <SectionHeader title="Activity" />
      <View style={trendsStyles.grid}>
        <MetricCard metric={act.activity}  accentColor={accentActivity} />
        <MetricCard metric={act.steps}     accentColor={accentActivity} />
        <MetricCard metric={act.training}  accentColor={accentActivity} />
        <MetricCard metric={act.calories}  accentColor={accentActivity} />
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}
