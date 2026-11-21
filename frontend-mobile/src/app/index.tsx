/**
 * Landing screen
 *
 * Unauthenticated entry point with brand welcome copy and links to sign up
 * and login. Auth forms live on their own routes under `screens/`.
 */

import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { COLORS, FONTS } from "@/lib/theme";

/** Welcome hero with Sign Up and Login actions. */
export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Free2Meet</Text>
      <Image
        accessibilityLabel="Free2Meet logo"
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.tagline}>Hangouts made easy — find a time that works for everyone.</Text>
      <Button onPress={() => router.push("/screens/signup")} style={styles.button}>
        Sign Up
      </Button>
      <Button onPress={() => router.push("/screens/login")} style={styles.button} variant="outline">
        Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: COLORS.foreground,
    fontFamily: FONTS.bold,
    fontSize: 36,
  },
  logo: {
    height: 112,
    width: 112,
  },
  tagline: {
    color: COLORS.mutedForeground,
    fontFamily: FONTS.regular,
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    alignSelf: "stretch",
  },
});
