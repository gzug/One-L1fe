import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { readLiveHealthConnectSnapshot } from '../data/healthConnectLive';
import type { LiveHealthConnectSnapshot } from '../data/healthConnectLive';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

function formatFetchedAt(iso?: string): string {
  if (!iso) return 'Not loaded';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

function statusLabel(status?: LiveHealthConnectSnapshot['status']): string {
  switch (status) {
    case 'available': return 'Live snapshot';
    case 'partial': return 'Partial data';
    case 'permission_required': return 'Permission needed';
    case 'unsupported_platform': return 'Android only';
    case 'module_unavailable': return 'Module unavailable';
    case 'error': return 'Read failed';
    default: return 'Checking';
  }
}

export function HealthConnectLiveCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [snapshot, setSnapshot] = useState<LiveHealthConnectSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await readLiveHealthConnectSnapshot();
      setSnapshot(next);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
    // Run once on mount. Manual refresh covers updates while app stays open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = snapshot ? [
    snapshot.metrics.stepsToday,
    snapshot.metrics.distanceToday,
    snapshot.metrics.activeCaloriesToday,
    snapshot.metrics.restingHeartRate,
    snapshot.metrics.hrvRmssd,
    snapshot.metrics.sleepDuration,
  ] : [];

  const positive = snapshot?.status === 'available' || snapshot?.status === 'partial';

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Health Connect Data</Text>
          <Text style={s.sub}>
            Display-only foreground read · scores are not recalculated yet
          </Text>
        </View>
        <View style={[
          s.statusPill,
          { borderColor: colors.borderSubtle },
        ]}>
          <View style={[s.statusDot, { backgroundColor: positive ? colors.positive : colors.warning }]} />
          <Text style={[s.statusText, { color: positive ? colors.positive : colors.textMuted }]}>
            {statusLabel(snapshot?.status)}
          </Text>
        </View>
      </View>

      {snapshot?.message ? <Text style={s.message}>{snapshot.message}</Text> : null}

      <View style={s.metricGrid}>
        {metrics.length > 0 ? metrics.map((m) => (
          <View key={m.label} style={s.metricBox}>
            <Text style={s.metricLabel}>{m.label}</Text>
            <View style={s.valueRow}>
              <Text style={[
                s.metricValue,
                m.status === 'available' ? { color: colors.text } : { color: colors.textSubtle },
              ]}>
                {m.value}
              </Text>
              {m.unit ? <Text style={s.metricUnit}>{m.unit}</Text> : null}
            </View>
            {m.note ? <Text style={s.metricNote}>{m.note}</Text> : null}
          </View>
        )) : (
          <Text style={s.message}>Checking Health Connect…</Text>
        )}
      </View>

      <View style={s.footerRow}>
        <Text style={s.footerText}>Updated {formatFetchedAt(snapshot?.fetchedAt)}</Text>
        <Pressable
          onPress={refresh}
          disabled={busy}
          style={[s.refreshBtn, { borderColor: colors.accentBorder, opacity: busy ? 0.5 : 1 }]}
          accessibilityLabel="Refresh Health Connect data"
        >
          <Text style={[s.refreshText, { color: colors.accent }]}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </Text>
        </Pressable>
      </View>
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
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      flexShrink: 0,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: typography.micro, fontWeight: '600' },
    message: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    metricBox: {
      flexBasis: '47%',
      flexGrow: 1,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      padding: spacing.sm,
      gap: 3,
    },
    metricLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '600',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    metricValue: {
      fontSize: typography.body,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    metricUnit: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '600',
    },
    metricNote: {
      color: colors.textSubtle,
      fontSize: 9,
      lineHeight: 12,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    footerText: {
      color: colors.textSubtle,
      fontSize: typography.micro,
    },
    refreshBtn: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 1,
    },
    refreshText: {
      fontSize: typography.micro,
      fontWeight: '700',
    },
  });
}
