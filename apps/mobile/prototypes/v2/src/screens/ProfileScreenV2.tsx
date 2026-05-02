import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { BrandMarkV2 } from '../components/BrandMarkV2';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';

type ProfileScreenV2Props = {
  onClose: () => void;
  onViewBlood: () => void;
};

type ProfileRowProps = {
  title: string;
  subtitle: string;
  icon: 'sources' | 'tests' | 'privacy' | 'mode';
  actionLabel?: string;
  onPress?: () => void;
};

function RowIcon({ name, color }: { name: ProfileRowProps['icon']; color: string }) {
  if (name === 'tests') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M8 3.5 H14" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Path d="M9 3.5 V9.2 L5.6 15.8 C4.8 17.4 5.9 19.2 7.7 19.2 H14.3 C16.1 19.2 17.2 17.4 16.4 15.8 L13 9.2 V3.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M7.4 15.2 H14.6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'privacy') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M11 3.4 L17.2 5.9 V10.2 C17.2 14.2 14.7 17.2 11 18.8 C7.3 17.2 4.8 14.2 4.8 10.2 V5.9 L11 3.4 Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" fill="none" />
        <Path d="M8.3 10.8 L10.2 12.7 L14 8.8" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'mode') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx={7.5} cy={7.5} r={3.2} stroke={color} strokeWidth={1.7} fill="none" />
        <Circle cx={14.5} cy={14.5} r={3.2} stroke={color} strokeWidth={1.7} fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path d="M6 7.4 C7.1 5.8 8.8 4.8 11 4.8 C14.4 4.8 17.2 7.6 17.2 11 C17.2 14.4 14.4 17.2 11 17.2 C8.8 17.2 7.1 16.2 6 14.6" stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
      <Path d="M3.8 11 H12.6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M10.2 8.6 L12.6 11 L10.2 13.4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function ProfileRow({ title, subtitle, icon, actionLabel, onPress }: ProfileRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
        pressed && { opacity: 0.76 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.brandGreenSoft }]}>
        <RowIcon name={icon} color={colors.brandGreen} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      {actionLabel ? (
        <Text style={[styles.rowAction, { color: colors.brandGreen }]}>{actionLabel}</Text>
      ) : null}
    </Pressable>
  );
}

export function ProfileScreenV2({ onClose, onViewBlood }: ProfileScreenV2Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandMarkV2 size={46} showWordmark />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.close,
              { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
              pressed && { opacity: 0.72 },
            ]}
          >
            <Text style={[styles.closeText, { color: colors.textMuted }]}>Done</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.kicker, { color: colors.brandGreen }]}>Profile</Text>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'BrandHeading' }]}>Your health workspace</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Manage sources, review imported test results, and keep demo data clearly separated from user data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>Data</Text>
          <ProfileRow
            title="Connected sources"
            subtitle="Health Connect is display-only in this prototype."
            icon="sources"
            actionLabel="Manage"
          />
          <ProfileRow
            title="Test results"
            subtitle="Review local blood panels already available to v2."
            icon="tests"
            actionLabel="Open"
            onPress={onViewBlood}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>App</Text>
          <ProfileRow
            title="Demo and user data"
            subtitle="Demo screens stay labelled; empty user states stay honest."
            icon="mode"
          />
          <ProfileRow
            title="Privacy posture"
            subtitle="No Supabase write, diagnosis, treatment, or clinical-risk-score claim in v2 UI."
            icon="privacy"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingBottom: 104,
  },
  container: {
    width: '100%',
    maxWidth: layout.maxWidth,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  kicker: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    fontWeight: '600',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  row: {
    minHeight: 82,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontSize: typography.body,
    lineHeight: lineHeights.body,
    fontWeight: '800',
  },
  rowSubtitle: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    fontWeight: '600',
  },
  rowAction: {
    fontSize: typography.caption,
    fontWeight: '900',
  },
});
