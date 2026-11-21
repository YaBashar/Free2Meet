/**
 * App theme
 *
 * Owns the colour palette, font families, and React Navigation theme shared by
 * every screen's `StyleSheet`. Does not apply styles itself.
 */

import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { DefaultTheme, type Theme } from "expo-router/react-navigation";

/**
 * Semantic colours built from the brand palette:
 * ghost-white #ECEEF9 | lavender #D8DDF3 | byzantine-blue #4055BF
 * marian-blue #2D3C86 | delft-blue #202B60
 */
export const COLORS = {
  background: "#ECEEF9",
  foreground: "#202B60",
  card: "#FFFFFF",
  primary: "#4055BF",
  primaryForeground: "#FFFFFF",
  mutedForeground: "#2D3C86",
  border: "#202B60",
  destructive: "#EF4444",
} as const;

/** Outfit font family names for `fontFamily`. */
export const FONTS = {
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
} as const;

/** Font files keyed by their `FONTS` name, loaded by `useFonts` in the root layout. */
export const FONT_ASSETS = {
  [FONTS.regular]: Outfit_400Regular,
  [FONTS.medium]: Outfit_500Medium,
  [FONTS.bold]: Outfit_700Bold,
};

export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    background: COLORS.background,
    border: COLORS.border,
    card: COLORS.background,
    notification: COLORS.destructive,
    primary: COLORS.primary,
    text: COLORS.foreground,
  },
};
