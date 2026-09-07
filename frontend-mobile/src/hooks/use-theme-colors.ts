/**
 * Theme colour hook
 *
 * Exposes the active semantic colours as strings for native props that cannot
 * take a class name (icon colour, placeholder text). Screens should still
 * prefer Tailwind tokens for View and Text styling.
 */

import { useColorScheme } from "nativewind";

import { THEME, type ThemeColors } from "@/lib/theme";

/**
 * Returns the semantic colour palette for the current light or dark scheme.
 */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  return THEME[scheme];
}
