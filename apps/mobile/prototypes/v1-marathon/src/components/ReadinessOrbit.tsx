import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readinessSegments } from '../data/demoData';
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

export function ReadinessOrbit() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const average = clamp(
    readinessSegments.reduce((sum, seg) => sum + seg.value, 0) /
      readinessSegments.length,
  );

  return (
    <View style={s.card}>
      <Text style={s.interpretation}>{prototypeCopy.readinessInterpretation}</Text>
      <Text style={s.interpretationSub}>{prototypeCopy.readinessInterpretationSub}</Text>

      <View style={s.bodyRow}>
        <View style={s.ringWrapper}>
          <View style={s.ring}>
            <Text style={s.score}>{average}</Text>
            <Text style={s.scoreContext}>{prototypeCopy.readinessScoreContext}</Text>
          </View>
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
      gap: spacing.lg,
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
      marginTop: -spacing.sm,
    },
    bodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    ringWrapper: {
      alignItems: 'center',
      flexShrink: 0,
    },
    ring: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 6,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.30,
      shadowRadius: 10,
      elevation: 6,
    },
    score: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 30,
    },
    scoreContext: {
      color: colors.textSubtle,
      fontSize: 9,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    segmentList: {
      flex: 1,
      gap: spacing.sm,
    },
    segmentRow: {
      gap: spacing.xs,
    },
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
  });
}
