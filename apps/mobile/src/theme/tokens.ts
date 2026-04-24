// Design tokens for One L1fe.
//
// Aligned with the v0.2 UI/UX rules: warm off-white base, soft accents,
// 8-point spacing, constrained type scale, subtle shadows. Dark-mode palette
// is prepared but the app currently renders only `light` until a theme
// switcher is wired up.

export type DotColorKey = 'health' | 'nutrition' | 'mind_and_sleep' | 'activity';

export interface DotPalette {
  accent: string;
  tint: string;
}

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceSoft: string;
  borderSoft: string;
  shadow: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  warmCoral: string;
  softApricot: string;
  warmPink: string;
  softViolet: string;
  softBlue: string;
  softGreen: string;
  amber: string;

  heroGradient: readonly [string, string, string];

  dot: Record<DotColorKey, DotPalette>;
}

export const lightColors: ColorPalette = {
  background: '#FAF7F1',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF9F2',
  borderSoft: '#E8DED2',
  shadow: '#1A1A1A',

  textPrimary: '#172126',
  textSecondary: '#667074',
  textMuted: '#8C9296',
  textInverse: '#FFFFFF',

  warmCoral: '#FF7A45',
  softApricot: '#FFC47A',
  warmPink: '#F95F62',
  softViolet: '#7B6CFF',
  softBlue: '#5CA9E6',
  softGreen: '#54B89A',
  amber: '#E8A94D',

  heroGradient: ['#FFC47A', '#FF7A45', '#F95F62'],

  dot: {
    health: { accent: '#54B89A', tint: '#E8F6F1' },
    nutrition: { accent: '#E8A94D', tint: '#FFF3DD' },
    mind_and_sleep: { accent: '#7B6CFF', tint: '#F0EEFF' },
    activity: { accent: '#5CA9E6', tint: '#EAF5FC' },
  },
};

// Dark palette — prepared, not yet active. Gradient saturation is reduced so
// the hero glow does not feel aggressive at night.
export const darkColors: ColorPalette = {
  background: '#111315',
  surface: '#1A1D20',
  surfaceSoft: '#22262A',
  borderSoft: '#30363A',
  shadow: '#000000',

  textPrimary: '#F4F1EA',
  textSecondary: '#B8BEC3',
  textMuted: '#858C92',
  textInverse: '#111315',

  warmCoral: '#FF8A5C',
  softApricot: '#E9A85F',
  warmPink: '#D85F72',
  softViolet: '#8A7CFF',
  softBlue: '#6FB6EA',
  softGreen: '#62C0A4',
  amber: '#D69A44',

  heroGradient: ['#E9A85F', '#FF8A5C', '#D85F72'],

  dot: {
    health: { accent: '#62C0A4', tint: '#1E2A27' },
    nutrition: { accent: '#D69A44', tint: '#2A2418' },
    mind_and_sleep: { accent: '#8A7CFF', tint: '#221F33' },
    activity: { accent: '#6FB6EA', tint: '#1A2430' },
  },
};

// 8-point spacing scale — use the named steps, do not introduce ad-hoc values.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  section: 48,
  hero: 64,
} as const;

export const radius = {
  chip: 16,
  input: 24,
  card: 28,
  cardLarge: 32,
  pill: 999,
} as const;

// Type scale — paired with `type.weight`. Per spec: no more than five
// active sizes may appear on a single screen.
export const type = {
  size: {
    heroScore: 96,
    heroScoreDenom: 30,
    dotScore: 22,
    greetingName: 34,
    greetingLine: 24,
    cardTitle: 18,
    body: 15,
    meta: 13,
    disclaimer: 12,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
  lineHeight: {
    tight: 1.15,
    body: 1.4,
    meta: 1.35,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: lightColors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  hero: {
    shadowColor: lightColors.warmCoral,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  soft: {
    shadowColor: lightColors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
} as const;

export const touchTarget = {
  minimum: 44,
  preferred: 48,
} as const;

// Single accessor used everywhere so a future theme switch only touches
// this file. Dark mode is wired but not yet exposed in the app shell.
export const colors = lightColors;
