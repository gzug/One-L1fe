import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BloodMarker } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

type BloodMarkerCardProps = {
  marker: BloodMarker;
};

const statusLabel: Record<BloodMarker['status'], string> = {
  available: prototypeCopy.available,
  needs_attention: prototypeCopy.needsAttention,
  not_available: prototypeCopy.notAvailable,
};

const statusColor: Record<BloodMarker['status'], string> = {
  available: marathonTheme.colors.positive,
  needs_attention: marathonTheme.colors.warning,
  not_available: marathonTheme.colors.textSubtle,
};

const statusBg: Record<BloodMarker['status'], string> = {
  available: marathonTheme.colors.positiveSoft,
  needs_attention: marathonTheme.colors.warningSoft,
  not_available: 'transparent',
};

const statusBorder: Record<BloodMarker['status'], string> = {
  available: marathonTheme.colors.positiveBorder,
  needs_attention: marathonTheme.colors.warningBorder,
  not_available: marathonTheme.colors.borderSubtle,
};

export function BloodMarkerCard({ marker }: BloodMarkerCardProps) {
  const color = statusColor[marker.status];
  const bg = statusBg[marker.status];
  const border = statusBorder[marker.status];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{marker.label}</Text>
        <View style={[styles.statusPill, { backgroundColor: bg, borderColor: border }]}>
          <Text style={[styles.statusText, { color }]}>
            {statusLabel[marker.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.value}>
        {marker.value}
        {marker.unit ? (
          <Text style={styles.unit}> {marker.unit}</Text>
        ) : null}
      </Text>
      <Text style={styles.date}>{marker.dateLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.md,
    gap: marathonTheme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: marathonTheme.spacing.xs,
  },
  label: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  unit: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.bodySmall,
    fontWeight: '400',
  },
  date: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.micro,
    marginTop: 2,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: marathonTheme.radius.pill,
    paddingHorizontal: marathonTheme.spacing.xs + 2,
    paddingVertical: 1,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
