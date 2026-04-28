/**
 * AppHeaderV2
 *
 * Dedicated v2 header. Keeps One L1fe as the primary mark and renders `v2`
 * as a small, low-emphasis marker.
 */
import React from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { V2SignedInIdentity } from '../auth/types';
import { useTheme } from '../theme/ThemeContext';
import { layout, spacing, typography } from '../theme/marathonTheme';
import { prototypeCopy } from '../data/copy';

type AppHeaderV2Props = {
  identity?: V2SignedInIdentity | null;
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
  onSignOut?: () => void;
};

const ANDROID_TOP_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const ICON_SIZE = 22;

function IconInfo({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={9} stroke={color} strokeWidth={1.6} fill="none" />
      <Circle cx={11} cy={6.5} r={1.1} fill={color} />
      <Path d="M11 9.6 L11 15.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconSun({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={3.6} stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M11 2.5 L11 5"     stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M11 17 L11 19.5"   stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M2.5 11 L5 11"     stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M17 11 L19.5 11"   stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M5 5 L6.8 6.8"     stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M15.2 15.2 L17 17" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M17 5 L15.2 6.8"   stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M5 17 L6.8 15.2"   stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function IconMoon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22">
      <Path
        d="M17.5 13.2 A7.5 7.5 0 1 1 8.8 4.5 A6 6 0 0 0 17.5 13.2 Z"
        fill={color}
      />
    </Svg>
  );
}

function IconProfile({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={9} stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={11} cy={9}  r={2.6} fill={color} />
      <Path
        d="M5.4 17.5 C6.3 14.9 8.4 13.7 11 13.7 C13.6 13.7 15.7 14.9 16.6 17.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function IconSignOut({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22">
      <Path
        d="M9 4.5 H5.6 C4.7 4.5 4 5.2 4 6.1 V15.9 C4 16.8 4.7 17.5 5.6 17.5 H9"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M12 7.2 L15.8 11 L12 14.8" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M15.5 11 H8.8" stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function AppHeaderV2({ identity, onProfilePress, onDemoInfoPress, onSignOut }: AppHeaderV2Props) {
  const { colors, isDark, toggle } = useTheme();
  const iconColor = colors.text;
  const identityLabel = identity?.displayName ?? identity?.email ?? 'Signed in';

  return (
    <View
      style={[
        styles.root,
        {
          borderBottomColor: colors.borderSubtle,
          paddingTop: ANDROID_TOP_INSET + spacing.md,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandName, { color: colors.text }]}>{prototypeCopy.appName}</Text>
            <Text style={[styles.brandSub, { color: colors.textSubtle }]}>{prototypeCopy.prototypeSub}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.identity, { color: colors.textSubtle }]}>
            {identityLabel}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={onDemoInfoPress}
            style={styles.iconBtn}
            accessibilityLabel="About demo data"
            accessibilityRole="button"
            hitSlop={10}
          >
            <IconInfo color={iconColor} />
          </Pressable>
          <Pressable
            onPress={toggle}
            style={styles.iconBtn}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            accessibilityRole="button"
            hitSlop={10}
          >
            {isDark ? <IconSun color={iconColor} /> : <IconMoon color={iconColor} />}
          </Pressable>
          <Pressable
            onPress={onProfilePress}
            style={styles.iconBtn}
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            hitSlop={10}
          >
            <IconProfile color={iconColor} />
          </Pressable>
          {onSignOut ? (
            <Pressable
              onPress={onSignOut}
              style={styles.iconBtn}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              hitSlop={10}
            >
              <IconSignOut color={iconColor} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing.md,
  },
  inner: {
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  brandName: {
    fontSize: typography.heroName,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  brandSub: {
    fontSize: typography.caption,
    fontWeight: '500',
    letterSpacing: 0.8,
    lineHeight: 16,
    opacity: 0.42,
    textTransform: 'lowercase',
  },
  identity: {
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 34,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
