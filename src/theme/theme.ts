import { Platform } from 'react-native';

// Calm, worshipful palette on purpose: this app should feel like a quiet
// place to pray, not a game. No neon, no clutter — light or dark.
export type Scheme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentId = 'blue' | 'gold' | 'green' | 'purple' | 'terracotta';

export interface AccentDef {
  id: AccentId;
  label: string;
  light: string;
  dark: string;
}

// Reused as the frame colors too (src/data/frames.ts) so the accent you pick
// for the whole app and the frame around your symbol speak the same language.
export const ACCENTS: AccentDef[] = [
  { id: 'blue', label: 'Living Water', light: '#2B4C7E', dark: '#7EA8E0' },
  { id: 'gold', label: 'Grace', light: '#A9791F', dark: '#D9A64E' },
  { id: 'green', label: 'New Growth', light: '#3E7C59', dark: '#6FBE8F' },
  { id: 'purple', label: 'Royal', light: '#5B3A8E', dark: '#B497E0' },
  { id: 'terracotta', label: "Refiner's Fire", light: '#B4552F', dark: '#E0824F' },
];

export function getAccent(id: AccentId): AccentDef {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  primary: string;
  primaryText: string;
  primarySoft: string; // tinted background, e.g. an active/selected pill
  successSoft: string; // tinted background for a completed/done state
  accent: string; // seeds/streak-flame color, kept separate from primary
  text: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
  white: string;
}

export function getColors(scheme: Scheme, accentId: AccentId): ThemeColors {
  const accent = getAccent(accentId);
  const primary = accent[scheme];

  if (scheme === 'dark') {
    return {
      background: '#12151B',
      surface: '#1B2028',
      surfaceRaised: '#232934',
      primary,
      primaryText: '#0E1116',
      primarySoft: '#232E42',
      successSoft: '#1E3227',
      accent: '#D9A64E',
      text: '#EDEFF3',
      textMuted: '#8D97A5',
      border: '#2B323D',
      success: '#5FBE86',
      danger: '#E0776C',
      white: '#FFFFFF',
    };
  }

  return {
    background: '#F7F5EF',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    primary,
    primaryText: '#FFFFFF',
    primarySoft: '#EEF2F8',
    successSoft: '#E7F3EC',
    accent: '#A9791F',
    text: '#25303B',
    textMuted: '#6B7686',
    border: '#E6E1D6',
    success: '#3E7C59',
    danger: '#B4534A',
    white: '#FFFFFF',
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export type Spacing = typeof spacing;
export type Radius = typeof radius;

export function getTypography(colors: ThemeColors) {
  return {
    title: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
    heading: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
    body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
    caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  };
}

// A soft, modern card lift — subtle on purpose, and dark mode leans on the
// border instead since shadows barely read on a dark background.
export function getCardShadow(scheme: Scheme) {
  if (scheme === 'dark') return {};
  return Platform.select({
    web: { boxShadow: '0 1px 4px rgba(37, 48, 59, 0.08)' } as const,
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  });
}
