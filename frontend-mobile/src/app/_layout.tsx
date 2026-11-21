/**
 * Root layout
 *
 * Loads the Outfit fonts, provides auth and navigation theming, and renders
 * the screen stack. Does not render feature screens.
 */

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/lib/auth/auth-context";
import { FONT_ASSETS, FONTS, NAV_THEME } from "@/lib/theme";

/** Waits for fonts to resolve, then mounts the app shell. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: FONTS.medium },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
