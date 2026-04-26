// One L1fe — V1 Marathon — Design tokens
// Single source of truth for both Android and Web.
// Platform-specific rendering fixes live in useWebBackground and
// component-level elevation only — not in token forks.

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
  background:       '#F9F7F4',   // warm cream — slightly deeper than pure white
  surface:          '#F3F0EB',   // one step below bg
  surfaceElevated:  '#FFFFFF',   // card surface
  border:           'rgba(60,40,20,0.10)',   // warm, very faint
  borderSubtle:     'rgba(60,40,20,0.055)',  // nearly invisible
  text:             '#1C1917',   // warm near-black
  textMuted:        '#5A5249',   // warm medium-dark
  textSubtle:       '#9A928A',   // quiet labels
  accent:           '#C4612C',   // apricot / terracotta — Android primary
  accentBorder:     'rgba(196,97,44,0.25)',
  accentSoft:       'rgba(196,97,44,0.06)',
  positive:         '#3A7A58',
  warning:          '#A86E28',
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
  background:       '#111009',   // deep warm black
  surface:          '#181611',   // one step up
  surfaceElevated:  '#1E1C16',   // card surface — close to bg, not loud
  border:           'rgba(255,240,200,0.08)',   // warm white, very faint
  borderSubtle:     'rgba(255,240,200,0.04)',
  text:             '#EDE8E0',   // warm off-white
  textMuted:        '#A89F95',   // warm mid-grey
  textSubtle:       '#6A6158',   // quiet labels
  accent:           '#D0683A',   // apricot lifted for dark contrast
  accentBorder:     'rgba(208,104,58,0.28)',
  accentSoft:       'rgba(208,104,58,0.09)',
  positive:         '#4A9468',
  warning:          '#BE8838',
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
