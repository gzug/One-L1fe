/**
 * CoachingCard — Recommendation card
 *
 * Implements the V1 Recommendation Contract in compact form:
 *   title   → direct recommendation
 *   source  → evidence source chip
 *   reason  → one-line evidence summary
 *   action  → bounded next step
 *   scope   → explicit scope label
 *
 * Icons are primitive SVG shapes (no font dependency, guaranteed visible
 * on Android in both light and dark mode).
 *
 * Wording rules: no medical claim, no "must", no "guaranteed improvement",
 * no fake live-sync claim.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { NextAction } from '../../../v1-marathon/src/data/demoData';

function IconMoon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M11 3 C7.13 3 4 6.13 4 10 C4 13.87 7.13 17 11 17 C12.62 17 14.1 16.42 15.25 15.45 C14.48 15.8 13.62 16 12.7 16 C9.28 16 6.5 13.22 6.5 9.8 C6.5 7.02 8.23 4.65 10.7 3.7 C10.47 3.7 10.24 3.7 11 3Z"
        fill={color}
      />
    </Svg>
  );
}

function IconSpeedometer({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M4 13 C4 8.58 7.58 5 12 5 C16.42 5 20 8.58 20 13"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M12 13 L8 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={13} r={1.5} fill={color} />
    </Svg>
  );
}

function IconFlask({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M8 3 L8 10 L4.5 16 C4 17 4.5 18 6 18 L16 18 C17.5 18 18 17 17.5 16 L14 10 L14 3"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 3 L15 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M5.5 15 L16.5 15"
        stroke={color}
        strokeWidth={1.2}
        strokeOpacity={0.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconSync({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M4 11 C4 7.13 7.13 4 11 4 C13.76 4 16.15 5.56 17.36 7.88"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M18 11 C18 14.87 14.87 18 11 18 C8.24 18 5.85 16.44 4.64 14.12"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Polygon points="15,5 18,8 18,5" fill={color} />
      <Polygon points="7,17 4,14 4,17" fill={color} />
    </Svg>
  );
}

const ICON_COMPONENTS: Record<NextAction['iconKey'], React.FC<{ color: string }>> = {
  moon:        IconMoon,
  speedometer: IconSpeedometer,
  flask:       IconFlask,
  sync:        IconSync,
};

function impactTagColors(
  impactKey: NextAction['impactKey'],
  colors: ThemeColors,
): { bg: string; text: string } {
  switch (impactKey) {
    case 'recovery': return { bg: colors.accentSoft,    text: colors.accent };
    case 'training': return { bg: colors.warningSoft,   text: colors.warning };
    case 'data':     return { bg: colors.progressTrack, text: colors.textMuted };
  }
}

type Props = { action: NextAction };

export function CoachingCard({ action }: Props) {
  const { colors } = useTheme();
  const s   = createStyles(colors);
  const tag = impactTagColors(action.impactKey, colors);
  const IconComponent = ICON_COMPONENTS[action.iconKey];

  return (
    <View style={s.card}>
      <View style={s.iconBare}>
        <IconComponent color={colors.accent} />
      </View>

      <View style={s.content}>
        <Text style={s.title} numberOfLines={2}>{action.title}</Text>

        <View style={s.sourceChipWrap}>
          <View style={[s.sourceDot, { backgroundColor: colors.textSubtle }]} />
          <Text style={s.sourceChip}>{action.sourceChip}</Text>
        </View>

        <Text style={s.reason} numberOfLines={2}>
          <Text style={s.reasonLead}>Why · </Text>{action.reason}
        </Text>

        <Text style={s.actionText} numberOfLines={2}>
          <Text style={s.actionLead}>Try · </Text>{action.action}
        </Text>

        <View style={s.chipRow}>
          <View style={[s.tag, { backgroundColor: tag.bg }]}>
            <Text style={[s.tagText, { color: tag.text }]}>{action.impact}</Text>
          </View>
          <Text style={s.scopeText} numberOfLines={1}>{action.scope}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    iconBare: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 2,
    },
    content: { flex: 1, gap: 5 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      lineHeight: lineHeights.bodySmall,
      letterSpacing: -0.1,
    },
    sourceChipWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sourceDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    sourceChip: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    reason: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    reasonLead: {
      color: colors.textSubtle,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      fontSize: typography.micro,
    },
    actionText: {
      color: colors.text,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    actionLead: {
      color: colors.accent,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      fontSize: typography.micro,
    },
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    tag: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    tagText: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    scopeText: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      flexShrink: 1,
      fontStyle: 'italic',
    },
  });
}
