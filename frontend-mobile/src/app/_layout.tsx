/**
 * Root layout
 *
 * Loads Outfit, NativeWind CSS, navigation theming, and the portal host used
 * by overlay components. Does not render feature screens.
 */

import "../../global.css";

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { PortalHost } from "@rn-primitives/portal";
import { Image } from "expo-image";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { cssInterop, useColorScheme } from "nativewind";
import { useEffect } from "react";
import { View } from "react-native";

import { NAV_THEME } from "@/lib/theme";

cssInterop(Image, { className: "style" });

SplashScreen.preventAutoHideAsync();

/** Holds the splash screen until fonts resolve, then mounts the app shell. */
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Outfit: Outfit_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const scheme = colorScheme === "dark" ? "dark" : "light";

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <View className={`flex-1 bg-background ${scheme === "dark" ? "dark" : ""}`}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}
