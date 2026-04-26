// ─── Theme-independent static tokens ────────────────────────────────────────
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
  heroInterpretation: 22,
  title: 20,
  subtitle: 17,
  body: 15,
  bodySmall: 13,
  caption: 12,
  micro: 11,
} as const;

export const lineHeights = {
  heroInterpretation: 30,
  body: 22,
  bodySmall: 19,
  caption: 17,
} as const;

export const layout = {
  maxWidth: 430,
  screenPaddingH: 16,
} as const;

export const segmentColors = ['#EFA264', '#5DB88A', '#E8A84A', '#7FAFD4'] as const;

export type ThemeScheme = 'light' | 'dark';
export type StatusBarTone = 'light' | 'dark';

export type ThemeColors = {
  scheme: ThemeScheme;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  positive: string;
  positiveSoft: string;
  positiveBorder: string;
  positiveTint: string;
  warning: string;
  warningSoft: string;
  warningBorder: string;
  warningTint: string;
  danger: string;
  demoBanner: string;
  demoBannerBorder: string;
  progressTrack: string;
  coachPrimaryTint: string;
  coachSupportTint: string;
  coachContextTint: string;
  profileSectionBg: string;
  profileRowBorder: string;
  statusBar: StatusBarTone;
};

// ─── Color palettes ──────────────────────────────────────────────────────────

export const darkColors: ThemeColors = {
  scheme: 'dark',
  background: '#131210',
  surface: '#1C1915',
  surfaceElevated: '#242018',
  border: '#302B22',
  borderSubtle: '#252119',
  text: '#F2EAE0',
  textMuted: '#ADA69C',
  textSubtle: '#6A6460',
  accent: '#EFA264',
  accentSoft: 'rgba(239,162,100,0.12)',
  accentBorder: 'rgba(239,162,100,0.30)',
  positive: '#5DB88A',
  positiveSoft: 'rgba(93,184,138,0.10)',
  positiveBorder: 'rgba(93,184,138,0.26)',
  positiveTint: 'rgba(93,184,138,0.06)',
  warning: '#E8A84A',
  warningSoft: 'rgba(232,168,74,0.10)',
  warningBorder: 'rgba(232,168,74,0.26)',
  warningTint: 'rgba(232,168,74,0.05)',
  danger: '#E07A6A',
  demoBanner: 'rgba(239,162,100,0.07)',
  demoBannerBorder: 'rgba(239,162,100,0.16)',
  progressTrack: 'rgba(255,255,255,0.06)',
  coachPrimaryTint: 'rgba(239,162,100,0.05)',
  coachSupportTint: 'rgba(93,184,138,0.05)',
  coachContextTint: 'transparent',
  profileSectionBg: '#1C1915',
  profileRowBorder: '#252119',
  statusBar: 'light',
};

export const lightColors: ThemeColors = {
  scheme: 'light',
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
  demoBanner: 'rgba(212,114,42,0.06)',
  demoBannerBorder: 'rgba(212,114,42,0.18)',
  progressTrack: 'rgba(0,0,0,0.07)',
  coachPrimaryTint: 'rgba(212,114,42,0.04)',
  coachSupportTint: 'rgba(46,138,94,0.04)',
  coachContextTint: 'transparent',
  profileSectionBg: '#FFFFFF',
  profileRowBorder: '#EDE7DF',
  statusBar: 'dark',
};

// Legacy shim — keeps any missed static import alive during migration
export const marathonTheme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  lineHeights,
  layout,
  segmentColors,
} as const;
