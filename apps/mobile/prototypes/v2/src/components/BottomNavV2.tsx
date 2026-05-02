import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { layout, radius, spacing, typography } from '../theme/marathonTheme';

export type BottomTabKey = 'home' | 'trends' | 'insights' | 'profile';

type BottomNavV2Props = {
  activeTab: BottomTabKey;
  onSelect: (tab: BottomTabKey) => void;
};

const TABS: Array<{ key: BottomTabKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'trends', label: 'Trends' },
  { key: 'insights', label: 'Insights' },
  { key: 'profile', label: 'Profile' },
];

export function BottomNavV2({ activeTab, onSelect }: BottomNavV2Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onSelect(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${tab.label} tab`}
              style={({ pressed }) => [
                styles.item,
                active && { backgroundColor: colors.scoreStrongSoft },
                pressed && { opacity: 0.72 },
              ]}
            >
              <TabIcon name={tab.key} color={active ? colors.scoreStrong : colors.textSubtle} />
              <Text style={[styles.label, { color: active ? colors.text : colors.textSubtle }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TabIcon({ name, color }: { name: BottomTabKey; color: string }) {
  if (name === 'home') {
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path d="M3.2 9.4 L10 3.8 L16.8 9.4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M5.2 8.8 V16.2 H14.8 V8.8" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'trends') {
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path d="M3 14.8 H17" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.5} />
        <Path d="M4 12.6 L7.4 9.7 L10.2 11.4 L15.8 5.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Circle cx={15.8} cy={5.8} r={1.4} fill={color} />
      </Svg>
    );
  }
  if (name === 'insights') {
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path d="M10 3.2 C6.8 3.2 4.2 5.8 4.2 9 C4.2 11.1 5.3 12.7 7 13.8 V16.2 H13 V13.8 C14.7 12.7 15.8 11.1 15.8 9 C15.8 5.8 13.2 3.2 10 3.2 Z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M7.4 16.8 H12.6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx={10} cy={7.6} r={3} fill={color} opacity={0.9} />
      <Path d="M4.4 16.4 C5.4 13.7 7.5 12.4 10 12.4 C12.5 12.4 14.6 13.7 15.6 16.4" stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
      <Rect x={2.8} y={2.8} width={14.4} height={14.4} rx={7.2} stroke={color} strokeWidth={1.3} fill="none" opacity={0.55} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 10,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bar: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    minHeight: 66,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: typography.micro,
    fontWeight: '800',
    lineHeight: 14,
  },
});
