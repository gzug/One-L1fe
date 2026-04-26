// One L1fe — V1 Marathon — Design tokens
// Single source of truth for both Android and Web.

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

// --- Color palettes -------------------------------------------------------

export type ThemeColors = {
  // Backgrounds
  background:        string;
  surface:           string;
  surfaceElevated:   string;
  // Borders
  border:            string;
  borderSubtle:      string;
  // Text
  text:              string;
  textMuted:         string;
  textSubtle:        string;
  // Accent (apricot / terracotta)
  accent:            string;
  accentBorder:      string;
  accentSoft:        string;
  // Semantic
  positive:          string;
  warning:           string;
  warningSoft:       string;
  danger:            string;
  // Ring
  ringTrack:         string;
  ringProgress:      string;
  // Progress bars
  progressTrack:     string;
  // Profile
  profileSectionBg:  string;
  profileRowBorder:  string;
  // Demo banner
  demoBanner:        string;
  demoBannerBorder:  string;
  // Status bar style hint
  statusBar:         'dark' | 'light';
};

// Light — warm cream, white cards, terracotta accent
export const lightColors: ThemeColors = {
  background:       '#F9F7F4',
  surface:          '#F3F0EB',
  surfaceElevated:  '#FFFFFF',
  border:           'rgba(60,40,20,0.10)',
  borderSubtle:     'rgba(60,40,20,0.055)',
  text:             '#1C1917',
  textMuted:        '#5A5249',
  textSubtle:       '#9A928A',
  accent:           '#C4612C',
  accentBorder:     'rgba(196,97,44,0.25)',
  accentSoft:       'rgba(196,97,44,0.06)',
  positive:         '#3A7A58',
  warning:          '#A86E28',
  warningSoft:      'rgba(168,110,40,0.08)',
  danger:           '#993636',
  ringTrack:        '#EDE8E2',
  ringProgress:     '#C4612C',
  progressTrack:    '#EDE8E2',
  profileSectionBg: '#FFFFFF',
  profileRowBorder: 'rgba(60,40,20,0.06)',
  demoBanner:       '#FEF7F2',
  demoBannerBorder: 'rgba(196,97,44,0.18)',
  statusBar:        'dark',
};

// Dark — warm near-black, cards barely lifted, restrained accent
export const darkColors: ThemeColors = {
  background:       '#111009',
  surface:          '#181611',
  surfaceElevated:  '#1E1C16',
  border:           'rgba(255,240,200,0.08)',
  borderSubtle:     'rgba(255,240,200,0.04)',
  text:             '#EDE8E0',
  textMuted:        '#A89F95',
  textSubtle:       '#6A6158',
  accent:           '#D0683A',
  accentBorder:     'rgba(208,104,58,0.28)',
  accentSoft:       'rgba(208,104,58,0.09)',
  positive:         '#4A9468',
  warning:          '#BE8838',
  warningSoft:      'rgba(190,136,56,0.10)',
  danger:           '#B84848',
  ringTrack:        '#26231C',
  ringProgress:     '#D0683A',
  progressTrack:    '#26231C',
  profileSectionBg: '#1E1C16',
  profileRowBorder: 'rgba(255,240,200,0.05)',
  demoBanner:       '#1A1710',
  demoBannerBorder: 'rgba(208,104,58,0.20)',
  statusBar:        'light',
};
