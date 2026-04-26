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
      <View style={styles.headerRow}>
        <Text style={styles.label}>{marker.label}</Text>
        {marker.isDemo && <DemoDataBadge compact />}
      </View>
      <Text style={styles.value}>
        {marker.value}
        {marker.unit ? (
          <Text style={styles.unit}> {marker.unit}</Text>
        ) : null}
      </Text>
      <View style={styles.footerRow}>
        <Text style={styles.date}>{marker.dateLabel}</Text>
        <View style={[styles.statusPill, { backgroundColor: bg, borderColor: border }]}>
          <Text style={[styles.statusText, { color }]}>
            {statusLabel[marker.status]}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  },
  label: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '600',
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  unit: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    fontWeight: '400',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.micro,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: marathonTheme.radius.pill,
    paddingHorizontal: marathonTheme.spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: marathonTheme.typography.micro,
    fontWeight: '600',
  },
});
