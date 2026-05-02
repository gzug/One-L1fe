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
  recovery:          string;
  activity:          string;
  testResults:       string;
  disabled:          string;
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
  accent:           '#C4612C',
  accentBorder:     'rgba(196,97,44,0.25)',
  accentSoft:       'rgba(196,97,44,0.06)',
  positive:         '#1DAB68',
  warning:          '#A86E28',
  warningSoft:      'rgba(168,110,40,0.08)',
  danger:           '#993636',
  scoreStrong:      v2LightTokens.brandGreen,
  scoreStrongSoft:  v2LightTokens.brandGreenSoft,
  scoreSteady:      '#2FAD6A',
  scoreSteadySoft:  'rgba(47,173,106,0.12)',
  scoreSoft:        '#5CC58D',
  scoreSoftSoft:    'rgba(92,197,141,0.14)',
  scoreLow:         '#8DCBA8',
  scoreLowSoft:     'rgba(141,203,168,0.16)',
  ringTrack:        v2LightTokens.borderSubtle,
  ringProgress:     v2LightTokens.brandGreen,
  progressTrack:    v2LightTokens.borderSubtle,
  profileSectionBg: v2LightTokens.surface,
  profileRowBorder: 'rgba(17,24,32,0.05)',
  demoBanner:       '#FEF7F2',
  demoBannerBorder: 'rgba(196,97,44,0.18)',
  statusBar:        'dark',
  brandGreen:       v2LightTokens.brandGreen,
  brandGreenDark:   v2LightTokens.brandGreenDark,
  brandGreenSoft:   v2LightTokens.brandGreenSoft,
  recovery:         v2LightTokens.recovery,
  activity:         v2LightTokens.activity,
  testResults:      v2LightTokens.testResults,
  disabled:         v2LightTokens.disabled,
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
  accent:           '#E07A45',
  accentBorder:     'rgba(224,122,69,0.32)',
  accentSoft:       'rgba(224,122,69,0.10)',
  positive:         '#1DBC74',
  warning:          '#D69846',
  warningSoft:      'rgba(214,152,70,0.12)',
  danger:           '#C25A5A',
  scoreStrong:      v2DarkTokens.brandGreen,
  scoreStrongSoft:  v2DarkTokens.brandGreenSoft,
  scoreSteady:      '#2FAD6A',
  scoreSteadySoft:  'rgba(47,173,106,0.14)',
  scoreSoft:        '#5CC58D',
  scoreSoftSoft:    'rgba(92,197,141,0.12)',
  scoreLow:         '#8DCBA8',
  scoreLowSoft:     'rgba(141,203,168,0.10)',
  ringTrack:        v2DarkTokens.borderSubtle,
  ringProgress:     v2DarkTokens.brandGreen,
  progressTrack:    v2DarkTokens.borderSubtle,
  profileSectionBg: v2DarkTokens.surfaceSoft,
  profileRowBorder: 'rgba(244,246,242,0.05)',
  demoBanner:       '#161B17',
  demoBannerBorder: 'rgba(224,122,69,0.22)',
  statusBar:        'light',
  brandGreen:       v2DarkTokens.brandGreen,
  brandGreenDark:   v2DarkTokens.brandGreenDark,
  brandGreenSoft:   v2DarkTokens.brandGreenSoft,
  recovery:         v2DarkTokens.recovery,
  activity:         v2DarkTokens.activity,
  testResults:      v2DarkTokens.testResults,
  disabled:         v2DarkTokens.disabled,
};
