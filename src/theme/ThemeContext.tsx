import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { getColors, getTypography, getCardShadow, spacing, radius, Scheme, ThemeColors } from './theme';

interface ThemeValue {
  scheme: Scheme;
  colors: ThemeColors;
  typography: ReturnType<typeof getTypography>;
  spacing: typeof spacing;
  radius: typeof radius;
  cardShadow: ReturnType<typeof getCardShadow>;
}

const ThemeCtx = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((s) => s.preferences.themeMode);
  const accentId = useAppStore((s) => s.preferences.accentId);

  const scheme: Scheme = themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const value = useMemo<ThemeValue>(() => {
    const colors = getColors(scheme, accentId);
    return {
      scheme,
      colors,
      typography: getTypography(colors),
      spacing,
      radius,
      cardShadow: getCardShadow(scheme),
    };
  }, [scheme, accentId]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
