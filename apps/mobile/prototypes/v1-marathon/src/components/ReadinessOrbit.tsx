/**
 * ReadinessOrbit — F12 patch
 *
 * Training Load delta uses loadDeltaColor:
 *   higher load → amber (colors.warning)  — not "good"
 *   lower load  → muted (colors.textSubtle) — not "bad"
 *   zero        → muted
 * Label suffix: "load" appended (reads "+4 load", not "+4")
 *
 * Recovery and Score deltas retain positive/danger semantics.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  dataCoveragePercent,
  readinessSegments,
  scoreDeltas,
} from '../data/demoData';
import type { Period } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const PERIODS: Period[] = ['7D', '30D', '90D', 'Max'];

const RING_SIZE     = 96;
const STROKE_W      = 8;
const HALF          = RING_SIZE / 2;
const R             = HALF - STROKE_W / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function thresholdColor(value: number, colors: ThemeColors): string {
  if (value >= 75) return colors.positive;
  if (value >= 50) return colors.warning;
  return colors.danger;
}

/** Delta display string with sign. */
function formatDelta(d: number): string {
  if (d === 0) return '±0';
  return d > 0 ? `+${d}` : `${d}`;
}

/**
 * Recovery / Score / Biomarkers / Data coverage delta color.
 * Higher = positive (green), lower = danger (red), zero = muted.
 */
function deltaColor(d: number, colors: ThemeColors): string {
  if (d > 0) return colors.positive;
  if (d < 0) return colors.danger;
  return colors.textSubtle;
}

/**
 * Training Load delta color.
 * Load is not a good/bad signal — it's contextual.
 * Higher load = amber (informational, not alarming).
 * Lower load = muted.
 * Zero = muted.
 */
function loadDeltaColor(d: number, colors: ThemeColors): string {
  if (d > 0) return colors.warning;    // amber — load went up
  return colors.textSubtle;            // muted — lower or unchanged
}

function SvgRing({
  progress,
  trackColor,
  progressColor,
}: {
  progress: number;
  trackColor: string;
  progressColor: string;
}) {
  const pct    = clamp(progress) / 100;
  const filled = pct * CIRCUMFERENCE;
  const gap    = CIRCUMFERENCE - filled;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle cx={HALF} cy={HALF} r={R} stroke={trackColor} strokeWidth={STROKE_W} fill="none" />
      <Circle
        cx={HALF} cy={HALF} r={R}
        stroke={progressColor}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${filled} ${gap}`}
        rotation={-90}
        origin={`${HALF}, ${HALF}`}
      />
    </Svg>
  );
}

type Props = {
  period: Period;
  onPeriodChange: (p: Period) => void;
};

export function ReadinessOrbit({ period, onPeriodChange }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const average = clamp(
    readinessSegments.reduce((sum, seg) => sum + seg.value, 0) / readinessSegments.length,
  );
  const ringColor  = thresholdColor(average, colors);
  const deltas     = scoreDeltas[period];
  const scoreDelta = deltas.score;

  return (
    <View style={s.card}>
      {/* Title row + period selector */}
      <View style={s.titleRow}>
        <View style={s.titleLeft}>
          <Text style={s.interpretation}>{prototypeCopy.readinessInterpretation}</Text>
          <Text style={s.interpretationSub}>{prototypeCopy.readinessInterpretationSub}</Text>
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
              accessibilityLabel={`Show ${p} period`}
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

      {/* Ring + segment rows */}
      <View style={s.bodyRow}>
        {/* Ring: score + score delta */}
        <View style={s.ringWrapper}>
          <SvgRing
            progress={average}
            trackColor={colors.ringTrack}
            progressColor={ringColor}
          />
          <View style={[StyleSheet.absoluteFillObject, s.ringCenter]} pointerEvents="none">
            <Text style={[s.score, { color: ringColor }]}>{average}%</Text>
            {scoreDelta !== null && (
              <Text style={[s.scoreDelta, { color: deltaColor(scoreDelta, colors) }]}>
                {formatDelta(scoreDelta)}
              </Text>
            )}
            <Text style={s.scoreLabel}>{prototypeCopy.readinessScoreLabel}</Text>
          </View>
        </View>

        {/* Segment rows */}
        <View style={s.segmentList}>
          {readinessSegments.map((seg) => {
            const isLoadRow = seg.label === 'Training load';
            const color     = thresholdColor(seg.value, colors);

            let rawDelta: number | null = null;
            if (seg.label === 'Recovery')      rawDelta = deltas.recovery;
            if (seg.label === 'Training load') rawDelta = deltas.trainingLoad;
            if (seg.label === 'Biomarkers')    rawDelta = deltas.biomarkers;

            // Training Load uses neutral color logic; others use positive/danger
            const dc = rawDelta !== null
              ? (isLoadRow
                  ? loadDeltaColor(rawDelta, colors)
                  : deltaColor(rawDelta, colors))
              : colors.textSubtle;

            // Training Load delta label: "+4 load" not "+4"
            const deltaStr = rawDelta !== null
              ? (isLoadRow
                  ? `${formatDelta(rawDelta)} load`
                  : formatDelta(rawDelta))
              : null;

            return (
              <View key={seg.label} style={s.segmentRow}>
                <View style={s.segmentLabelRow}>
                  <Text style={s.segmentLabel}>{seg.label}</Text>
                  <View style={s.segmentRight}>
                    <Text style={[s.segmentVal, { color }]}>{seg.value}%</Text>
                    {deltaStr !== null && (
                      <Text style={[s.segmentDelta, { color: dc }]}>
                        {deltaStr}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      { width: `${clamp(seg.value)}%` as `${number}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            );
          })}

          {/* Data coverage row */}
          <View style={s.coverageRow}>
            <Text style={s.coverageLabel}>{prototypeCopy.dataCoverageLabel}</Text>
            <View style={s.segmentRight}>
              <Text style={s.coverageVal}>{dataCoveragePercent}%</Text>
              {deltas.dataCoverage !== null && (
                <Text style={[
                  s.segmentDelta,
                  { color: deltaColor(deltas.dataCoverage, colors) },
                ]}>
                  {formatDelta(deltas.dataCoverage)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Period context note */}
      <Text style={s.periodNote}>vs previous period · demo data</Text>
    </View>
  );
}

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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    titleLeft: { flex: 1, gap: 3 },
    interpretation: {
      color: colors.text,
      fontSize: typography.heroInterpretation,
      fontWeight: '700',
      lineHeight: lineHeights.heroInterpretation,
      letterSpacing: -0.4,
    },
    interpretationSub: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    periodRow: {
      flexDirection: 'row',
      gap: 3,
      flexShrink: 0,
      marginTop: 2,
    },
    periodBtn: {
      borderRadius: radius.pill,
      paddingHorizontal: 7,
      paddingVertical: 4,
      backgroundColor: 'transparent',
    },
    periodLabel: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    bodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    ringWrapper: { width: RING_SIZE, height: RING_SIZE, flexShrink: 0 },
    ringCenter: { alignItems: 'center', justifyContent: 'center', gap: 0 },
    score: {
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 26,
      textAlign: 'center',
    },
    scoreDelta: {
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 13,
    },
    scoreLabel: {
      color: colors.textSubtle,
      fontSize: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    segmentList: { flex: 1, gap: spacing.sm },
    segmentRow:  { gap: 3 },
    segmentLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    segmentLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.2,
      flex: 1,
    },
    segmentRight: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    segmentVal: {
      fontSize: typography.micro,
      fontWeight: '700',
    },
    segmentDelta: {
      fontSize: 9,
      fontWeight: '700',
      lineHeight: 12,
    },
    barTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    barFill: { height: 4, borderRadius: 2 },
    coverageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coverageLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.2,
      flex: 1,
    },
    coverageVal: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '700',
    },
    periodNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      fontStyle: 'italic',
      marginTop: -spacing.xs,
    },
  });
}
