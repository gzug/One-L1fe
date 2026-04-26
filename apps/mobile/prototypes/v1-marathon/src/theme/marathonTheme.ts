// ─── Static tokens (theme-independent) ──────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  heroName: 28,
  heroSub: 13,
  heroInterpretation: 21,
  title: 20,
  subtitle: 17,
  body: 15,
  bodySmall: 13,
  caption: 12,
  micro: 11,
} as const;

export const lineHeights = {
  heroInterpretation: 28,
  body: 22,
  bodySmall: 19,
  caption: 17,
} as const;

export const layout = {
  maxWidth: 430,
  screenPaddingH: 16,
} as const;

// Warm palette only — no blue
export const segmentColors = ['#EFA264', '#5DB88A', '#E8A84A', '#C4A882'] as const;

// ─── Dark palette ───────────────────────────────────────────────────────
export const darkColors = {
  scheme: 'dark' as const,
  background: '#0E0D0B',
  surface: '#181510',
  surfaceElevated: '#201D17',
  border: '#2C2720',
  borderSubtle: '#221F19',
  text: '#F0E8DE',
  textMuted: '#A8A096',
  textSubtle: '#65605A',
  accent: '#EFA264',
  accentSoft: 'rgba(239,162,100,0.10)',
  accentBorder: 'rgba(239,162,100,0.26)',
  positive: '#5DB88A',
  positiveSoft: 'rgba(93,184,138,0.10)',
  positiveBorder: 'rgba(93,184,138,0.24)',
  positiveTint: 'rgba(93,184,138,0.06)',
  warning: '#E8A84A',
  warningSoft: 'rgba(232,168,74,0.10)',
  warningBorder: 'rgba(232,168,74,0.24)',
  warningTint: 'rgba(232,168,74,0.05)',
  danger: '#E07A6A',
  demoBanner: 'rgba(239,162,100,0.06)',
  demoBannerBorder: 'rgba(239,162,100,0.14)',
  progressTrack: 'rgba(255,255,255,0.06)',
  ringTrack: 'rgba(255,255,255,0.08)',
  ringProgress: '#EFA264',
  coachPrimaryTint: 'rgba(239,162,100,0.04)',
  coachSupportTint: 'rgba(93,184,138,0.04)',
  coachContextTint: 'transparent',
  profileSectionBg: '#181510',
  profileRowBorder: '#221F19',
  sourceBadgeBg: 'rgba(239,162,100,0.07)',
  sourceBadgeBorder: 'rgba(239,162,100,0.18)',
  statusBar: 'light' as const,
};

// ─── Light palette ───────────────────────────────────────────────────────
export const lightColors = {
  scheme: 'light' as const,
  background: '#F7F3EE',
  surface: '#FFFFFF',
  surfaceElevated: '#FDF9F5',
  border: '#E6DDD4',
  borderSubtle: '#EDE7DF',
  text: '#1C1714',
  textMuted: '#6B5F56',
  textSubtle: '#A8998E',
  accent: '#D4722A',
  accentSoft: 'rgba(212,114,42,0.08)',
  accentBorder: 'rgba(212,114,42,0.22)',
  positive: '#2E8A5E',
  positiveSoft: 'rgba(46,138,94,0.08)',
  positiveBorder: 'rgba(46,138,94,0.22)',
  positiveTint: 'rgba(46,138,94,0.05)',
  warning: '#B87820',
  warningSoft: 'rgba(184,120,32,0.08)',
  warningBorder: 'rgba(184,120,32,0.22)',
  warningTint: 'rgba(184,120,32,0.04)',
  danger: '#C0472E',
  demoBanner: 'rgba(212,114,42,0.05)',
  demoBannerBorder: 'rgba(212,114,42,0.16)',
  progressTrack: 'rgba(0,0,0,0.07)',
  ringTrack: 'rgba(0,0,0,0.08)',
  ringProgress: '#D4722A',
  coachPrimaryTint: 'rgba(212,114,42,0.04)',
  coachSupportTint: 'rgba(46,138,94,0.04)',
  coachContextTint: 'transparent',
  profileSectionBg: '#FFFFFF',
  profileRowBorder: '#EDE7DF',
  sourceBadgeBg: 'rgba(212,114,42,0.06)',
  sourceBadgeBorder: 'rgba(212,114,42,0.18)',
  statusBar: 'dark' as const,
};

export type ThemeColors = typeof darkColors;

// Legacy shim
export const marathonTheme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  lineHeights,
  layout,
  segmentColors,
} as const;
