import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { layout, spacing, typography } from '../theme/marathonTheme';

type AppHeaderProps = {
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
};

export function AppHeader({ onProfilePress, onDemoInfoPress }: AppHeaderProps) {
  const { colors, isDark, toggle } = useTheme();

  return (
    <View style={[styles.root, { borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.inner}>
        {/* Brand lockup */}
        <View style={styles.brand}>
          <Text style={[styles.brandName, { color: colors.text }]}>One L1fe</Text>
          <Text style={[styles.brandSub, { color: colors.accent }]}>
            V1 — Marathon
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={onDemoInfoPress}
            style={styles.iconBtn}
            accessibilityLabel="About demo data"
            hitSlop={10}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.textSubtle} />
          </Pressable>
          <Pressable
            onPress={toggle}
            style={styles.iconBtn}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            hitSlop={10}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={19} color={colors.textSubtle} />
          </Pressable>
          <Pressable
            onPress={onProfilePress}
            style={styles.iconBtn}
            accessibilityLabel="Open profile"
            hitSlop={10}
          >
            <Ionicons name="person-circle-outline" size={21} color={colors.textSubtle} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  inner: {
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    gap: 1,
  },
  brandName: {
    fontSize: typography.heroName,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  brandSub: {
    fontSize: typography.heroSub,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
