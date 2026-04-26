import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readinessSegments, dataCoveragePercent } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import {
  lineHeights,
  radius,
  segmentColors,
  spacing,
  typography,
} from '../theme/marathonTheme';

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Progress ring using the classic rotation + clip technique.
 * Two half-circle Views, each rotated to fill the arc.
 * No SVG, no reanimated, no deps.
 */
function ProgressRing({
  size,
  strokeWidth,
  progress, // 0–100
  trackColor,
  progressColor,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  children?: React.ReactNode;
}) {
  const half = size / 2;
  const pct = clamp(progress) / 100;
  // degrees for the progress arc
  const deg = pct * 360;
  // We clip at 180° boundary
  const firstHalfDeg = Math.min(deg, 180);
  const secondHalfDeg = Math.max(deg - 180, 0);

  return (
    <View style={{ width: size, height: size }}>
      {/* Track circle */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          },
        ]}
      />

      {/* Left half-clip container */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { overflow: 'hidden', borderRadius: half },
          { width: half, left: 0 },
        ]}
        pointerEvents="none"
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              left: half,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              transform: [{ rotate: `${firstHalfDeg - 180}deg` }],
            },
          ]}
        />
      </View>

      {/* Right half-clip container */}
      {secondHalfDeg > 0 && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { overflow: 'hidden', borderRadius: half },
            { width: half, left: half },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                right: half,
                borderRadius: half,
                borderWidth: strokeWidth,
                borderColor: progressColor,
                transform: [{ rotate: `${secondHalfDeg}deg` }],
              },
            ]}
          />
        </View>
      )}

      {/* Center content */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
        pointerEvents="none"
      >
        {children}
      </View>
    </View>
  );
}

export function ReadinessOrbit() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const average = clamp(
    readinessSegments.reduce((sum, seg) => sum + seg.value, 0) /
      readinessSegments.length,
  );

  return (
    <View style={s.card}>
      {/* Interpretation — primary */}
      <Text style={s.interpretation}>{prototypeCopy.readinessInterpretation}</Text>
      <Text style={s.interpretationSub}>{prototypeCopy.readinessInterpretationSub}</Text>

      {/* Ring + segments */}
      <View style={s.bodyRow}>
        <View style={s.ringWrapper}>
          <ProgressRing
            size={88}
            strokeWidth={7}
            progress={average}
            trackColor={colors.ringTrack}
            progressColor={colors.ringProgress}
          >
            <Text style={s.score}>{average}</Text>
            <Text style={s.scoreCtx}>{prototypeCopy.readinessScoreContext}</Text>
          </ProgressRing>
        </View>

        <View style={s.segmentList}>
          {readinessSegments.map((seg, i) => {
            const color = segmentColors[i % segmentColors.length];
            return (
              <View key={seg.label} style={s.segmentRow}>
                <Text style={s.segmentLabel}>{seg.label}</Text>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${clamp(seg.value)}%` as `${number}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Data coverage — inline text, not a bar */}
      <Text style={s.coverageNote}>
        {prototypeCopy.dataCoverageLabel}: {dataCoveragePercent}% of signals available
      </Text>
    </View>
  );
}

function createStyles(colors: import('../theme/marathonTheme').ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    interpretation: {
      color: colors.text,
      fontSize: typography.heroInterpretation,
      fontWeight: '700',
      lineHeight: lineHeights.heroInterpretation,
      letterSpacing: -0.3,
    },
    interpretationSub: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    bodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    ringWrapper: {
      flexShrink: 0,
      alignItems: 'center',
    },
    score: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '800',
      lineHeight: 28,
      textAlign: 'center',
    },
    scoreCtx: {
      color: colors.textSubtle,
      fontSize: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    segmentList: {
      flex: 1,
      gap: spacing.sm,
    },
    segmentRow: { gap: spacing.xs },
    segmentLabel: {
      color: colors.textSubtle,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    barTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    barFill: {
      height: 4,
      borderRadius: 2,
    },
    coverageNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
    },
  });
}
