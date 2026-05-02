/**
 * AppHeaderV2
 *
 * Dedicated v2 header. Keeps One L1fe as the primary mark and renders `v2`
 * as a small, low-emphasis marker.
 */
import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { layout, radius, spacing, typography, type ThemeColors } from '../theme/marathonTheme';
import { prototypeCopy } from '../data/copy';
import {
  TIME_RANGE_LABELS,
  TIME_RANGE_OPTIONS,
  type CustomRange,
  type TimeRange,
} from '../types/timeRange';

type AppHeaderV2Props = {
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
  dataMode: 'user' | 'demo';
  onDataModeChange: (mode: 'user' | 'demo') => void;
  timeRange: TimeRange;
  customRange: CustomRange;
  onTimeRangeSelect: (range: TimeRange) => void;
};

const ICON_SIZE = 22;

function softMint(colors: ThemeColors) {
  return colors.statusBar === 'dark' ? 'rgba(178,213,184,0.12)' : 'rgba(215,239,219,0.42)';
}

function formatShortDate(date: Date | null) {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

export function AppHeaderV2({
  onProfilePress,
  onDemoInfoPress,
  dataMode,
  onDataModeChange,
  timeRange,
  customRange,
  onTimeRangeSelect,
}: AppHeaderV2Props) {
  const { colors, isDark, toggle } = useTheme();
  const iconColor = colors.text;

  return (
    <View
      style={[
        styles.root,
        {
          borderBottomColor: colors.borderSubtle,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandName, { color: colors.text }]}>
              One L<Text style={{ color: colors.scoreStrong }}>1</Text>fe
            </Text>
            <Text style={[styles.brandSub, { color: colors.textSubtle }]}>
              {prototypeCopy.prototypeSub}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={onDemoInfoPress}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="About demo data"
              accessibilityRole="button"
              hitSlop={8}
            >
              <IconInfo color={iconColor} />
            </Pressable>
            <Pressable
              onPress={toggle}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              accessibilityRole="button"
              hitSlop={8}
            >
              {isDark ? <IconSun color={iconColor} /> : <IconMoon color={iconColor} />}
            </Pressable>
            <Pressable
              onPress={onProfilePress}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              hitSlop={8}
            >
              <IconProfile color={iconColor} />
            </Pressable>
          </View>
        </View>

        <View style={styles.controlRow}>
          <View
            style={[
              styles.modeToggle,
              { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
            ]}
            accessibilityRole="tablist"
          >
            {(['user', 'demo'] as const).map((mode) => {
              const active = dataMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => onDataModeChange(mode)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.modeButton,
                    active && { backgroundColor: colors.surfaceElevated, borderColor: colors.accentBorder },
                  ]}
                >
                  <Text style={[styles.modeButtonText, { color: active ? colors.text : colors.textSubtle }]}>
                    {mode === 'user' ? 'User Data' : 'Demo'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <CompactRangeDropdown
            value={timeRange}
            customRange={customRange}
            onSelect={onTimeRangeSelect}
            colors={colors}
          />
        </View>
      </View>
    </View>
  );
}

function CompactRangeDropdown({
  value,
  customRange,
  onSelect,
  colors,
}: {
  value: TimeRange;
  customRange: CustomRange;
  onSelect: (range: TimeRange) => void;
  colors: ThemeColors;
}) {
  const [open, setOpen] = useState(false);
  const [menuY, setMenuY] = useState(0);
  const triggerRef = useRef<View>(null);

  const customLabel =
    customRange.start && customRange.end
      ? `${formatShortDate(customRange.start)}–${formatShortDate(customRange.end)}`
      : 'Custom';
  const activeLabel = value === 'custom' ? customLabel : TIME_RANGE_LABELS[value];

  function handleOpen() {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((_x, y, _w, h) => {
        setMenuY(y + h + 4);
        setOpen(true);
      });
    } else {
      setMenuY(100);
      setOpen(true);
    }
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={dropStyles.triggerWrap}>
        <Pressable
          onPress={handleOpen}
          style={[
            dropStyles.trigger,
            {
              backgroundColor: softMint(colors),
              borderColor: colors.accentBorder,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Time range: ${activeLabel}. Tap to change.`}
          accessibilityState={{ expanded: open }}
        >
          <Text style={[dropStyles.triggerText, { color: colors.text }]}>{activeLabel}</Text>
          <Text style={[dropStyles.chevron, { color: colors.textSubtle }]}>{open ? '▴' : '▾'}</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={dropStyles.backdrop}>
            <TouchableWithoutFeedback onPress={() => { /* absorb */ }}>
              <View
                style={[
                  dropStyles.menu,
                  {
                    top: menuY,
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                {TIME_RANGE_OPTIONS.map((opt) => {
                  const active = value === opt;
                  const optLabel = opt === 'custom' ? customLabel : TIME_RANGE_LABELS[opt];
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        onSelect(opt);
                        setOpen(false);
                      }}
                      style={[
                        dropStyles.option,
                        active && { backgroundColor: softMint(colors) },
                      ]}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          dropStyles.optionText,
                          { color: active ? colors.text : colors.textMuted },
                          active && { fontWeight: '800' },
                        ]}
                      >
                        {optLabel}
                      </Text>
                      {active ? (
                        <Text style={[dropStyles.checkmark, { color: colors.scoreStrong }]}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const dropStyles = StyleSheet.create({
  triggerWrap: {
    flex: 1,
  },
  trigger: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  chevron: {
    fontSize: typography.micro,
    fontWeight: '800',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: layout.screenPaddingH,
    minWidth: 160,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  optionText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  checkmark: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  inner: {
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeToggle: {
    width: 156,
    minHeight: 42,
    flexDirection: 'row',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 3,
  },
  modeButton: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
