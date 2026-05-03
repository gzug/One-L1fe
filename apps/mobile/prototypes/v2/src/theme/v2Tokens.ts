// One L1fe — v2 design tokens
// Single source of truth for brand, semantic color, and layout constants.
// Components import tokens only via ThemeColors (useTheme) — not directly from here.

export const SCORE_CARD_SPLIT_WIDTH = 390;

export const v2LightTokens = {
  background:        '#F8F9F7',
  surface:           '#FFFFFF',
  surfaceSoft:       '#EEF3F0',
  textPrimary:       '#111715',
  textSecondary:     '#69746F',
  borderSubtle:      '#DDE6E2',
  brandGreen:        '#31796D',
  brandGreenDark:    '#235F56',
  brandGreenSoft:    '#E7F1EE',
  // Recovery family — cool blue (distinct from brandGreen)
  recovery:          '#2E7DAE',
  recoverySub1:      '#3A90C6', // sleep — lighter blue
  recoverySub2:      '#245E8C', // hrv — deeper blue
  recoverySub3:      '#1A4D75', // resting HR — darkest blue
  // Activity family — warm olive-green (clearly distinct from teal)
  activity:          '#6E8C4A',
  activitySub1:      '#7D9F56', // steps
  activitySub2:      '#5A7A3A', // training
  activitySub3:      '#8FAD65', // calories
  // Test Results family — blue-teal
  testResults:       '#4D8A91',
  testResultsSub1:   '#5A9BA3', // lighter
  testResultsSub2:   '#3D7A82', // deeper
  disabled:          '#AEB7B2',
  tooltipDismiss:    '#C25A5A',
} as const;

export const v2DarkTokens = {
  background:        '#0E1110',
  surface:           '#171B19',
  surfaceSoft:       '#202622',
  textPrimary:       '#F1F4F0',
  textSecondary:     '#AAB4AE',
  borderSubtle:      '#303A35',
  brandGreen:        '#5EA99A',
  brandGreenDark:    '#9BCFC4',
  brandGreenSoft:    '#1D302B',
  // Recovery family — cool blue (distinct from brandGreen)
  recovery:          '#6EB5D8',
  recoverySub1:      '#82C8E8', // sleep
  recoverySub2:      '#5AA0C8', // hrv
  recoverySub3:      '#4A8CB4', // resting HR
  // Activity family — warm olive-green
  activity:          '#9DB86E',
  activitySub1:      '#AACA7C', // steps
  activitySub2:      '#8CA85C', // training
  activitySub3:      '#BDD58A', // calories
  // Test Results family — blue-teal
  testResults:       '#73AEB5',
  testResultsSub1:   '#85BFC7', // lighter
  testResultsSub2:   '#619FA8', // deeper
  disabled:          '#737E78',
  tooltipDismiss:    '#D47878',
} as const;
