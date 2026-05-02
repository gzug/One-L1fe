// One L1fe — v2 design tokens
// Single source of truth for brand, semantic color, and layout constants.
// Components import tokens only via ThemeColors (useTheme) — not directly from here.

export const SCORE_CARD_SPLIT_WIDTH = 390;

export const v2LightTokens = {
  background:     '#FAF9F6',
  surface:        '#FFFFFF',
  surfaceSoft:    '#F3F1EC',
  textPrimary:    '#111820',
  textSecondary:  '#6F7782',
  borderSubtle:   '#E7E9E6',
  brandGreen:     '#1DBC74',
  brandGreenDark: '#159B60',
  brandGreenSoft: '#EAF8F1',
  recovery:       '#4FC58B',
  activity:       '#F59E3D',
  testResults:    '#27B7C8',
  disabled:       '#B8B8B2',
} as const;

export const v2DarkTokens = {
  background:     '#101512',
  surface:        '#171D19',
  surfaceSoft:    '#202721',
  textPrimary:    '#F4F6F2',
  textSecondary:  '#A9B0AA',
  borderSubtle:   '#2B332D',
  brandGreen:     '#1DBC74',
  brandGreenDark: '#159B60',
  brandGreenSoft: '#173D2B',
  recovery:       '#4FC58B',
  activity:       '#F2A24A',
  testResults:    '#34BFD0',
  disabled:       '#6E756F',
} as const;
