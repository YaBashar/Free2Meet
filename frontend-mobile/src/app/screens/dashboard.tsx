/**
 * Dashboard screen (placeholder)
 *
 * Destination after a successful login, matching the web app's `/dashboard`.
 * Confirms the session is held and offers sign out. Replace with the event
 * list migration from the web app.
 */

import { router, Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

/** Temporary landing spot for signed-in members. */
export default function DashboardScreen() {
  const { session, signOut } = useAuth();

  /** Clears the session and returns to the unauthenticated landing screen. */
  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Welcome${session ? `, ${session.user.name}` : ""}`,
          headerBackVisible: false,
        }}
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center font-outfit text-base text-muted-foreground">
          Your events will appear here once the dashboard is migrated.
        </Text>

        <Button
          className="mt-8 h-14 w-full rounded-2xl border-2 border-primary bg-transparent"
          onPress={handleSignOut}
          size="lg"
          textClassName="text-primary"
          variant="outline"
        >
          Sign Out
        </Button>
      </View>
    </SafeAreaView>
  );
}
