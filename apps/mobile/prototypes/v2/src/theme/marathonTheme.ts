// One L1fe — V2 — Design tokens
// Single source of truth for Android and Web in the v2 workspace.

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
};

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
  scoreStrong:      '#4F9A66',
  scoreStrongSoft:  'rgba(148,207,160,0.18)',
  scoreSteady:      '#5F8F68',
  scoreSteadySoft:  'rgba(178,213,184,0.18)',
  scoreSoft:        '#78957D',
  scoreSoftSoft:    'rgba(199,223,204,0.18)',
  scoreLow:         '#8FA394',
  scoreLowSoft:     'rgba(215,239,219,0.20)',
  ringTrack:        '#EDE8E2',
  ringProgress:     '#C4612C',
  progressTrack:    '#EDE8E2',
  profileSectionBg: '#FFFFFF',
  profileRowBorder: 'rgba(60,40,20,0.06)',
  demoBanner:       '#FEF7F2',
  demoBannerBorder: 'rgba(196,97,44,0.18)',
  statusBar:        'dark',
};

export const darkColors: ThemeColors = {
  background:       '#0A0A0B',
  surface:          '#111113',
  surfaceElevated:  '#141416',
  border:           'rgba(255,255,255,0.07)',
  borderSubtle:     'rgba(255,255,255,0.035)',
  text:             '#F2EFEA',
  textMuted:        '#A8A29A',
  textSubtle:       '#6E6862',
  accent:           '#E07A45',
  accentBorder:     'rgba(224,122,69,0.32)',
  accentSoft:       'rgba(224,122,69,0.10)',
  positive:         '#5BAE7C',
  warning:          '#D69846',
  warningSoft:      'rgba(214,152,70,0.12)',
  danger:           '#C25A5A',
  scoreStrong:      '#94CFA0',
  scoreStrongSoft:  'rgba(148,207,160,0.16)',
  scoreSteady:      '#B2D5B8',
  scoreSteadySoft:  'rgba(178,213,184,0.14)',
  scoreSoft:        '#C7DFCC',
  scoreSoftSoft:    'rgba(199,223,204,0.12)',
  scoreLow:         '#A8BAAC',
  scoreLowSoft:     'rgba(215,239,219,0.10)',
  ringTrack:        '#1F1F22',
  ringProgress:     '#E07A45',
  progressTrack:    '#1F1F22',
  profileSectionBg: '#141416',
  profileRowBorder: 'rgba(255,255,255,0.05)',
  demoBanner:       '#161616',
  demoBannerBorder: 'rgba(224,122,69,0.22)',
  statusBar:        'light',
};
