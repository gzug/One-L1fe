// One L1fe — v2 design tokens
// Single source of truth for brand, semantic color, and layout constants.
// Components import tokens only via ThemeColors (useTheme) — not directly from here.

export const SCORE_CARD_SPLIT_WIDTH = 390;

export const v2LightTokens = {
  background:     '#F8F9F7',
  surface:        '#FFFFFF',
  surfaceSoft:    '#EEF3F0',
  textPrimary:    '#111715',
  textSecondary:  '#69746F',
  borderSubtle:   '#DDE6E2',
  brandGreen:     '#31796D',
  brandGreenDark: '#235F56',
  brandGreenSoft: '#E7F1EE',
  recovery:       '#31796D',
  activity:       '#5D9278',
  testResults:    '#4D8A91',
  disabled:       '#AEB7B2',
} as const;

export const v2DarkTokens = {
  background:     '#0E1110',
  surface:        '#171B19',
  surfaceSoft:    '#202622',
  textPrimary:    '#F1F4F0',
  textSecondary:  '#AAB4AE',
  borderSubtle:   '#303A35',
  brandGreen:     '#5EA99A',
  brandGreenDark: '#9BCFC4',
  brandGreenSoft: '#1D302B',
  recovery:       '#6CB8A9',
  activity:       '#82AF95',
  testResults:    '#73AEB5',
  disabled:       '#737E78',
} as const;
