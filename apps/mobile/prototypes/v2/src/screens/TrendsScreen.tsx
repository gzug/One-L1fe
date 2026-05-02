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
import type { HomeDisplayData, HomeTrendMetric } from '../data/homeTypes';
import type { HomeChartPoint } from '../data/homeTypes';

// ---------------------------------------------------------------------------
// Minimal inline SVG-free chart primitives (bar + line) reusing RN only
// ---------------------------------------------------------------------------

const CHART_H = 72;
const BAR_MIN_H = 3;

function normalize(points: HomeChartPoint[]): number[] {
  if (!points.length) return [];
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
}

function BarChart({
  data,
  color,
}: {
  data: HomeChartPoint[];
  color: string;
}) {
  const ratios = normalize(data);
  return (
    <View style={chart.root}>
      {ratios.map((ratio, i) => (
        <View key={i} style={chart.barWrap}>
          <View
            style={[
              chart.bar,
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

function LineChart({
  data,
  color,
}: {
  data: HomeChartPoint[];
  color: string;
}) {
  // Render as connected dots via thin bars for RN-only compatibility
  const ratios = normalize(data);
  return (
    <View style={chart.root}>
      {ratios.map((ratio, i) => (
        <View key={i} style={chart.lineWrap}>
          <View style={{ flex: 1 }} />
          <View
            style={[
              chart.lineDot,
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

const chart = StyleSheet.create({
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
        card.root,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={card.header}>
        <Text style={[card.label, { color: colors.textSubtle }]}>{metric.label}</Text>
        {metric.value ? (
          <View style={card.valueRow}>
            <Text style={[card.value, { color: colors.text }]}>{metric.value}</Text>
            {metric.delta !== null && (
              <Text
                style={[
                  card.delta,
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
        <View style={card.empty}>
          <Text style={[card.emptyText, { color: colors.textSubtle }]}>
            {metric.emptyText || 'No data available.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const card = StyleSheet.create({
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

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[section.title, { color: colors.textSubtle }]}>{title}</Text>
  );
}

const section = StyleSheet.create({
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

// ---------------------------------------------------------------------------
// Score trend row (full-width line chart)
// ---------------------------------------------------------------------------

function ScoreTrendSection({ data }: { data: HomeDisplayData }) {
  const { colors } = useTheme();
  const trend = data.scoreTrend;

  if (trend.isEmpty || !trend.series.length) {
    return (
      <View
        style={[
          scoreTrend.emptyCard,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <Text style={[scoreTrend.emptyText, { color: colors.textSubtle }]}>
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
        scoreTrend.card,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={scoreTrend.header}>
        <Text style={[scoreTrend.label, { color: colors.textSubtle }]}>One L1fe Score</Text>
        <Text style={[scoreTrend.value, { color: colors.text }]}>
          {data.score.overall !== null ? `${data.score.overall}` : '—'}
        </Text>
      </View>
      <LineChart data={scoreSeries.data} color={colors.scoreStrong} />
      <View style={scoreTrend.legend}>
        {trend.series.map((s) => (
          <Text key={s.label} style={[scoreTrend.legendItem, { color: colors.textSubtle }]}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const scoreTrend = StyleSheet.create({
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

// ---------------------------------------------------------------------------
// TrendsScreen
// ---------------------------------------------------------------------------

export function TrendsScreen({ data }: { data: HomeDisplayData }) {
  const { colors } = useTheme();
  const rec = data.recoveryMetrics;
  const act = data.activityMetrics;

  const accentRecover = colors.scoreStrong;
  const accentActivity = colors.accent ?? colors.scoreStrong;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={trends.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Page title */}
      <View style={[trends.pageHeader, { borderBottomColor: colors.borderSubtle }]}>
        <Text style={[trends.pageTitle, { color: colors.text }]}>Trends</Text>
        <Text style={[trends.pageMode, { color: colors.textSubtle }]}>
          {data.isDemo ? 'Demo' : 'User Data'}
        </Text>
      </View>

      {/* Score */}
      <SectionHeader title="Score" />
      <ScoreTrendSection data={data} />

      {/* Recovery */}
      <SectionHeader title="Recovery" />
      <View style={trends.grid}>
        <MetricCard metric={rec.recovery} accentColor={accentRecover} />
        <MetricCard metric={rec.sleep}    accentColor={accentRecover} />
        <MetricCard metric={rec.hrv}      accentColor={accentRecover} />
        <MetricCard metric={rec.restingHr} accentColor={accentRecover} />
      </View>

      {/* Activity */}
      <SectionHeader title="Activity" />
      <View style={trends.grid}>
        <MetricCard metric={act.activity} accentColor={accentActivity} />
        <MetricCard metric={act.steps}    accentColor={accentActivity} />
        <MetricCard metric={act.training} accentColor={accentActivity} />
        <MetricCard metric={act.calories} accentColor={accentActivity} />
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}
