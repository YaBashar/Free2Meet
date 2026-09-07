/**
 * Navigation and semantic colour theme
 *
 * Owns the light/dark colour values that NativeWind CSS variables, React
 * Navigation, and `useThemeColors()` share. Does not apply styles to screens.
 */

import { DarkTheme, DefaultTheme, type Theme } from "expo-router/react-navigation";

export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

/**
 * Semantic colours mapped from the web palette (marian / delft / byzantine).
 * Screens should consume these through Tailwind tokens or `useThemeColors()`.
 */
export const THEME: Record<ThemeMode, ThemeColors> = {
  light: {
    background: "hsl(231 52% 95%)",
    foreground: "hsl(230 50% 25%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(230 50% 25%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(230 50% 25%)",
    primary: "hsl(230 50% 50%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(229 53% 90%)",
    secondaryForeground: "hsl(230 50% 25%)",
    muted: "hsl(229 53% 90%)",
    mutedForeground: "hsl(230 50% 35%)",
    accent: "hsl(230 50% 70%)",
    accentForeground: "hsl(230 50% 25%)",
    destructive: "hsl(0 84.2% 60.2%)",
    border: "hsl(230 50% 25%)",
    input: "hsl(230 50% 25%)",
    ring: "hsl(230 50% 50%)",
    radius: "0.625rem",
    chart1: "hsl(230 50% 50%)",
    chart2: "hsl(230 50% 70%)",
    chart3: "hsl(230 50% 35%)",
    chart4: "hsl(229 53% 90%)",
    chart5: "hsl(230 50% 25%)",
  },
  dark: {
    background: "hsl(230 50% 50%)",
    foreground: "hsl(0 0% 100%)",
    card: "hsl(230 50% 25%)",
    cardForeground: "hsl(0 0% 100%)",
    popover: "hsl(230 50% 25%)",
    popoverForeground: "hsl(0 0% 100%)",
    primary: "hsl(230 50% 70%)",
    primaryForeground: "hsl(230 50% 25%)",
    secondary: "hsl(230 50% 35%)",
    secondaryForeground: "hsl(231 52% 95%)",
    muted: "hsl(230 50% 35%)",
    mutedForeground: "hsl(229 53% 90%)",
    accent: "hsl(230 50% 35%)",
    accentForeground: "hsl(0 0% 100%)",
    destructive: "hsl(0 70.9% 59.4%)",
    border: "hsl(230 50% 70%)",
    input: "hsl(230 50% 70%)",
    ring: "hsl(230 50% 70%)",
    radius: "0.625rem",
    chart1: "hsl(230 50% 70%)",
    chart2: "hsl(231 52% 95%)",
    chart3: "hsl(229 53% 90%)",
    chart4: "hsl(230 50% 35%)",
    chart5: "hsl(230 50% 25%)",
  },
};

export const NAV_THEME: Record<ThemeMode, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.background,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.background,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
