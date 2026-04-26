import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { layout, spacing, typography } from '../theme/marathonTheme';

type AppHeaderProps = {
  onProfilePress: () => void;
};

export function AppHeader({ onProfilePress }: AppHeaderProps) {
  const { colors, isDark, toggle } = useTheme();

  return (
    <View style={[styles.root, { borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={[styles.brandName, { color: colors.accent }]}>One L1fe</Text>
          <Text style={[styles.brandSub, { color: colors.textSubtle }]}>
            V1 \u2014 Marathon
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={toggle}
            style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            hitSlop={8}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={17}
              color={colors.textMuted}
            />
          </Pressable>

          <Pressable
            onPress={onProfilePress}
            style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            accessibilityLabel="Open profile"
            hitSlop={8}
          >
            <Ionicons name="person-circle-outline" size={19} color={colors.textMuted} />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  brand: { gap: 1 },
  brandName: {
    fontSize: typography.heroName,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  brandSub: {
    fontSize: typography.heroSub,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 17,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: 3,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
