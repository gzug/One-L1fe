/**
 * WearableSourcesCard
 *
 * Compact Home card explaining what Recovery and Training Load are made of.
 * Lists V1 metric keys (wearable-metric-keys-v1.md) grouped by signal,
 * each with confidence class and source/provenance.
 *
 * No live sync claim. CTA opens Health Connect status screen on the
 * caller's side.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { HealthConnectStatus } from '../../../v1-marathon/src/data/healthConnect';

type Confidence = 'device' | 'derived' | 'product';

type Metric = {
  key: string;
  label: string;
  confidence: Confidence;
};

type SignalGroup = {
  title: string;
  caption: string;
  metrics: Metric[];
};

const RECOVERY_GROUP: SignalGroup = {
  title: 'Recovery',
  caption: 'Sleep · resting heart rate · HRV',
  metrics: [
    { key: 'sleep_duration',      label: 'Sleep duration',     confidence: 'device' },
    { key: 'awake_duration',      label: 'Awake during sleep', confidence: 'derived' },
    { key: 'resting_heart_rate',  label: 'Resting HR',         confidence: 'derived' },
    { key: 'hrv',                 label: 'HRV (RMSSD)',        confidence: 'device' },
  ],
};

const LOAD_GROUP: SignalGroup = {
  title: 'Training Load',
  caption: 'Workouts · active minutes · steps · HR',
  metrics: [
    { key: 'workout_session', label: 'Workouts',       confidence: 'device' },
    { key: 'active_minutes',  label: 'Active minutes', confidence: 'product' },
    { key: 'steps_total',     label: 'Steps',          confidence: 'device' },
    { key: 'heart_rate',      label: 'Heart rate',     confidence: 'device' },
  ],
};

function confidenceLabel(c: Confidence): string {
  switch (c) {
    case 'device':  return 'device';
    case 'derived': return 'derived';
    case 'product': return 'product';
  }
}

function IconPulse({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M1 7 L4 7 L5.5 3 L8 11 L9.5 7 L13 7"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconSpark({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M7 1 L8.5 5.5 L13 7 L8.5 8.5 L7 13 L5.5 8.5 L1 7 L5.5 5.5 Z"
        fill={color}
      />
    </Svg>
  );
}

function IconWatch({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d="M5 2 L9 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M5 12 L9 12" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={7} cy={7} r={3.5} stroke={color} strokeWidth={1.4} fill="none" />
      <Circle cx={7} cy={7} r={0.9} fill={color} />
    </Svg>
  );
}

type Props = {
  hcStatus: HealthConnectStatus;
  onManageSources: () => void;
};

export function WearableSourcesCard({ hcStatus, onManageSources }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const sourceState = sourceStateFor(hcStatus, colors);
  const ctaLabel    = ctaFor(hcStatus);

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Wearable Data</Text>
          <Text style={s.sub}>What Recovery and Training Load are made of</Text>
        </View>
        <View style={[s.statusPill, { borderColor: sourceState.borderColor, backgroundColor: sourceState.bgColor }]}>
          <View style={[s.statusDot, { backgroundColor: sourceState.dotColor }]} />
          <Text style={[s.statusText, { color: sourceState.textColor }]}>{sourceState.label}</Text>
        </View>
      </View>

      <View style={s.groupList}>
        <SignalGroupRow group={RECOVERY_GROUP} accent={colors.positive} icon={<IconPulse color={colors.positive} />} />
        <View style={[s.divider, { backgroundColor: colors.borderSubtle }]} />
        <SignalGroupRow group={LOAD_GROUP} accent={colors.warning} icon={<IconSpark color={colors.warning} />} />
      </View>

      <View style={s.provenanceRow}>
        <View style={s.provItem}>
          <IconWatch color={colors.textSubtle} />
          <Text style={s.provText}>Garmin · via Health Connect where available</Text>
        </View>
        <Text style={s.provHint}>
          Strava is planned · vendor scores like body battery, readiness, recovery_score and VO2max are kept as context, not core inputs.
        </Text>
      </View>

      <Pressable
        onPress={onManageSources}
        style={[s.cta, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
        accessibilityLabel={ctaLabel}
      >
        <Text style={[s.ctaText, { color: colors.accent }]}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

function SignalGroupRow({
  group, accent, icon,
}: {
  group: SignalGroup;
  accent: string;
  icon: React.ReactNode;
}) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <View style={s.group}>
      <View style={s.groupHeader}>
        <View style={s.groupHeaderLeft}>
          {icon}
          <Text style={[s.groupTitle, { color: accent }]}>{group.title}</Text>
        </View>
        <Text style={s.groupCaption}>{group.caption}</Text>
      </View>
      <View style={s.metricRow}>
        {group.metrics.map((m) => (
          <View key={m.key} style={[s.metricChip, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
            <Text style={[s.metricLabel, { color: colors.text }]}>{m.label}</Text>
            <Text style={[s.metricMeta,  { color: colors.textSubtle }]}>{confidenceLabel(m.confidence)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function sourceStateFor(status: HealthConnectStatus, colors: ThemeColors): {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'connected':
      return {
        label: 'Health Connect · connected',
        dotColor: colors.positive,
        textColor: colors.positive,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
    case 'available_no_permissions':
      return {
        label: 'Demo · Health Connect ready',
        dotColor: colors.warning,
        textColor: colors.textMuted,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
    case 'provider_update_required':
      return {
        label: 'Update Health Connect',
        dotColor: colors.warning,
        textColor: colors.textMuted,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
    case 'unavailable':
      return {
        label: 'Demo · Health Connect missing',
        dotColor: colors.textSubtle,
        textColor: colors.textSubtle,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
    case 'unsupported_platform':
      return {
        label: 'Demo · Android-only',
        dotColor: colors.textSubtle,
        textColor: colors.textSubtle,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
    case 'error':
    default:
      return {
        label: 'Demo · status unknown',
        dotColor: colors.textSubtle,
        textColor: colors.textSubtle,
        bgColor: 'transparent',
        borderColor: colors.borderSubtle,
      };
  }
}

function ctaFor(status: HealthConnectStatus): string {
  if (status === 'connected') return 'Manage sources →';
  if (status === 'available_no_permissions') return 'Connect Health Connect →';
  if (status === 'provider_update_required') return 'Update & connect →';
  if (status === 'unsupported_platform') return 'Manage sources →';
  return 'Manage sources →';
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
    statusDot:  { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: typography.micro, fontWeight: '600' },

    groupList: { gap: spacing.sm },
    divider:   { height: StyleSheet.hairlineWidth, marginVertical: 2 },
    group:     { gap: 6 },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    groupHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    groupTitle: {
      fontSize: typography.caption,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    groupCaption: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      flexShrink: 1,
      textAlign: 'right',
    },
    metricRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    metricChip: {
      borderRadius: radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 5,
    },
    metricLabel: { fontSize: typography.micro, fontWeight: '600' },
    metricMeta:  { fontSize: 9, fontWeight: '500', letterSpacing: 0.2, textTransform: 'uppercase' },

    provenanceRow: { gap: 4 },
    provItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    provText: { color: colors.textMuted, fontSize: typography.micro, fontWeight: '500' },
    provHint: { color: colors.textSubtle, fontSize: typography.micro, lineHeight: lineHeights.caption },

    cta: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    ctaText: {
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
  });
}
