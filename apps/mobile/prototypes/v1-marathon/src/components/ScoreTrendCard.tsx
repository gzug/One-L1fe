/**
 * ScoreTrendCard — F12
 *
 * Period selector is now controlled (props), shared with ReadinessOrbit.
 * Chart + legend remain unchanged.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import {
  scoreTrend7D,
  scoreTrend30D,
  scoreTrend90D,
  scoreTrendMax,
} from '../data/demoData';
import type { Period, ScoreTrendDay } from '../data/demoData';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const PERIODS: Period[] = ['7D', '30D', '90D', 'Max'];

const DATA: Record<Period, ScoreTrendDay[]> = {
  '7D':  scoreTrend7D,
  '30D': scoreTrend30D,
  '90D': scoreTrend90D,
  'Max': scoreTrendMax,
};

const CHART_H   = 80;
const CHART_PAD = 8;
const DOT_R     = 3;

function toPoints(data: ScoreTrendDay[], key: 'score' | 'recovery' | 'trainingLoad', w: number): string {
  if (data.length < 2) return '';
  const step = w / (data.length - 1);
  return data
    .map((d, i) => {
      const x = i * step;
      const y = CHART_H - CHART_PAD - ((d[key] / 100) * (CHART_H - CHART_PAD * 2));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function lastPoint(data: ScoreTrendDay[], key: 'score' | 'recovery' | 'trainingLoad', w: number) {
  if (!data.length) return null;
  const step = w / Math.max(data.length - 1, 1);
  const i = data.length - 1;
  const x = i * step;
  const y = CHART_H - CHART_PAD - ((data[i][key] / 100) * (CHART_H - CHART_PAD * 2));
  return { x, y };
}

type Props = {
  period: Period;
  onPeriodChange: (p: Period) => void;
};

export function ScoreTrendCard({ period, onPeriodChange }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const data = DATA[period];

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Text style={s.title}>One L1fe Score Trend</Text>
          <Text style={s.sub}>Demo trend · local prototype</Text>
        </View>
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => onPeriodChange(p)}
              style={[
                s.periodBtn,
                period === p && { backgroundColor: colors.accent },
              ]}
              accessibilityLabel={`Show ${p} trend`}
            >
              <Text style={[
                s.periodLabel,
                { color: period === p ? '#FFFFFF' : colors.textSubtle },
              ]}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* SVG chart */}
      <View style={s.chartWrapper}>
        <View style={{ height: CHART_H }}>
          <ChartLines data={data} colors={colors} />
        </View>
        <View style={s.xLabels}>
          {data.map((d, i) => (
            <Text
              key={i}
              style={[
                s.xLabel,
                i === 0
                  ? { textAlign: 'left' }
                  : i === data.length - 1
                  ? { textAlign: 'right' }
                  : { textAlign: 'center' },
              ]}
            >
              {d.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={s.legendRow}>
        <LegendDot color={colors.accent} label="Score" />
        <LegendDot color={colors.positive} label="Recovery" />
        <LegendDot color={colors.warning} label="Training Load" />
        <View style={s.bioChip}>
          <Text style={[s.bioChipText, { color: colors.textSubtle }]}>
            Biomarkers 61% · latest panel
          </Text>
        </View>
      </View>
    </View>
  );
}

function ChartLines({ data, colors }: { data: ScoreTrendDay[]; colors: ThemeColors }) {
  const W = 320;
  const scorePoints    = toPoints(data, 'score', W);
  const recoveryPoints = toPoints(data, 'recovery', W);
  const trainPoints    = toPoints(data, 'trainingLoad', W);
  const lastScore      = lastPoint(data, 'score', W);

  const gridYs = [25, 50, 75].map(
    (v) => CHART_H - CHART_PAD - (v / 100) * (CHART_H - CHART_PAD * 2),
  );

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${W} ${CHART_H}`} preserveAspectRatio="none">
      {gridYs.map((y, i) => (
        <Line key={i} x1={0} y1={y} x2={W} y2={y} stroke={colors.borderSubtle} strokeWidth={0.8} />
      ))}
      {data.length >= 2 && (
        <Polyline points={recoveryPoints} fill="none" stroke={colors.positive}
          strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="4 3" />
      )}
      {data.length >= 2 && (
        <Polyline points={trainPoints} fill="none" stroke={colors.warning}
          strokeWidth={1.5} strokeOpacity={0.55} strokeDasharray="4 3" />
      )}
      {data.length >= 2 && (
        <Polyline points={scorePoints} fill="none" stroke={colors.accent}
          strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {lastScore && (
        <Circle cx={lastScore.x} cy={lastScore.y} r={DOT_R} fill={colors.accent} />
      )}
    </Svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={legendStyles.row}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={[legendStyles.label, { color: colors.textSubtle }]}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 10, fontWeight: '500' },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    headerLeft: { gap: 2, flex: 1 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    sub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
    },
    periodRow: { flexDirection: 'row', gap: 4 },
    periodBtn: {
      borderRadius: radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'transparent',
    },
    periodLabel: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    chartWrapper: { gap: 2 },
    xLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    xLabel: {
      flex: 1,
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center',
    },
    bioChip: {
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      backgroundColor: colors.surface,
    },
    bioChipText: {
      fontSize: typography.micro,
      fontWeight: '500',
    },
  });
}
