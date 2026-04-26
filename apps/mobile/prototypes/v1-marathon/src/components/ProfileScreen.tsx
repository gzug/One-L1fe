import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  layout,
  lineHeights,
  radius,
  spacing,
  typography,
} from '../theme/marathonTheme';

type ProfileScreenProps = {
  onClose: () => void;
};

// ─── Data shapes ─────────────────────────────────────────────────────────────

type ProfileRow = {
  label: string;
  value: string;
  note?: string;
};

type ProfileSection = {
  title: string;
  rows: ProfileRow[];
};

const profileSections: ProfileSection[] = [
  {
    title: 'Personal',
    rows: [
      { label: 'Name', value: 'Demo User' },
      { label: 'Age', value: '34' },
      { label: 'Sex', value: 'Male' },
      { label: 'Height', value: '182 cm' },
      { label: 'Weight', value: '78 kg', note: 'Demo value' },
    ],
  },
  {
    title: 'Training goal',
    rows: [
      { label: 'Primary goal', value: 'Marathon finish' },
      { label: 'Target race', value: 'Munich Marathon 2025', note: 'Demo value' },
      { label: 'Race date', value: 'Oct 12, 2025', note: 'Demo value' },
      { label: 'Weeks to race', value: '24 weeks', note: 'Demo value' },
    ],
  },
  {
    title: 'Training profile',
    rows: [
      { label: 'Experience level', value: 'Intermediate' },
      { label: 'Weekly volume', value: '55 km / week', note: 'Demo value' },
      { label: 'Long run peak', value: '32 km', note: 'Demo value' },
      { label: 'Typical intensity', value: 'Zone 2 base with tempo blocks' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { label: 'Units', value: 'Metric' },
      { label: 'Pace format', value: 'min/km' },
      { label: 'Language', value: 'English' },
    ],
  },
  {
    title: 'Connected sources',
    rows: [
      {
        label: 'Garmin',
        value: 'Not connected',
        note: 'Live sync not available in prototype',
      },
      {
        label: 'Health Connect',
        value: 'Not connected',
        note: 'Live sync not available in prototype',
      },
      {
        label: 'Blood panel',
        value: 'Apr 2025 — demo data',
        note: 'Manual import only in prototype',
      },
    ],
  },
  {
    title: 'Sync status',
    rows: [
      { label: 'Last sync', value: 'N/A — prototype mode' },
      { label: 'Data freshness', value: 'Demo data active' },
      { label: 'Live wearable data', value: 'Not available', note: 'Coming in a future release' },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <SafeAreaView style={[s.safeArea]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Profile</Text>
          <Text style={s.headerSub}>One L1fe · V1 — Marathon</Text>
        </View>
        <Pressable
          onPress={onClose}
          style={s.closeBtn}
          accessibilityLabel="Close profile"
          hitSlop={8}
        >
          <Text style={s.closeBtnText}>Close</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>

          {/* Demo context note */}
          <View style={s.demoBanner}>
            <Text style={s.demoBannerText}>
              Profile fields are demo values. In the full product these will sync from
              your account and connected sources.
            </Text>
          </View>

          {profileSections.map((section) => (
            <View key={section.title} style={s.section}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <View style={s.card}>
                {section.rows.map((row, i) => (
                  <View
                    key={row.label}
                    style={[
                      s.row,
                      i < section.rows.length - 1 && s.rowBorder,
                    ]}
                  >
                    <Text style={s.rowLabel}>{row.label}</Text>
                    <View style={s.rowRight}>
                      <Text style={s.rowValue}>{row.value}</Text>
                      {row.note ? (
                        <Text style={s.rowNote}>{row.note}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text style={s.footer}>
            One L1fe does not store or transmit profile data in prototype mode.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles factory ──────────────────────────────────────────────────────────

function createStyles(colors: import('../theme/marathonTheme').ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: layout.screenPaddingH,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    headerTitle: {
      color: colors.text,
      fontSize: typography.title,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    headerSub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      marginTop: 2,
    },
    closeBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginTop: 2,
    },
    closeBtnText: {
      color: colors.accent,
      fontSize: typography.bodySmall,
      fontWeight: '600',
    },
    scroll: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.xl,
    },
    demoBanner: {
      borderRadius: radius.md,
      backgroundColor: colors.demoBanner,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
      padding: spacing.md,
    },
    demoBannerText: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingLeft: 2,
    },
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.profileSectionBg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.lg,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.profileRowBorder,
    },
    rowLabel: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      fontWeight: '500',
      flex: 1,
    },
    rowRight: {
      alignItems: 'flex-end',
      gap: 2,
      flex: 2,
    },
    rowValue: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      textAlign: 'right',
    },
    rowNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      textAlign: 'right',
    },
    footer: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
  });
}
