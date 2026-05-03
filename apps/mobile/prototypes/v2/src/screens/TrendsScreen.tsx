import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InteractiveTrendChartV2, QuietBarChartV2 } from '../components/InteractiveTrendChartV2';
import type { HomeDisplayData, HomeTrendMetric } from '../data/homeTypes';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';

function MetricSurface({
  metric,
  color,
}: {
  metric: HomeTrendMetric;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricHeading}>
          <Text style={[styles.metricLabel, { color: colors.text }]}>{metric.label}</Text>
          <Text style={[styles.metricCaption, { color: colors.textSubtle }]}>{metric.subtitle}</Text>
        </View>
        <View style={styles.metricValueWrap}>
          <Text style={[styles.metricValue, { color }]}>{metric.value}</Text>
          <Text style={[styles.metricDelta, { color: colors.textSubtle }]}>
            {metric.delta === null ? 'Current range' : metric.delta >= 0 ? `+${metric.delta} vs previous` : `${metric.delta} vs previous`}
          </Text>
        </View>
      </View>
      {metric.data.length ? (
        metric.chartType === 'line' ? (
          <InteractiveTrendChartV2
            colors={colors}
            height={108}
            showYAxis={false}
            series={[{ key: metric.key, label: metric.label, color, data: metric.data }]}
          />
        ) : (
          <QuietBarChartV2 colors={colors} data={metric.data} color={color} height={108} />
        )
      ) : (
        <View style={[styles.metricEmpty, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.metricEmptyText, { color: colors.textSubtle }]}>{metric.emptyText}</Text>
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSubtle }]}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

export function TrendsScreen({ data }: { data: HomeDisplayData }) {
  const { colors } = useTheme();
  const trend = data.scoreTrend;
  const scoreSeries = trend.series[0]?.data ?? [];
  const recoverySeries = trend.series[1]?.data ?? [];
  const activitySeries = trend.series[2]?.data ?? [];

  const [visible, setVisible] = useState({ score: true, recovery: true, activity: true });
  function toggleSeries(key: 'score' | 'recovery' | 'activity') {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.container}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroHeading}>
              <Text style={[styles.heroEyebrow, { color: colors.brandGreen }]}>Trends</Text>
              <Text style={[styles.heroTitle, { color: colors.text, fontFamily: 'BrandDisplay' }]}>Health rhythm</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Cleaner charts, direct touch inspection, and a clearer read on how score, recovery, and activity move together.
              </Text>
            </View>
            <View style={[styles.heroScoreCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.heroScoreLabel, { color: colors.textSubtle }]}>Current score</Text>
              <Text style={[styles.heroScoreValue, { color: colors.brandGreen, fontFamily: 'BrandDisplay' }]}>
                {data.score.overall !== null ? `${data.score.overall}%` : '--'}
              </Text>
            </View>
          </View>

        </View>

        <Section title="Score" subtitle="Tap anywhere in the chart to inspect that point in time.">
          <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <InteractiveTrendChartV2
              colors={colors}
              height={176}
              yMin={0}
              yMax={100}
              yTicks={[100, 80, 60, 40, 20, 0]}
              showYAxis={false}
              series={[
                ...(visible.score ? [{ key: 'score', label: 'Score', color: colors.brandGreen, data: scoreSeries, style: 'area' as const }] : []),
                ...(visible.recovery ? [{ key: 'recovery', label: 'Recovery', color: colors.recovery, data: recoverySeries }] : []),
                ...(visible.activity ? [{ key: 'activity', label: 'Activity', color: colors.activity, data: activitySeries, style: 'dashed' as const }] : []),
              ]}
            />
            <View style={styles.legendRow}>
              {([
                { key: 'score' as const, label: 'Score', color: colors.brandGreen },
                { key: 'recovery' as const, label: 'Recovery', color: colors.recovery },
                { key: 'activity' as const, label: 'Activity', color: colors.activity },
              ]).map((item) => {
                const on = visible[item.key];
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => toggleSeries(item.key)}
                    style={({ pressed }) => [
                      styles.legendPill,
                      {
                        backgroundColor: on ? colors.brandGreenSoft : colors.surfaceSoft,
                        borderColor: on ? colors.accentBorder : colors.borderSubtle,
                        opacity: pressed ? 0.72 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.legendDot, { backgroundColor: on ? item.color : colors.textSubtle }]} />
                    <Text style={[styles.legendText, { color: on ? colors.text : colors.textSubtle }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
              <View style={[styles.legendPill, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}>
                <View style={[styles.legendDot, { backgroundColor: colors.testResults }]} />
                <Text style={[styles.legendText, { color: colors.textSubtle }]}>Test Results</Text>
              </View>
              <View style={[styles.legendPill, { backgroundColor: colors.surfaceSoft, borderColor: colors.borderSubtle }]}>
                <View style={[styles.legendDot, { backgroundColor: colors.disabled }]} />
                <Text style={[styles.legendText, { color: colors.textSubtle }]}>Nutrition</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section title="Recovery" subtitle="Signals that shape your recovery contributor.">
          <View style={styles.metricGrid}>
            <MetricSurface metric={data.recoveryMetrics.recovery} color={colors.recovery} />
            <MetricSurface metric={data.recoveryMetrics.sleep} color={colors.recoverySub1} />
            <MetricSurface metric={data.recoveryMetrics.hrv} color={colors.recoverySub2} />
            <MetricSurface metric={data.recoveryMetrics.restingHr} color={colors.recoverySub3} />
          </View>
        </Section>

        <Section title="Activity" subtitle="Movement and training context in the same visual system.">
          <View style={styles.metricGrid}>
            <MetricSurface metric={data.activityMetrics.activity} color={colors.activity} />
            <MetricSurface metric={data.activityMetrics.steps} color={colors.activitySub1} />
            <MetricSurface metric={data.activityMetrics.training} color={colors.activitySub2} />
            <MetricSurface metric={data.activityMetrics.calories} color={colors.activitySub3} />
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: 108,
  },
  container: {
    width: '100%',
    maxWidth: layout.maxWidth,
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.xl,
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  heroHeading: {
    flex: 1,
    gap: spacing.xs,
  },
  heroEyebrow: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '600',
  },
  heroScoreCard: {
    minWidth: 106,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
    alignItems: 'flex-end',
  },
  heroScoreLabel: {
    fontSize: typography.micro,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroScoreValue: {
    fontSize: 32,
    lineHeight: 36,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
  },
  scoreCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendPill: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.micro,
    lineHeight: 14,
    fontWeight: '800',
  },
  metricGrid: {
    gap: spacing.sm,
  },
  metricCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  metricHeading: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metricLabel: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '800',
  },
  metricCaption: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
  },
  metricValueWrap: {
    alignItems: 'flex-end',
    maxWidth: 132,
  },
  metricValue: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    textAlign: 'right',
  },
  metricDelta: {
    fontSize: typography.micro,
    lineHeight: 14,
    textAlign: 'right',
  },
  metricEmpty: {
    minHeight: 110,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  metricEmptyText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
});
