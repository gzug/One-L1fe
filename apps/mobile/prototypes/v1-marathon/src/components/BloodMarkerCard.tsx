import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BloodMarker } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

type BloodMarkerCardProps = { marker: BloodMarker };

const statusLabel: Record<BloodMarker['status'], string> = {
  available: prototypeCopy.available,
  needs_attention: prototypeCopy.needsAttention,
  not_available: prototypeCopy.notAvailable,
};

function sColor(s: BloodMarker['status'], c: ThemeColors) {
  switch (s) {
    case 'available': return c.positive;
    case 'needs_attention': return c.warning;
    default: return c.textSubtle;
  }
}
function sBg(s: BloodMarker['status'], c: ThemeColors) {
  switch (s) {
    case 'available': return c.positiveSoft;
    case 'needs_attention': return c.warningSoft;
    default: return 'transparent';
  }
}
function sBorder(s: BloodMarker['status'], c: ThemeColors) {
  switch (s) {
    case 'available': return c.positiveBorder;
    case 'needs_attention': return c.warningBorder;
    default: return c.borderSubtle;
  }
}

export function BloodMarkerCard({ marker }: BloodMarkerCardProps) {
  const { colors } = useTheme();
  const color = sColor(marker.status, colors);
  const bg = sBg(marker.status, colors);
  const border = sBorder(marker.status, colors);
  const s = createStyles(colors);

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <Text style={s.label}>{marker.label}</Text>
        <View style={[s.pill, { backgroundColor: bg, borderColor: border }]}>
          <Text style={[s.pillText, { color }]}>{statusLabel[marker.status]}</Text>
        </View>
      </View>
      <Text style={s.value}>
        {marker.value}
        {marker.unit ? <Text style={s.unit}> {marker.unit}</Text> : null}
      </Text>
      <View style={s.footer}>
        <Text style={s.date}>{marker.dateLabel}</Text>
        {marker.panelNote ? (
          <Text style={s.panelNote}>{marker.panelNote}</Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    label: {
      color: colors.textMuted,
      fontSize: typography.caption,
      fontWeight: '600',
      flex: 1,
    },
    value: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    unit: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      fontWeight: '400',
    },
    footer: {
      gap: 2,
    },
    date: {
      color: colors.textSubtle,
      fontSize: typography.micro,
    },
    panelNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      opacity: 0.75,
    },
    pill: {
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.xs + 2,
      paddingVertical: 1,
      flexShrink: 0,
    },
    pillText: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });
}
