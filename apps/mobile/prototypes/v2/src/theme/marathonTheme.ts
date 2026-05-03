// One L1fe — V2 — Design tokens
// Single source of truth for Android and Web in the v2 workspace.
import { v2DarkTokens, v2LightTokens } from './v2Tokens';

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 56,
} as const;

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  pill: 99,
} as const;

export const typography = {
  heroName:            26,
  heroSub:             12,
  heroInterpretation:  19,
  subtitle:            15,
  body:                14,
  bodySmall:           13,
  caption:             11,
  micro:               10,
} as const;

export const lineHeights = {
  heroInterpretation: 25,
  body:               21,
  bodySmall:          19,
  caption:            16,
} as const;

export const layout = {
  screenPaddingH: 18,
  maxWidth:       480,
} as const;

export type ThemeColors = {
  background:        string;
  surface:           string;
  surfaceElevated:   string;
  surfaceSoft:       string;
  border:            string;
  borderSubtle:      string;
  text:              string;
  textMuted:         string;
  textSubtle:        string;
  accent:            string;
  accentBorder:      string;
  accentSoft:        string;
  positive:          string;
  warning:           string;
  warningSoft:       string;
  danger:            string;
  scoreStrong:       string;
  scoreStrongSoft:   string;
  scoreSteady:       string;
  scoreSteadySoft:   string;
  scoreSoft:         string;
  scoreSoftSoft:     string;
  scoreLow:          string;
  scoreLowSoft:      string;
  ringTrack:         string;
  ringProgress:      string;
  progressTrack:     string;
  profileSectionBg:  string;
  profileRowBorder:  string;
  demoBanner:        string;
  demoBannerBorder:  string;
  statusBar:         'dark' | 'light';
  // v2 semantic tokens
  brandGreen:        string;
  brandGreenDark:    string;
  brandGreenSoft:    string;
  // Recovery family
  recovery:          string;
  recoverySub1:      string;
  recoverySub2:      string;
  recoverySub3:      string;
  // Activity family
  activity:          string;
  activitySub1:      string;
  activitySub2:      string;
  activitySub3:      string;
  // Test Results family
  testResults:       string;
  testResultsSub1:   string;
  testResultsSub2:   string;
  disabled:          string;
  tooltipDismiss:    string;
};

export const lightColors: ThemeColors = {
  background:       v2LightTokens.background,
  surface:          v2LightTokens.surface,
  surfaceElevated:  v2LightTokens.surface,
  surfaceSoft:      v2LightTokens.surfaceSoft,
  border:           'rgba(17,24,32,0.09)',
  borderSubtle:     v2LightTokens.borderSubtle,
  text:             v2LightTokens.textPrimary,
  textMuted:        '#485060',
  textSubtle:       v2LightTokens.textSecondary,
  accent:           v2LightTokens.brandGreen,
  accentBorder:     'rgba(49,121,109,0.22)',
  accentSoft:       'rgba(49,121,109,0.08)',
  positive:         v2LightTokens.brandGreen,
  warning:          '#9B7A3D',
  warningSoft:      'rgba(155,122,61,0.10)',
  danger:           '#993636',
  scoreStrong:      v2LightTokens.brandGreen,
  scoreStrongSoft:  v2LightTokens.brandGreenSoft,
  scoreSteady:      '#5D9278',
  scoreSteadySoft:  'rgba(93,146,120,0.13)',
  scoreSoft:        '#87B6A2',
  scoreSoftSoft:    'rgba(135,182,162,0.15)',
  scoreLow:         '#9DBBAE',
  scoreLowSoft:     'rgba(157,187,174,0.16)',
  ringTrack:        v2LightTokens.borderSubtle,
  ringProgress:     v2LightTokens.brandGreen,
  progressTrack:    v2LightTokens.borderSubtle,
  profileSectionBg: v2LightTokens.surface,
  profileRowBorder: 'rgba(17,24,32,0.05)',
  demoBanner:       '#F0F6F3',
  demoBannerBorder: 'rgba(49,121,109,0.16)',
  statusBar:        'dark',
  brandGreen:       v2LightTokens.brandGreen,
  brandGreenDark:   v2LightTokens.brandGreenDark,
  brandGreenSoft:   v2LightTokens.brandGreenSoft,
  recovery:         v2LightTokens.recovery,
  recoverySub1:     v2LightTokens.recoverySub1,
  recoverySub2:     v2LightTokens.recoverySub2,
  recoverySub3:     v2LightTokens.recoverySub3,
  activity:         v2LightTokens.activity,
  activitySub1:     v2LightTokens.activitySub1,
  activitySub2:     v2LightTokens.activitySub2,
  activitySub3:     v2LightTokens.activitySub3,
  testResults:      v2LightTokens.testResults,
  testResultsSub1:  v2LightTokens.testResultsSub1,
  testResultsSub2:  v2LightTokens.testResultsSub2,
  disabled:         v2LightTokens.disabled,
  tooltipDismiss:   v2LightTokens.tooltipDismiss,
};

export const darkColors: ThemeColors = {
  background:       v2DarkTokens.background,
  surface:          v2DarkTokens.surface,
  surfaceElevated:  v2DarkTokens.surfaceSoft,
  surfaceSoft:      v2DarkTokens.surfaceSoft,
  border:           'rgba(244,246,242,0.08)',
  borderSubtle:     v2DarkTokens.borderSubtle,
  text:             v2DarkTokens.textPrimary,
  textMuted:        '#C0C8C2',
  textSubtle:       v2DarkTokens.textSecondary,
  accent:           v2DarkTokens.brandGreen,
  accentBorder:     'rgba(94,169,154,0.28)',
  accentSoft:       'rgba(94,169,154,0.10)',
  positive:         v2DarkTokens.brandGreen,
  warning:          '#D69846',
  warningSoft:      'rgba(214,152,70,0.12)',
  danger:           '#C25A5A',
  scoreStrong:      v2DarkTokens.brandGreen,
  scoreStrongSoft:  v2DarkTokens.brandGreenSoft,
  scoreSteady:      '#82AF95',
  scoreSteadySoft:  'rgba(130,175,149,0.13)',
  scoreSoft:        '#99BDAE',
  scoreSoftSoft:    'rgba(153,189,174,0.11)',
  scoreLow:         '#7B9489',
  scoreLowSoft:     'rgba(123,148,137,0.10)',
  ringTrack:        v2DarkTokens.borderSubtle,
  ringProgress:     v2DarkTokens.brandGreen,
  progressTrack:    v2DarkTokens.borderSubtle,
  profileSectionBg: v2DarkTokens.surfaceSoft,
  profileRowBorder: 'rgba(244,246,242,0.05)',
  demoBanner:       '#161B17',
  demoBannerBorder: 'rgba(94,169,154,0.22)',
  statusBar:        'light',
  brandGreen:       v2DarkTokens.brandGreen,
  brandGreenDark:   v2DarkTokens.brandGreenDark,
  brandGreenSoft:   v2DarkTokens.brandGreenSoft,
  recovery:         v2DarkTokens.recovery,
  recoverySub1:     v2DarkTokens.recoverySub1,
  recoverySub2:     v2DarkTokens.recoverySub2,
  recoverySub3:     v2DarkTokens.recoverySub3,
  activity:         v2DarkTokens.activity,
  activitySub1:     v2DarkTokens.activitySub1,
  activitySub2:     v2DarkTokens.activitySub2,
  activitySub3:     v2DarkTokens.activitySub3,
  testResults:      v2DarkTokens.testResults,
  testResultsSub1:  v2DarkTokens.testResultsSub1,
  testResultsSub2:  v2DarkTokens.testResultsSub2,
  disabled:         v2DarkTokens.disabled,
  tooltipDismiss:   v2DarkTokens.tooltipDismiss,
};
