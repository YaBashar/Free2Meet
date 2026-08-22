/**
 * Landing screen
 *
 * Unauthenticated entry point with brand welcome copy and links to sign up
 * and login. Auth forms live on their own routes under `screens/`.
 */

import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";

/** Welcome hero with Sign Up and Login actions. */
export default function LandingScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center gap-6">
            <Text className="text-center font-outfit-bold text-4xl leading-tight text-foreground">
              Free2Meet
            </Text>
            <Image
              accessibilityLabel="Free2Meet logo"
              className="h-28 w-28 rounded-3xl"
              contentFit="contain"
              source={require("@/assets/images/logo.png")}
            />
            <Text className="max-w-[300px] text-center font-outfit text-lg leading-relaxed text-muted-foreground">
              Hangouts made easy — find a time that works for everyone.
            </Text>
          </View>

          <View className="mt-16 w-full gap-3">
            <Button
              className="h-14 w-full rounded-2xl"
              onPress={() => router.push("/screens/signup")}
              size="lg"
            >
              Sign Up
            </Button>
            <Button
              className="h-14 w-full rounded-2xl border-2 border-primary bg-transparent"
              onPress={() => router.push("/screens/login")}
              size="lg"
              textClassName="text-primary"
              variant="outline"
            >
              Login
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
