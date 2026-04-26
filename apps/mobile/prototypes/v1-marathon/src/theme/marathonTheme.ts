// One L1fe — V1 Marathon — Design tokens

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

// --- Color palettes ---------------------------------------------------

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
  // Accent (apricot)
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

export const lightColors: ThemeColors = {
  background:       '#FAF8F5',   // warm cream
  surface:          '#F5F2EE',   // slightly cooler cream
  surfaceElevated:  '#FFFFFF',   // white card
  border:           '#E8E3DC',   // warm grey, hairline
  borderSubtle:     '#F0EDE8',   // nearly invisible
  text:             '#1A1714',   // near-black warm
  textMuted:        '#5C554E',   // warm medium grey
  textSubtle:       '#9B948C',   // muted labels
  accent:           '#C4622D',   // apricot / terracotta
  accentBorder:     '#E8C4A8',   // pale apricot
  accentSoft:       '#FDF3EC',   // near-white apricot tint
  positive:         '#3D7A5C',   // muted mint-green
  warning:          '#B07030',   // muted amber
  danger:           '#9B3A3A',   // muted red
  ringTrack:        '#EDE8E2',
  ringProgress:     '#C4622D',
  progressTrack:    '#EDE8E2',
  profileSectionBg: '#FFFFFF',
  profileRowBorder: '#F0EDE8',
  demoBanner:       '#FDF6F0',
  demoBannerBorder: '#EDD5C0',
  statusBar:        'dark',
};

export const darkColors: ThemeColors = {
  background:       '#141210',   // warm near-black
  surface:          '#1C1A17',   // barely-lifted surface
  surfaceElevated:  '#211F1B',   // card surface
  border:           '#2E2B27',   // subtle warm border
  borderSubtle:     '#242220',   // nearly invisible
  text:             '#F0EDE8',   // warm off-white
  textMuted:        '#A89F96',   // warm medium grey
  textSubtle:       '#6B6460',   // muted labels
  accent:           '#D4724A',   // slightly lighter apricot for dark
  accentBorder:     '#4A3020',   // dark apricot border
  accentSoft:       '#261A12',   // dark apricot bg
  positive:         '#4D9970',   // lifted mint for dark
  warning:          '#C08040',   // lifted amber for dark
  danger:           '#B84E4E',   // lifted red for dark
  ringTrack:        '#2A2723',
  ringProgress:     '#D4724A',
  progressTrack:    '#2A2723',
  profileSectionBg: '#1C1A17',
  profileRowBorder: '#242220',
  demoBanner:       '#1E1B17',
  demoBannerBorder: '#3A2E22',
  statusBar:        'light',
};
