import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BloodMarker } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';
import { DemoDataBadge } from './DemoDataBadge';

type BloodMarkerCardProps = {
  marker: BloodMarker;
};

const statusLabel: Record<BloodMarker['status'], string> = {
  available: prototypeCopy.available,
  needs_attention: prototypeCopy.needsAttention,
  not_available: prototypeCopy.notAvailable,
};

export function BloodMarkerCard({ marker }: BloodMarkerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{marker.label}</Text>
        {marker.isDemo ? <DemoDataBadge compact /> : null}
      </View>
      <Text style={styles.value}>
        {marker.value}{marker.unit ? ` ${marker.unit}` : ''}
      </Text>
      <View style={styles.footerRow}>
        <Text style={styles.date}>{marker.dateLabel}</Text>
        <Text style={styles.status}>{statusLabel[marker.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.md,
    gap: marathonTheme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: marathonTheme.spacing.sm,
  },
  label: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  footerRow: {
    gap: 2,
  },
  date: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
  },
  status: {
    color: marathonTheme.colors.accent,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '700',
  },
});
